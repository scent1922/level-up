import {
  getStreakMultiplier,
  calculateXPForQuest,
  getXPRequiredForLevel,
  checkLevelUp,
} from '../../services/xp-service';
import {
  BASE_XP_PER_QUEST,
  STREAK_7_MULTIPLIER,
  STREAK_30_MULTIPLIER,
} from '../../constants/balance';

describe('getStreakMultiplier', () => {
  it('returns 1.0 for streak < 7', () => {
    expect(getStreakMultiplier(0)).toBe(1.0);
    expect(getStreakMultiplier(6)).toBe(1.0);
  });

  it('returns STREAK_7_MULTIPLIER for streak 7-29', () => {
    expect(getStreakMultiplier(7)).toBe(STREAK_7_MULTIPLIER);
    expect(getStreakMultiplier(29)).toBe(STREAK_7_MULTIPLIER);
  });

  it('returns STREAK_30_MULTIPLIER for streak >= 30', () => {
    expect(getStreakMultiplier(30)).toBe(STREAK_30_MULTIPLIER);
    expect(getStreakMultiplier(100)).toBe(STREAK_30_MULTIPLIER);
  });
});

describe('calculateXPForQuest', () => {
  it('calculates base XP without streak', () => {
    expect(calculateXPForQuest(20, 0)).toBe(20);
    expect(calculateXPForQuest(20, 6)).toBe(20);
  });

  it('applies 1.5x multiplier for 7-day streak', () => {
    // 20 * 1.5 = 30
    expect(calculateXPForQuest(20, 7)).toBe(30);
    expect(calculateXPForQuest(20, 29)).toBe(30);
  });

  it('applies 2x multiplier for 30-day streak', () => {
    // 20 * 2.0 = 40
    expect(calculateXPForQuest(20, 30)).toBe(40);
    expect(calculateXPForQuest(20, 50)).toBe(40);
  });

  it('floors decimal results', () => {
    // 15 * 1.5 = 22.5 -> floor = 22
    expect(calculateXPForQuest(15, 7)).toBe(22);
  });
});

describe('getXPRequiredForLevel', () => {
  it('returns 100 for tier 1 (levels 1-10)', () => {
    expect(getXPRequiredForLevel(1)).toBe(100);
    expect(getXPRequiredForLevel(10)).toBe(100);
  });

  it('returns 200 for tier 2 (levels 11-25)', () => {
    expect(getXPRequiredForLevel(11)).toBe(200);
    expect(getXPRequiredForLevel(25)).toBe(200);
  });

  it('returns 350 for tier 3 (levels 26-50)', () => {
    expect(getXPRequiredForLevel(26)).toBe(350);
    expect(getXPRequiredForLevel(50)).toBe(350);
  });

  it('returns 500 for tier 4 (levels 51+)', () => {
    expect(getXPRequiredForLevel(51)).toBe(500);
    expect(getXPRequiredForLevel(999)).toBe(500);
  });
});

describe('checkLevelUp', () => {
  it('levels up from level 1 with exactly 100 XP', () => {
    const result = checkLevelUp(1, 100);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(2);
    expect(result.remainingXP).toBe(0);
    expect(result.levelsGained).toBe(1);
  });

  it('does not level up when XP is just below threshold', () => {
    const result = checkLevelUp(1, 99);
    expect(result.leveledUp).toBe(false);
    expect(result.newLevel).toBe(1);
    expect(result.remainingXP).toBe(99);
    expect(result.levelsGained).toBe(0);
  });

  it('handles multi-level-up (enough XP for 2+ levels)', () => {
    // Levels 1->2->3: 100 + 100 = 200 XP needed, give 250
    const result = checkLevelUp(1, 250);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(3);
    expect(result.remainingXP).toBe(50);
    expect(result.levelsGained).toBe(2);
  });

  it('handles level-up across tier boundary (level 10 -> 11)', () => {
    // Level 10 needs 100 XP, level 11 needs 200 XP
    // Give 350: level 10 -> 11 (100 used, 250 left), 11 -> 12 (200 used, 50 left)
    const result = checkLevelUp(10, 350);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(12);
    expect(result.remainingXP).toBe(50);
    expect(result.levelsGained).toBe(2);
  });

  it('does not level up with 0 XP', () => {
    const result = checkLevelUp(5, 0);
    expect(result.leveledUp).toBe(false);
    expect(result.newLevel).toBe(5);
    expect(result.remainingXP).toBe(0);
    expect(result.levelsGained).toBe(0);
  });

  it('handles XP correctly at tier 3->4 boundary (level 50 -> 51)', () => {
    // Level 50 needs 350 XP
    const result = checkLevelUp(50, 350);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBe(51);
    expect(result.remainingXP).toBe(0);
    expect(result.levelsGained).toBe(1);
  });
});
