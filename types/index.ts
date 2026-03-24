export type FrequencyType = 'daily' | 'specific_days' | 'every_n_days' | 'n_per_week';
export type ShopItemType = 'shelter_skin' | 'avatar_outfit' | 'avatar_accessory' | 'facility_skin';
export type PointReason = 'daily_complete' | 'level_up' | 'streak' | 'purchase' | 'revival';
export type DecayStage = 0 | 1 | 2 | 3; // 정상/열화시작/심각/파괴

export interface User {
  id: string;
  level: number;
  xp: number;
  points: number;
  shelter_preset_id: string;
  avatar_preset_id: string;
  last_quest_completed_at: string | null; // ISO datetime
  streak_count: number;
  created_at: string;
}

export interface Quest {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency_type: FrequencyType;
  frequency_value: string; // JSON string (day array / day count / weekly count)
  reminder_time: string | null; // HH:mm format
  reminder_enabled: boolean;
  is_active: boolean;
  created_at: string;
}

export interface QuestLog {
  id: string;
  quest_id: string;
  completed_at: string;
  xp_earned: number;
}

export interface ShelterState {
  id: string;
  user_id: string;
  preset_id: string;
  expansion_level: number;
  installed_facilities: string; // JSON string
  applied_skins: string; // JSON string
  decay_stage: DecayStage;
}

export interface AvatarState {
  id: string;
  user_id: string;
  preset_id: string;
  equipped_items: string; // JSON string
}

export interface ShopItem {
  id: string;
  type: ShopItemType;
  name: string;
  price: number;
  asset_key: string;
  unlock_level: number | null;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number; // positive=earn, negative=spend
  reason: PointReason;
  created_at: string;
}
