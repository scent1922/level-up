import * as SQLite from 'expo-sqlite';
import { ALL_MIGRATIONS } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('levelup.db');
    await runMigrations(db);
    await seedShopItems(db);
  }
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  for (const sql of ALL_MIGRATIONS) {
    await database.runAsync(sql);
  }
}

async function seedShopItems(database: SQLite.SQLiteDatabase): Promise<void> {
  const existing = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM shop_items'
  );
  if (existing && existing.count > 0) return;

  const shelterSkins = [
    { id: 'skin_shelter_01', type: 'shelter_skin', name: '황무지 기지', price: 0, asset_key: 'shelter_skin_wasteland', unlock_level: null },
    { id: 'skin_shelter_02', type: 'shelter_skin', name: '사막 요새', price: 100, asset_key: 'shelter_skin_desert', unlock_level: 3 },
    { id: 'skin_shelter_03', type: 'shelter_skin', name: '설원 벙커', price: 200, asset_key: 'shelter_skin_snow', unlock_level: 5 },
    { id: 'skin_shelter_04', type: 'shelter_skin', name: '정글 은신처', price: 300, asset_key: 'shelter_skin_jungle', unlock_level: 8 },
    { id: 'skin_shelter_05', type: 'shelter_skin', name: '도시 폐허', price: 400, asset_key: 'shelter_skin_urban', unlock_level: 10 },
    { id: 'skin_shelter_06', type: 'shelter_skin', name: '해저 기지', price: 600, asset_key: 'shelter_skin_underwater', unlock_level: 15 },
    { id: 'skin_shelter_07', type: 'shelter_skin', name: '우주 정거장', price: 800, asset_key: 'shelter_skin_space', unlock_level: 20 },
    { id: 'skin_shelter_08', type: 'shelter_skin', name: '화산 요새', price: 1000, asset_key: 'shelter_skin_volcano', unlock_level: 25 },
    { id: 'skin_shelter_09', type: 'shelter_skin', name: '크리스탈 돔', price: 1500, asset_key: 'shelter_skin_crystal', unlock_level: 30 },
    { id: 'skin_shelter_10', type: 'shelter_skin', name: '황금 성채', price: 2000, asset_key: 'shelter_skin_golden', unlock_level: 40 },
  ];

  const avatarItems = [
    { id: 'avatar_outfit_01', type: 'avatar_outfit', name: '생존자 복장', price: 0, asset_key: 'avatar_outfit_survivor', unlock_level: null },
    { id: 'avatar_outfit_02', type: 'avatar_outfit', name: '사막 전투복', price: 150, asset_key: 'avatar_outfit_desert', unlock_level: 5 },
    { id: 'avatar_outfit_03', type: 'avatar_outfit', name: '방사능 슈트', price: 250, asset_key: 'avatar_outfit_hazmat', unlock_level: 8 },
    { id: 'avatar_outfit_04', type: 'avatar_outfit', name: '닌자 복장', price: 350, asset_key: 'avatar_outfit_ninja', unlock_level: 12 },
    { id: 'avatar_outfit_05', type: 'avatar_outfit', name: '사이버 슈트', price: 500, asset_key: 'avatar_outfit_cyber', unlock_level: 18 },
    { id: 'avatar_accessory_01', type: 'avatar_accessory', name: '방독면', price: 100, asset_key: 'avatar_acc_gasmask', unlock_level: null },
    { id: 'avatar_accessory_02', type: 'avatar_accessory', name: '야간 투시경', price: 200, asset_key: 'avatar_acc_nvg', unlock_level: 7 },
    { id: 'avatar_accessory_03', type: 'avatar_accessory', name: '에너지 실드', price: 400, asset_key: 'avatar_acc_shield', unlock_level: 15 },
    { id: 'avatar_accessory_04', type: 'avatar_accessory', name: '제트팩', price: 700, asset_key: 'avatar_acc_jetpack', unlock_level: 22 },
    { id: 'avatar_accessory_05', type: 'avatar_accessory', name: '홀로그램 투구', price: 1000, asset_key: 'avatar_acc_holo_helm', unlock_level: 30 },
  ];

  const allItems = [...shelterSkins, ...avatarItems];

  for (const item of allItems) {
    await database.runAsync(
      `INSERT INTO shop_items (id, type, name, price, asset_key, unlock_level)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.id, item.type, item.name, item.price, item.asset_key, item.unlock_level ?? null]
    );
  }
}
