import type { SQLiteDatabase } from 'expo-sqlite';
import type { User } from '@/types';

export async function createUser(
  db: SQLiteDatabase,
  params: Omit<User, 'created_at'> & { created_at?: string }
): Promise<User> {
  const now = params.created_at ?? new Date().toISOString();
  await db.runAsync(
    `INSERT INTO users (id, level, xp, points, shelter_preset_id, avatar_preset_id, last_quest_completed_at, streak_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.id,
      params.level,
      params.xp,
      params.points,
      params.shelter_preset_id,
      params.avatar_preset_id,
      params.last_quest_completed_at ?? null,
      params.streak_count,
      now,
    ]
  );
  const user = await getUser(db);
  if (!user) throw new Error('Failed to create user');
  return user;
}

export async function getUser(db: SQLiteDatabase): Promise<User | null> {
  const row = await db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
  return row ?? null;
}

export async function updateUserXP(
  db: SQLiteDatabase,
  userId: string,
  xp: number
): Promise<void> {
  await db.runAsync('UPDATE users SET xp = ? WHERE id = ?', [xp, userId]);
}

export async function updateUserLevel(
  db: SQLiteDatabase,
  userId: string,
  level: number,
  xp: number
): Promise<void> {
  await db.runAsync('UPDATE users SET level = ?, xp = ? WHERE id = ?', [level, xp, userId]);
}

export async function updateUserPoints(
  db: SQLiteDatabase,
  userId: string,
  points: number
): Promise<void> {
  await db.runAsync('UPDATE users SET points = ? WHERE id = ?', [points, userId]);
}

export async function updateUserStreak(
  db: SQLiteDatabase,
  userId: string,
  streakCount: number,
  lastCompletedAt: string | null
): Promise<void> {
  await db.runAsync(
    'UPDATE users SET streak_count = ?, last_quest_completed_at = ? WHERE id = ?',
    [streakCount, lastCompletedAt, userId]
  );
}

export async function resetUser(db: SQLiteDatabase, userId: string): Promise<void> {
  await db.runAsync('DELETE FROM users WHERE id = ?', [userId]);
}
