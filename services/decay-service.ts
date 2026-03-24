import { DECAY_WARNING_DAYS, DECAY_DANGER_DAYS, DECAY_DESTROY_DAYS } from '../constants/balance';
import { DecayStage } from '../types';

export function calculateDecayStage(lastCompletedAt: Date | null, now: Date): DecayStage {
  if (!lastCompletedAt) return 0;
  const daysSince = Math.floor((now.getTime() - lastCompletedAt.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince >= DECAY_DESTROY_DAYS) return 3;
  if (daysSince >= DECAY_DANGER_DAYS) return 2;
  if (daysSince >= DECAY_WARNING_DAYS) return 1;
  return 0;
}

export function getDaysUntilDestruction(lastCompletedAt: Date | null, now: Date): number {
  if (!lastCompletedAt) return DECAY_DESTROY_DAYS;
  const daysSince = Math.floor((now.getTime() - lastCompletedAt.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, DECAY_DESTROY_DAYS - daysSince);
}

export function shouldShowWarningNotification(decayStage: DecayStage): boolean {
  return decayStage >= 2; // Show from danger stage onwards
}
