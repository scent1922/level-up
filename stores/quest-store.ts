import { create } from 'zustand';
import { getDatabase } from '@/db/database';
import {
  createQuest as dbCreateQuest,
  getQuests,
  getQuestById,
  updateQuest as dbUpdateQuest,
  deleteQuest as dbDeleteQuest,
} from '@/db/queries/quest-queries';
import { logQuestCompletion, getQuestLogsForDate, getWeeklyCompletionCount } from '@/db/queries/quest-log-queries';
import { useUserStore } from '@/stores/user-store';
import type { Quest } from '@/types';
import { BASE_XP_PER_QUEST, POINTS_DAILY_COMPLETE } from '@/constants/balance';
import {
  scheduleQuestReminder,
  cancelQuestReminder,
} from '@/services/notification-service';
import { isQuestDueToday, getWeekStart } from '@/services/quest-scheduler';

interface QuestStore {
  quests: Quest[];
  todayQuests: Quest[];
  notificationIds: Map<string, string>; // questId -> notificationId
  loadQuests: () => Promise<void>;
  createQuest: (params: Omit<Quest, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  updateQuest: (questId: string, updates: Partial<Quest>) => Promise<void>;
  deleteQuest: (questId: string) => Promise<void>;
  refreshTodayQuests: () => Promise<void>;
  checkDailyComplete: () => Promise<boolean>;
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  quests: [],
  todayQuests: [],
  notificationIds: new Map(),

  loadQuests: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const db = await getDatabase();
    const quests = await getQuests(db, user.id);
    set({ quests });
    await get().refreshTodayQuests();
  },

  createQuest: async (params) => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const db = await getDatabase();
    const id = `quest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const quest = await dbCreateQuest(db, {
      id,
      user_id: user.id,
      ...params,
    });
    set((state) => ({ quests: [...state.quests, quest] }));
    await get().refreshTodayQuests();

    // Schedule reminder if enabled
    if (quest.reminder_enabled && quest.reminder_time) {
      const [hourStr, minuteStr] = quest.reminder_time.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      try {
        const notifId = await scheduleQuestReminder(
          quest.id,
          quest.name,
          hour,
          minute,
          quest.frequency_type
        );
        set((state) => {
          const newMap = new Map(state.notificationIds);
          newMap.set(quest.id, notifId);
          return { notificationIds: newMap };
        });
      } catch (e) {
        console.warn('Failed to schedule quest reminder:', e);
      }
    }
  },

  completeQuest: async (questId: string) => {
    const { quests } = get();
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    const db = await getDatabase();
    const completedAt = new Date().toISOString();
    const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Log completion
    await logQuestCompletion(db, {
      id: logId,
      quest_id: questId,
      completed_at: completedAt,
      xp_earned: BASE_XP_PER_QUEST,
    });

    // Add XP via user-store (handles streak multiplier + level-up)
    const userStore = useUserStore.getState();
    await userStore.addXP(BASE_XP_PER_QUEST);

    // Update streak
    await userStore.updateStreak();

    // Check if all daily quests are now done
    const allDone = await get().checkDailyComplete();
    if (allDone) {
      await useUserStore.getState().addPoints(POINTS_DAILY_COMPLETE, 'daily_complete');
    }
  },

  updateQuest: async (questId: string, updates: Partial<Quest>) => {
    const db = await getDatabase();
    // Strip non-updatable fields
    const { id: _id, user_id: _uid, created_at: _ca, ...safeUpdates } = updates;
    await dbUpdateQuest(db, questId, safeUpdates);

    const updated = await getQuestById(db, questId);
    if (!updated) return;

    set((state) => ({
      quests: state.quests.map((q) => (q.id === questId ? updated : q)),
    }));
    await get().refreshTodayQuests();

    // Cancel old reminder if it exists
    const { notificationIds } = get();
    const existingNotifId = notificationIds.get(questId);
    if (existingNotifId) {
      try {
        await cancelQuestReminder(existingNotifId);
      } catch (e) {
        console.warn('Failed to cancel old quest reminder:', e);
      }
      set((state) => {
        const newMap = new Map(state.notificationIds);
        newMap.delete(questId);
        return { notificationIds: newMap };
      });
    }

    // Schedule new reminder if enabled
    if (updated.reminder_enabled && updated.reminder_time) {
      const [hourStr, minuteStr] = updated.reminder_time.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      try {
        const notifId = await scheduleQuestReminder(
          updated.id,
          updated.name,
          hour,
          minute,
          updated.frequency_type
        );
        set((state) => {
          const newMap = new Map(state.notificationIds);
          newMap.set(questId, notifId);
          return { notificationIds: newMap };
        });
      } catch (e) {
        console.warn('Failed to schedule updated quest reminder:', e);
      }
    }
  },

  deleteQuest: async (questId: string) => {
    // Cancel reminder before deleting
    const { notificationIds } = get();
    const existingNotifId = notificationIds.get(questId);
    if (existingNotifId) {
      try {
        await cancelQuestReminder(existingNotifId);
      } catch (e) {
        console.warn('Failed to cancel quest reminder on delete:', e);
      }
    }

    const db = await getDatabase();
    await dbDeleteQuest(db, questId);
    set((state) => {
      const newMap = new Map(state.notificationIds);
      newMap.delete(questId);
      return {
        quests: state.quests.filter((q) => q.id !== questId),
        todayQuests: state.todayQuests.filter((q) => q.id !== questId),
        notificationIds: newMap,
      };
    });
  },

  refreshTodayQuests: async () => {
    const { quests } = get();
    const today = new Date();
    const user = useUserStore.getState().user;

    const db = user ? await getDatabase() : null;
    const weekStart = getWeekStart(today).toISOString();

    const todayQuests: Quest[] = [];
    for (const q of quests) {
      let weeklyCompletions: number | undefined;
      if (q.frequency_type === 'n_per_week' && db) {
        weeklyCompletions = await getWeeklyCompletionCount(db, q.id, weekStart);
      }
      if (isQuestDueToday(q, today, weeklyCompletions)) {
        todayQuests.push(q);
      }
    }

    set({ todayQuests });
  },

  checkDailyComplete: async () => {
    const user = useUserStore.getState().user;
    if (!user) return false;

    const { todayQuests } = get();
    if (todayQuests.length === 0) return false;

    const db = await getDatabase();
    const today = new Date().toISOString().slice(0, 10);
    const logs = await getQuestLogsForDate(db, user.id, today);
    const completedIds = new Set(logs.map((l) => l.quest_id));

    return todayQuests.every((q) => completedIds.has(q.id));
  },
}));
