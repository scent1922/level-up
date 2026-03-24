// XP
export const BASE_XP_PER_QUEST = 20;
export const DAILY_COMPLETE_BONUS_XP = 30;
export const STREAK_7_MULTIPLIER = 1.5;
export const STREAK_30_MULTIPLIER = 2.0;

// Level XP tiers
export const XP_TIERS = [
  { minLevel: 1, maxLevel: 10, xpPerLevel: 100 },
  { minLevel: 11, maxLevel: 25, xpPerLevel: 200 },
  { minLevel: 26, maxLevel: 50, xpPerLevel: 350 },
  { minLevel: 51, maxLevel: Infinity, xpPerLevel: 500 },
];

// Points
export const POINTS_DAILY_COMPLETE = 50;
export const POINTS_LEVEL_UP = 100;
export const POINTS_STREAK_7 = 200;
export const REVIVAL_COST = 500;

// Decay
export const DECAY_WARNING_DAYS = 7;
export const DECAY_DANGER_DAYS = 10;
export const DECAY_DESTROY_DAYS = 14;

// Shelter upgrades (level -> facility unlock)
export const SHELTER_UPGRADES = [
  { level: 1, type: 'base', facility: 'basic_shelter', name: '기본 쉘터' },
  { level: 5, type: 'facility', facility: 'generator', name: '발전기' },
  { level: 10, type: 'facility', facility: 'water_purifier', name: '정수 장치' },
  { level: 15, type: 'expansion', facility: 'expansion_2', name: '쉘터 확장 (방 2개)' },
  { level: 20, type: 'facility', facility: 'indoor_farm', name: '실내 재배 시설' },
  { level: 25, type: 'facility', facility: 'bed_upgrade', name: '수면 장비 강화' },
  { level: 30, type: 'expansion', facility: 'expansion_3', name: '쉘터 확장 (방 3개)' },
  { level: 35, type: 'facility', facility: 'entertainment', name: '엔터테인먼트 장비' },
  { level: 40, type: 'facility', facility: 'workbench', name: '작업대/워크벤치' },
  { level: 50, type: 'expansion', facility: 'expansion_final', name: '쉘터 최종 확장' },
];
