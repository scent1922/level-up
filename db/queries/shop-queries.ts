import type { SQLiteDatabase } from 'expo-sqlite';
import type { ShopItem, PointTransaction, ShopItemType } from '@/types';

export async function getShopItems(db: SQLiteDatabase): Promise<ShopItem[]> {
  return db.getAllAsync<ShopItem>('SELECT * FROM shop_items ORDER BY type, price ASC');
}

export async function getShopItemsByType(
  db: SQLiteDatabase,
  type: ShopItemType
): Promise<ShopItem[]> {
  return db.getAllAsync<ShopItem>(
    'SELECT * FROM shop_items WHERE type = ? ORDER BY price ASC',
    [type]
  );
}

export async function getShopItemById(
  db: SQLiteDatabase,
  itemId: string
): Promise<ShopItem | null> {
  const row = await db.getFirstAsync<ShopItem>(
    'SELECT * FROM shop_items WHERE id = ?',
    [itemId]
  );
  return row ?? null;
}

export async function createPointTransaction(
  db: SQLiteDatabase,
  params: PointTransaction
): Promise<PointTransaction> {
  await db.runAsync(
    `INSERT INTO point_transactions (id, user_id, amount, reason, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [params.id, params.user_id, params.amount, params.reason, params.created_at]
  );
  const tx = await db.getFirstAsync<PointTransaction>(
    'SELECT * FROM point_transactions WHERE id = ?',
    [params.id]
  );
  if (!tx) throw new Error('Failed to create point transaction');
  return tx;
}

export async function getPointHistory(
  db: SQLiteDatabase,
  userId: string,
  limit = 50
): Promise<PointTransaction[]> {
  return db.getAllAsync<PointTransaction>(
    'SELECT * FROM point_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
}
