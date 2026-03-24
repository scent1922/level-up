import { isQuestDueToday, getWeekStart } from '../../services/quest-scheduler';
import { Quest } from '../../types';

function makeQuest(overrides: Partial<Quest>): Quest {
  return {
    id: 'q1',
    user_id: 'u1',
    name: 'Test Quest',
    description: null,
    frequency_type: 'daily',
    frequency_value: 'null',
    reminder_time: null,
    reminder_enabled: false,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('isQuestDueToday — inactive quest', () => {
  it('never due when quest is inactive', () => {
    const quest = makeQuest({ is_active: false, frequency_type: 'daily' });
    const today = new Date('2026-03-24T00:00:00Z');
    expect(isQuestDueToday(quest, today)).toBe(false);
  });
});

describe('isQuestDueToday — daily', () => {
  it('daily quest is always due', () => {
    const quest = makeQuest({ frequency_type: 'daily' });
    expect(isQuestDueToday(quest, new Date('2026-03-24'))).toBe(true);
    expect(isQuestDueToday(quest, new Date('2026-01-01'))).toBe(true);
  });
});

describe('isQuestDueToday — specific_days', () => {
  // 2026-03-24 is a Tuesday (day index 2)
  const tuesday = new Date('2026-03-24T00:00:00Z');
  // 2026-03-23 is a Monday (day index 1)
  const monday = new Date('2026-03-23T00:00:00Z');

  it('due on matching day', () => {
    const quest = makeQuest({
      frequency_type: 'specific_days',
      frequency_value: JSON.stringify([2]), // Tuesday
    });
    expect(isQuestDueToday(quest, tuesday)).toBe(true);
  });

  it('not due on non-matching day', () => {
    const quest = makeQuest({
      frequency_type: 'specific_days',
      frequency_value: JSON.stringify([2]), // Tuesday only
    });
    expect(isQuestDueToday(quest, monday)).toBe(false);
  });

  it('due when multiple days include today', () => {
    const quest = makeQuest({
      frequency_type: 'specific_days',
      frequency_value: JSON.stringify([1, 2, 3]), // Mon, Tue, Wed
    });
    expect(isQuestDueToday(quest, tuesday)).toBe(true);
    expect(isQuestDueToday(quest, monday)).toBe(true);
  });
});

describe('isQuestDueToday — every_n_days', () => {
  // created_at: 2026-01-01
  // today: 2026-03-24 = 82 days later

  it('due when daysSinceCreated % n === 0', () => {
    // 82 % 2 === 0
    const quest = makeQuest({
      frequency_type: 'every_n_days',
      frequency_value: JSON.stringify(2),
      created_at: '2026-01-01T00:00:00Z',
    });
    const today = new Date('2026-03-24T00:00:00Z'); // 82 days after Jan 1
    expect(isQuestDueToday(quest, today)).toBe(true);
  });

  it('not due when daysSinceCreated % n !== 0', () => {
    // 82 % 3 = 1 (not 0)
    const quest = makeQuest({
      frequency_type: 'every_n_days',
      frequency_value: JSON.stringify(3),
      created_at: '2026-01-01T00:00:00Z',
    });
    const today = new Date('2026-03-24T00:00:00Z');
    expect(isQuestDueToday(quest, today)).toBe(false);
  });

  it('due on day 0 (creation day)', () => {
    const quest = makeQuest({
      frequency_type: 'every_n_days',
      frequency_value: JSON.stringify(5),
      created_at: '2026-03-24T00:00:00Z',
    });
    const today = new Date('2026-03-24T00:00:00Z'); // 0 days since created
    expect(isQuestDueToday(quest, today)).toBe(true);
  });
});

describe('isQuestDueToday — n_per_week', () => {
  const today = new Date('2026-03-24T00:00:00Z');

  it('due when weeklyCompletions < n', () => {
    const quest = makeQuest({
      frequency_type: 'n_per_week',
      frequency_value: JSON.stringify(3),
    });
    expect(isQuestDueToday(quest, today, 0)).toBe(true);
    expect(isQuestDueToday(quest, today, 2)).toBe(true);
  });

  it('not due when weeklyCompletions >= n', () => {
    const quest = makeQuest({
      frequency_type: 'n_per_week',
      frequency_value: JSON.stringify(3),
    });
    expect(isQuestDueToday(quest, today, 3)).toBe(false);
    expect(isQuestDueToday(quest, today, 5)).toBe(false);
  });

  it('defaults to 0 completions when weeklyCompletions is undefined', () => {
    const quest = makeQuest({
      frequency_type: 'n_per_week',
      frequency_value: JSON.stringify(3),
    });
    expect(isQuestDueToday(quest, today, undefined)).toBe(true);
  });
});

describe('getWeekStart', () => {
  it('returns Monday for a Tuesday', () => {
    const tuesday = new Date('2026-03-24T12:00:00Z'); // Tuesday
    const weekStart = getWeekStart(tuesday);
    expect(weekStart.getDay()).toBe(1); // Monday
    expect(weekStart.getHours()).toBe(0);
    expect(weekStart.getMinutes()).toBe(0);
  });

  it('returns Monday for a Sunday (previous Monday)', () => {
    const sunday = new Date('2026-03-22T12:00:00Z'); // Sunday
    const weekStart = getWeekStart(sunday);
    expect(weekStart.getDay()).toBe(1); // Monday
  });

  it('returns the same Monday for a Monday', () => {
    const monday = new Date('2026-03-23T12:00:00Z'); // Monday
    const weekStart = getWeekStart(monday);
    expect(weekStart.getDay()).toBe(1);
    expect(weekStart.getDate()).toBe(23);
  });
});
