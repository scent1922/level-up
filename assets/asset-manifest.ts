import { ImageSourcePropType } from 'react-native';

// Background images (behind shelter, no transparency)
export const BackgroundAssets: Record<string, ImageSourcePropType> = {
  city: require('./backgrounds/bg_city.png'),
  coast: require('./backgrounds/bg_coast.png'),
  forest: require('./backgrounds/bg_forest.png'),
  desert: require('./backgrounds/bg_desert.png'),
};

// Sprite sheets (5 frames: idle, walk1, walk2, walk1-mirror, walk2-mirror)
export const AvatarSprites: Record<string, ImageSourcePropType> = {
  survivor_a: require('./avatars/sprites/sprite_a.png'),
  survivor_b: require('./avatars/sprites/sprite_b.png'),
  survivor_c: require('./avatars/sprites/sprite_c.png'),
  survivor_d: require('./avatars/sprites/sprite_d.png'),
};

export function getBackground(presetId: string): ImageSourcePropType {
  return BackgroundAssets[presetId] ?? BackgroundAssets.city;
}

export function getAvatarSprite(presetId: string): ImageSourcePropType {
  return AvatarSprites[presetId] ?? AvatarSprites.survivor_a;
}

export const ShelterAssets: Record<string, Record<number, ImageSourcePropType>> = {
  city: {
    1: require('./shelters/shelter_city_1.png'),
    2: require('./shelters/shelter_city_2.png'),
    3: require('./shelters/shelter_city_3.png'),
  },
  coast: {
    1: require('./shelters/shelter_coast_1.png'),
    2: require('./shelters/shelter_coast_2.png'),
    3: require('./shelters/shelter_coast_3.png'),
  },
  forest: {
    1: require('./shelters/shelter_forest_1.png'),
    2: require('./shelters/shelter_forest_2.png'),
    3: require('./shelters/shelter_forest_3.png'),
  },
  desert: {
    1: require('./shelters/shelter_desert_1.png'),
    2: require('./shelters/shelter_desert_2.png'),
    3: require('./shelters/shelter_desert_3.png'),
  },
};

export const AvatarPortraits: Record<string, ImageSourcePropType> = {
  survivor_a: require('./avatars/avatar_a.png'),
  survivor_b: require('./avatars/avatar_b.png'),
  survivor_c: require('./avatars/avatar_c.png'),
  survivor_d: require('./avatars/avatar_d.png'),
};

export const AvatarIngame: Record<string, ImageSourcePropType> = {
  survivor_a: require('./avatars/ingame/avatar_a_ingame.png'),
  survivor_b: require('./avatars/ingame/avatar_b_ingame.png'),
  survivor_c: require('./avatars/ingame/avatar_c_ingame.png'),
  survivor_d: require('./avatars/ingame/avatar_d_ingame.png'),
};

export const FacilityAssets: Record<string, ImageSourcePropType> = {
  generator: require('./facilities/generator.png'),
  water_purifier: require('./facilities/water_purifier.png'),
  indoor_farm: require('./facilities/indoor_farm.png'),
  bed_basic: require('./facilities/bed_basic.png'),
  bed_upgraded: require('./facilities/bed_upgraded.png'),
  entertainment: require('./facilities/entertainment.png'),
  speaker: require('./facilities/speaker.png'),
  workbench: require('./facilities/workbench.png'),
};

export const UIAssets = {
  appIcon: require('./ui/app_icon.png'),
  coinIcon: require('./ui/coin_icon.png'),
  xpIcon: require('./ui/xp_icon.png'),
  streakFlame: require('./ui/streak_flame.png'),
};

// Helper to get shelter image by preset id and expansion level (1-3)
export function getShelterImage(presetId: string, expansionLevel: number): ImageSourcePropType {
  const level = Math.min(Math.max(expansionLevel, 1), 3);
  return ShelterAssets[presetId]?.[level] ?? ShelterAssets.city[1];
}

// Helper to get avatar portrait by preset id
export function getAvatarPortrait(presetId: string): ImageSourcePropType {
  return AvatarPortraits[presetId] ?? AvatarPortraits.survivor_a;
}

// Helper to get in-game chibi avatar by preset id
export function getAvatarIngame(presetId: string): ImageSourcePropType {
  return AvatarIngame[presetId] ?? AvatarIngame.survivor_a;
}
