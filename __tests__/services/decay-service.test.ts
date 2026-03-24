import {
  calculateDecayStage,
  getDaysUntilDestruction,
  shouldShowWarningNotification,
} from '../../services/decay-service';
import { DECAY_DESTROY_DAYS } from '../../constants/balance';
import { DecayStage } from '../../types';

// Helper: create a date N days before `now`
function daysAgo(n: number, now: Date = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
}

describe('calculateDecayStage', () => {
  const now = new Date('2026-03-24T12:00:00Z');

  it('returns 0 (normal) when null lastCompletedAt', () => {
    expect(calculateDecayStage(null, now)).toBe(0);
  });

  it('returns 0 at day 0 (completed today)', () => {
    expect(calculateDecayStage(daysAgo(0, now), now)).toBe(0);
  });

  it('returns 0 at day 6 (before warning threshold)', () => {
    expect(calculateDecayStage(daysAgo(6, now), now)).toBe(0);
  });

  it('returns 1 (warning) at day 7', () => {
    expect(calculateDecayStage(daysAgo(7, now), now)).toBe(1);
  });

  it('returns 1 (warning) at day 9', () => {
    expect(calculateDecayStage(daysAgo(9, now), now)).toBe(1);
  });

  it('returns 2 (danger) at day 10', () => {
    expect(calculateDecayStage(daysAgo(10, now), now)).toBe(2);
  });

  it('returns 2 (danger) at day 13', () => {
    expect(calculateDecayStage(daysAgo(13, now), now)).toBe(2);
  });

  it('returns 3 (destroyed) at day 14', () => {
    expect(calculateDecayStage(daysAgo(14, now), now)).toBe(3);
  });

  it('returns 3 (destroyed) for very long neglect', () => {
    expect(calculateDecayStage(daysAgo(100, now), now)).toBe(3);
  });
});

describe('getDaysUntilDestruction', () => {
  const now = new Date('2026-03-24T12:00:00Z');

  it('returns DECAY_DESTROY_DAYS when lastCompletedAt is null', () => {
    expect(getDaysUntilDestruction(null, now)).toBe(DECAY_DESTROY_DAYS);
  });

  it('returns 14 days when just completed', () => {
    expect(getDaysUntilDestruction(daysAgo(0, now), now)).toBe(14);
  });

  it('returns correct countdown as days pass', () => {
    expect(getDaysUntilDestruction(daysAgo(7, now), now)).toBe(7);
    expect(getDaysUntilDestruction(daysAgo(10, now), now)).toBe(4);
    expect(getDaysUntilDestruction(daysAgo(13, now), now)).toBe(1);
  });

  it('returns 0 once destroyed (days >= 14)', () => {
    expect(getDaysUntilDestruction(daysAgo(14, now), now)).toBe(0);
    expect(getDaysUntilDestruction(daysAgo(30, now), now)).toBe(0);
  });
});

describe('shouldShowWarningNotification', () => {
  it('returns false for stage 0 (normal)', () => {
    expect(shouldShowWarningNotification(0)).toBe(false);
  });

  it('returns false for stage 1 (warning)', () => {
    expect(shouldShowWarningNotification(1)).toBe(false);
  });

  it('returns true for stage 2 (danger)', () => {
    expect(shouldShowWarningNotification(2)).toBe(true);
  });

  it('returns true for stage 3 (destroyed)', () => {
    expect(shouldShowWarningNotification(3)).toBe(true);
  });
});
