import { create } from 'zustand';
import { getDatabase } from '@/db/database';
import {
  createUser,
  getUser,
  updateUserXP,
  updateUserLevel,
  updateUserPoints,
  updateUserStreak,
  resetUser as dbResetUser,
} from '@/db/queries/user-queries';
import type { User, PointReason } from '@/types';
import {
  XP_TIERS,
  STREAK_7_MULTIPLIER,
  STREAK_30_MULTIPLIER,
  POINTS_LEVEL_UP,
} from '@/constants/balance';
import {
  sendLevelUpNotification,
  sendStreakMilestoneNotification,
} from '@/services/notification-service';

function getXpForLevel(level: number): number {
  const tier = XP_TIERS.find((t) => level >= t.minLevel && level <= t.maxLevel);
  return tier ? tier.xpPerLevel : 500;
}

function getStreakMultiplier(streakCount: number): number {
  if (streakCount >= 30) return STREAK_30_MULTIPLIER;
  if (streakCount >= 7) return STREAK_7_MULTIPLIER;
  return 1.0;
}

interface UserStore {
  user: User | null;
  isOnboarded: boolean;
  loadUser: () => Promise<void>;
  createNewUser: (shelterPresetId: string, avatarPresetId: string) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  addPoints: (amount: number, reason: PointReason) => Promise<void>;
  spendPoints: (amount: number, reason: PointReason) => Promise<boolean>;
  updateStreak: () => Promise<void>;
  resetUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isOnboarded: false,

  loadUser: async () => {
    const db = await getDatabase();
    const user = await getUser(db);
    set({ user, isOnboarded: user !== null });
  },

  createNewUser: async (shelterPresetId: string, avatarPresetId: string) => {
    const db = await getDatabase();
    const id = `user_${Date.now()}`;
    const user = await createUser(db, {
      id,
      level: 1,
      xp: 0,
      points: 0,
      shelter_preset_id: shelterPresetId,
      avatar_preset_id: avatarPresetId,
      last_quest_completed_at: null,
      streak_count: 1,
    });
    set({ user, isOnboarded: true });
  },

  addXP: async (amount: number) => {
    const { user } = get();
    if (!user) return;

    const db = await getDatabase();
    const multiplier = getStreakMultiplier(user.streak_count);
    const gained = Math.round(amount * multiplier);
    let newXp = user.xp + gained;
    let newLevel = user.level;
    let newPoints = user.points;

    // Handle level-up(s)
    let leveledUp = false;
    let xpForCurrentLevel = getXpForLevel(newLevel);
    while (newXp >= xpForCurrentLevel) {
      newXp -= xpForCurrentLevel;
      newLevel += 1;
      newPoints += POINTS_LEVEL_UP;
      leveledUp = true;
      xpForCurrentLevel = getXpForLevel(newLevel);
    }

    if (leveledUp) {
      await updateUserLevel(db, user.id, newLevel, newXp);
      await updateUserPoints(db, user.id, newPoints);
      sendLevelUpNotification(newLevel).catch((e) =>
        console.warn('Failed to send level-up notification:', e)
      );
    } else {
      await updateUserXP(db, user.id, newXp);
    }

    set({
      user: {
        ...user,
        xp: newXp,
        level: newLevel,
        points: newPoints,
      },
    });
  },

  addPoints: async (amount: number, _reason: PointReason) => {
    const { user } = get();
    if (!user) return;

    const db = await getDatabase();
    const newPoints = user.points + amount;
    await updateUserPoints(db, user.id, newPoints);
    set({ user: { ...user, points: newPoints } });
  },

  spendPoints: async (amount: number, _reason: PointReason) => {
    const { user } = get();
    if (!user) return false;
    if (user.points < amount) return false;

    const db = await getDatabase();
    const newPoints = user.points - amount;
    await updateUserPoints(db, user.id, newPoints);
    set({ user: { ...user, points: newPoints } });
    return true;
  },

  updateStreak: async () => {
    const { user } = get();
    if (!user) return;

    const db = await getDatabase();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    let newStreak = user.streak_count;

    if (user.last_quest_completed_at) {
      const lastDate = user.last_quest_completed_at.slice(0, 10);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (lastDate === yesterdayStr) {
        newStreak = user.streak_count + 1;
      } else if (lastDate === today) {
        // Already updated today — don't change streak
        newStreak = user.streak_count;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const lastCompletedAt = now.toISOString();
    await updateUserStreak(db, user.id, newStreak, lastCompletedAt);

    // Fire streak milestone notifications at 7 and 30 days
    if (newStreak === 7 || newStreak === 30) {
      sendStreakMilestoneNotification(newStreak).catch((e) =>
        console.warn('Failed to send streak milestone notification:', e)
      );
    }

    set({
      user: {
        ...user,
        streak_count: newStreak,
        last_quest_completed_at: lastCompletedAt,
      },
    });
  },

  resetUser: async () => {
    const { user } = get();
    if (!user) return;

    const db = await getDatabase();
    await dbResetUser(db, user.id);
    set({ user: null, isOnboarded: false });
  },
}));
