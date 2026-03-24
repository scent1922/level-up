import type { SQLiteDatabase } from 'expo-sqlite';
import type { QuestLog } from '@/types';

export async function logQuestCompletion(
  db: SQLiteDatabase,
  params: QuestLog
): Promise<QuestLog> {
  await db.runAsync(
    `INSERT INTO quest_logs (id, quest_id, completed_at, xp_earned)
     VALUES (?, ?, ?, ?)`,
    [params.id, params.quest_id, params.completed_at, params.xp_earned]
  );
  const log = await db.getFirstAsync<QuestLog>(
    'SELECT * FROM quest_logs WHERE id = ?',
    [params.id]
  );
  if (!log) throw new Error('Failed to log quest completion');
  return log;
}

export async function getQuestLogsForDate(
  db: SQLiteDatabase,
  userId: string,
  date: string // YYYY-MM-DD
): Promise<QuestLog[]> {
  return db.getAllAsync<QuestLog>(
    `SELECT ql.* FROM quest_logs ql
     INNER JOIN quests q ON ql.quest_id = q.id
     WHERE q.user_id = ? AND ql.completed_at LIKE ?
     ORDER BY ql.completed_at DESC`,
    [userId, `${date}%`]
  );
}

export async function getQuestLogsByRange(
  db: SQLiteDatabase,
  userId: string,
  startDate: string,
  endDate: string
): Promise<QuestLog[]> {
  return db.getAllAsync<QuestLog>(
    `SELECT ql.* FROM quest_logs ql
     INNER JOIN quests q ON ql.quest_id = q.id
     WHERE q.user_id = ? AND ql.completed_at >= ? AND ql.completed_at <= ?
     ORDER BY ql.completed_at DESC`,
    [userId, startDate, endDate]
  );
}

export async function getWeeklyCompletionCount(
  db: SQLiteDatabase,
  questId: string,
  weekStart: string // ISO datetime for start of week
): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM quest_logs
     WHERE quest_id = ? AND completed_at >= ?`,
    [questId, weekStart]
  );
  return row?.count ?? 0;
}

export async function deleteQuestLogsByUser(
  db: SQLiteDatabase,
  userId: string
): Promise<void> {
  await db.runAsync(
    `DELETE FROM quest_logs WHERE quest_id IN (
       SELECT id FROM quests WHERE user_id = ?
     )`,
    [userId]
  );
}
