import type { SQLiteDatabase } from 'expo-sqlite';
import type { Quest } from '@/types';

type QuestRow = Omit<Quest, 'reminder_enabled' | 'is_active'> & {
  reminder_enabled: number;
  is_active: number;
};

function rowToQuest(row: QuestRow): Quest {
  return {
    ...row,
    reminder_enabled: row.reminder_enabled === 1,
    is_active: row.is_active === 1,
  };
}

export async function createQuest(
  db: SQLiteDatabase,
  params: Omit<Quest, 'created_at'> & { created_at?: string }
): Promise<Quest> {
  const now = params.created_at ?? new Date().toISOString();
  await db.runAsync(
    `INSERT INTO quests (id, user_id, name, description, frequency_type, frequency_value, reminder_time, reminder_enabled, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.id,
      params.user_id,
      params.name,
      params.description ?? null,
      params.frequency_type,
      params.frequency_value,
      params.reminder_time ?? null,
      params.reminder_enabled ? 1 : 0,
      params.is_active ? 1 : 0,
      now,
    ]
  );
  const quest = await getQuestById(db, params.id);
  if (!quest) throw new Error('Failed to create quest');
  return quest;
}

export async function getQuests(db: SQLiteDatabase, userId: string): Promise<Quest[]> {
  const rows = await db.getAllAsync<QuestRow>(
    'SELECT * FROM quests WHERE user_id = ? AND is_active = 1 ORDER BY created_at ASC',
    [userId]
  );
  return rows.map(rowToQuest);
}

export async function getQuestById(
  db: SQLiteDatabase,
  questId: string
): Promise<Quest | null> {
  const row = await db.getFirstAsync<QuestRow>(
    'SELECT * FROM quests WHERE id = ?',
    [questId]
  );
  return row ? rowToQuest(row) : null;
}

export async function updateQuest(
  db: SQLiteDatabase,
  questId: string,
  updates: Partial<Omit<Quest, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.frequency_type !== undefined) { fields.push('frequency_type = ?'); values.push(updates.frequency_type); }
  if (updates.frequency_value !== undefined) { fields.push('frequency_value = ?'); values.push(updates.frequency_value); }
  if (updates.reminder_time !== undefined) { fields.push('reminder_time = ?'); values.push(updates.reminder_time); }
  if (updates.reminder_enabled !== undefined) { fields.push('reminder_enabled = ?'); values.push(updates.reminder_enabled ? 1 : 0); }
  if (updates.is_active !== undefined) { fields.push('is_active = ?'); values.push(updates.is_active ? 1 : 0); }

  if (fields.length === 0) return;
  values.push(questId);
  await db.runAsync(`UPDATE quests SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteQuest(db: SQLiteDatabase, questId: string): Promise<void> {
  await db.runAsync('DELETE FROM quests WHERE id = ?', [questId]);
}

export async function deactivateAllQuests(db: SQLiteDatabase, userId: string): Promise<void> {
  await db.runAsync('UPDATE quests SET is_active = 0 WHERE user_id = ?', [userId]);
}
