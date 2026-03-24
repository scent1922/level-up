import type { SQLiteDatabase } from 'expo-sqlite';
import type { AvatarState } from '@/types';

export async function createAvatarState(
  db: SQLiteDatabase,
  params: AvatarState
): Promise<AvatarState> {
  await db.runAsync(
    `INSERT INTO avatar_states (id, user_id, preset_id, equipped_items)
     VALUES (?, ?, ?, ?)`,
    [params.id, params.user_id, params.preset_id, params.equipped_items]
  );
  const state = await getAvatarState(db, params.user_id);
  if (!state) throw new Error('Failed to create avatar state');
  return state;
}

export async function getAvatarState(
  db: SQLiteDatabase,
  userId: string
): Promise<AvatarState | null> {
  const row = await db.getFirstAsync<AvatarState>(
    'SELECT * FROM avatar_states WHERE user_id = ?',
    [userId]
  );
  return row ?? null;
}

export async function equipItem(
  db: SQLiteDatabase,
  avatarId: string,
  itemId: string
): Promise<void> {
  const row = await db.getFirstAsync<{ equipped_items: string }>(
    'SELECT equipped_items FROM avatar_states WHERE id = ?',
    [avatarId]
  );
  if (!row) throw new Error('Avatar state not found');

  const items: string[] = JSON.parse(row.equipped_items);
  if (!items.includes(itemId)) {
    items.push(itemId);
  }

  await db.runAsync(
    'UPDATE avatar_states SET equipped_items = ? WHERE id = ?',
    [JSON.stringify(items), avatarId]
  );
}

export async function deleteAvatarState(
  db: SQLiteDatabase,
  userId: string
): Promise<void> {
  await db.runAsync('DELETE FROM avatar_states WHERE user_id = ?', [userId]);
}
