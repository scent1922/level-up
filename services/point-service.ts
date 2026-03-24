import { POINTS_DAILY_COMPLETE, POINTS_LEVEL_UP, POINTS_STREAK_7, REVIVAL_COST } from '../constants/balance';

export function calculateDailyCompleteReward(): number {
  return POINTS_DAILY_COMPLETE;
}

export function calculateLevelUpReward(): number {
  return POINTS_LEVEL_UP;
}

export function calculateStreakReward(streakCount: number): number {
  if (streakCount % 7 === 0) return POINTS_STREAK_7; // Every 7 days
  return 0;
}

export function getRevivalCost(consecutiveRevivals: number): number {
  return REVIVAL_COST * Math.pow(2, consecutiveRevivals); // Doubles each time
}

export function canAffordRevival(currentPoints: number, consecutiveRevivals: number): boolean {
  return currentPoints >= getRevivalCost(consecutiveRevivals);
}
