import { Quest, FrequencyType } from '../types';

export function isQuestDueToday(quest: Quest, today: Date, weeklyCompletions?: number): boolean {
  if (!quest.is_active) return false;

  switch (quest.frequency_type) {
    case 'daily':
      return true;

    case 'specific_days': {
      const days: number[] = JSON.parse(quest.frequency_value); // [0=Sun, 1=Mon, ..., 6=Sat]
      return days.includes(today.getDay());
    }

    case 'every_n_days': {
      const n = JSON.parse(quest.frequency_value); // number
      const createdDate = new Date(quest.created_at);
      const daysSinceCreated = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreated % n === 0;
    }

    case 'n_per_week': {
      const n = JSON.parse(quest.frequency_value); // number
      const completions = weeklyCompletions ?? 0;
      return completions < n;
    }

    default:
      return false;
  }
}

// Helper: get start of current week (Monday)
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
