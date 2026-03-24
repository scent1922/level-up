import { create } from 'zustand';
import { getDatabase } from '@/db/database';
import {
  createQuest as dbCreateQuest,
  getQuests,
  getQuestById,
  updateQuest as dbUpdateQuest,
  deleteQuest as dbDeleteQuest,
} from '@/db/queries/quest-queries';
import { logQuestCompletion, getQuestLogsForDate } from '@/db/queries/quest-log-queries';
import { useUserStore } from '@/stores/user-store';
import type { Quest } from '@/types';
import { BASE_XP_PER_QUEST, POINTS_DAILY_COMPLETE } from '@/constants/balance';

interface QuestStore {
  quests: Quest[];
  todayQuests: Quest[];
  loadQuests: () => Promise<void>;
  createQuest: (params: Omit<Quest, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  updateQuest: (questId: string, updates: Partial<Quest>) => Promise<void>;
  deleteQuest: (questId: string) => Promise<void>;
  refreshTodayQuests: () => void;
  checkDailyComplete: () => Promise<boolean>;
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  quests: [],
  todayQuests: [],

  loadQuests: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    const db = await getDatabase();
    const quests = await getQuests(db, user.id);
    set({ quests });
    get().refreshTodayQuests();
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
    get().refreshTodayQuests();
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
    get().refreshTodayQuests();
  },

  deleteQuest: async (questId: string) => {
    const db = await getDatabase();
    await dbDeleteQuest(db, questId);
    set((state) => ({
      quests: state.quests.filter((q) => q.id !== questId),
      todayQuests: state.todayQuests.filter((q) => q.id !== questId),
    }));
  },

  refreshTodayQuests: () => {
    const { quests } = get();
    // Placeholder: Task 5 will implement full quest-scheduler logic.
    // For now, show all active daily quests.
    const todayQuests = quests.filter(
      (q) => q.is_active && q.frequency_type === 'daily'
    );
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
