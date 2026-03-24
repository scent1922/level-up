export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    shelter_preset_id TEXT NOT NULL,
    avatar_preset_id TEXT NOT NULL,
    last_quest_completed_at TEXT,
    streak_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`;

export const CREATE_QUESTS_TABLE = `
  CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    frequency_type TEXT NOT NULL,
    frequency_value TEXT NOT NULL,
    reminder_time TEXT,
    reminder_enabled INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

export const CREATE_QUEST_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS quest_logs (
    id TEXT PRIMARY KEY NOT NULL,
    quest_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (quest_id) REFERENCES quests(id)
  );
`;

export const CREATE_SHELTER_STATES_TABLE = `
  CREATE TABLE IF NOT EXISTS shelter_states (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL UNIQUE,
    preset_id TEXT NOT NULL,
    expansion_level INTEGER NOT NULL DEFAULT 1,
    installed_facilities TEXT NOT NULL DEFAULT '[]',
    applied_skins TEXT NOT NULL DEFAULT '{}',
    decay_stage INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

export const CREATE_AVATAR_STATES_TABLE = `
  CREATE TABLE IF NOT EXISTS avatar_states (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL UNIQUE,
    preset_id TEXT NOT NULL,
    equipped_items TEXT NOT NULL DEFAULT '[]',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

export const CREATE_SHOP_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS shop_items (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    asset_key TEXT NOT NULL,
    unlock_level INTEGER
  );
`;

export const CREATE_POINT_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS point_transactions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

export const ALL_MIGRATIONS = [
  CREATE_USERS_TABLE,
  CREATE_QUESTS_TABLE,
  CREATE_QUEST_LOGS_TABLE,
  CREATE_SHELTER_STATES_TABLE,
  CREATE_AVATAR_STATES_TABLE,
  CREATE_SHOP_ITEMS_TABLE,
  CREATE_POINT_TRANSACTIONS_TABLE,
];
