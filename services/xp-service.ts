import { BASE_XP_PER_QUEST, XP_TIERS, STREAK_7_MULTIPLIER, STREAK_30_MULTIPLIER } from '../constants/balance';

export function getStreakMultiplier(streakCount: number): number {
  if (streakCount >= 30) return STREAK_30_MULTIPLIER;
  if (streakCount >= 7) return STREAK_7_MULTIPLIER;
  return 1.0;
}

export function calculateXPForQuest(baseXP: number, streakCount: number): number {
  return Math.floor(baseXP * getStreakMultiplier(streakCount));
}

export function getXPRequiredForLevel(level: number): number {
  const tier = XP_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel);
  return tier ? tier.xpPerLevel : XP_TIERS[XP_TIERS.length - 1].xpPerLevel;
}

export function checkLevelUp(currentLevel: number, currentXP: number): {
  leveledUp: boolean;
  newLevel: number;
  remainingXP: number;
  levelsGained: number;
} {
  let level = currentLevel;
  let xp = currentXP;
  let levelsGained = 0;

  while (xp >= getXPRequiredForLevel(level)) {
    xp -= getXPRequiredForLevel(level);
    level++;
    levelsGained++;
  }

  return {
    leveledUp: levelsGained > 0,
    newLevel: level,
    remainingXP: xp,
    levelsGained,
  };
}
