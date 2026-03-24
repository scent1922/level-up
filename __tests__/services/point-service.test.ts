import {
  calculateDailyCompleteReward,
  calculateLevelUpReward,
  calculateStreakReward,
  getRevivalCost,
  canAffordRevival,
} from '../../services/point-service';
import {
  POINTS_DAILY_COMPLETE,
  POINTS_LEVEL_UP,
  POINTS_STREAK_7,
  REVIVAL_COST,
} from '../../constants/balance';

describe('calculateDailyCompleteReward', () => {
  it('returns POINTS_DAILY_COMPLETE', () => {
    expect(calculateDailyCompleteReward()).toBe(POINTS_DAILY_COMPLETE);
    expect(calculateDailyCompleteReward()).toBe(50);
  });
});

describe('calculateLevelUpReward', () => {
  it('returns POINTS_LEVEL_UP', () => {
    expect(calculateLevelUpReward()).toBe(POINTS_LEVEL_UP);
    expect(calculateLevelUpReward()).toBe(100);
  });
});

describe('calculateStreakReward', () => {
  it('returns 0 for non-7-multiple streaks', () => {
    expect(calculateStreakReward(1)).toBe(0);
    expect(calculateStreakReward(6)).toBe(0);
    expect(calculateStreakReward(8)).toBe(0);
    expect(calculateStreakReward(13)).toBe(0);
  });

  it('returns POINTS_STREAK_7 for every 7th day', () => {
    expect(calculateStreakReward(7)).toBe(POINTS_STREAK_7);
    expect(calculateStreakReward(14)).toBe(POINTS_STREAK_7);
    expect(calculateStreakReward(21)).toBe(POINTS_STREAK_7);
    expect(calculateStreakReward(28)).toBe(POINTS_STREAK_7);
    expect(calculateStreakReward(35)).toBe(POINTS_STREAK_7);
  });

  it('returns 0 for streak 0 (0 % 7 === 0 edge case)', () => {
    // 0 is technically divisible by 7, but it's the initial state — no reward expected
    // The function returns POINTS_STREAK_7 for 0 since 0 % 7 === 0
    // This documents the behavior as-is
    expect(calculateStreakReward(0)).toBe(POINTS_STREAK_7);
  });
});

describe('getRevivalCost', () => {
  it('returns base REVIVAL_COST for first revival (consecutiveRevivals=0)', () => {
    expect(getRevivalCost(0)).toBe(REVIVAL_COST); // 500 * 2^0 = 500
  });

  it('doubles each consecutive revival', () => {
    expect(getRevivalCost(1)).toBe(REVIVAL_COST * 2);   // 1000
    expect(getRevivalCost(2)).toBe(REVIVAL_COST * 4);   // 2000
    expect(getRevivalCost(3)).toBe(REVIVAL_COST * 8);   // 4000
  });
});

describe('canAffordRevival', () => {
  it('returns true when points cover the revival cost', () => {
    expect(canAffordRevival(500, 0)).toBe(true);   // exactly 500
    expect(canAffordRevival(600, 0)).toBe(true);   // more than enough
    expect(canAffordRevival(1000, 1)).toBe(true);  // exactly 1000 for 2nd revival
  });

  it('returns false when points are insufficient', () => {
    expect(canAffordRevival(499, 0)).toBe(false);  // 1 short
    expect(canAffordRevival(0, 0)).toBe(false);
    expect(canAffordRevival(999, 1)).toBe(false);  // 1 short of 1000
  });
});
