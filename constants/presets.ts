export interface ShelterPreset {
  id: string;
  name: string;
  description: string;
  assetKey: string;
  color: string; // placeholder color for MVP
}

export interface AvatarPreset {
  id: string;
  name: string;
  assetKey: string;
  color: string; // placeholder color for MVP
}

export const SHELTER_PRESETS: ShelterPreset[] = [
  { id: 'city', name: '도시 벙커', description: '폐허가 된 도시 지하, 콘크리트 벽, 비상등', assetKey: 'shelter_city', color: '#4A4A4A' },
  { id: 'coast', name: '해안 벙커', description: '절벽 아래 해안 동굴 기반, 파이프와 방수벽', assetKey: 'shelter_coast', color: '#2A6496' },
  { id: 'forest', name: '산림 벙커', description: '산 속 지하, 나무 뿌리가 천장을 관통, 자연광 유입', assetKey: 'shelter_forest', color: '#2D5A27' },
  { id: 'desert', name: '사막 벙커', description: '오아시스 인근 지하, 모래색 벽, 냉각 장치', assetKey: 'shelter_desert', color: '#C4A35A' },
];

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'survivor_a', name: '생존자 A', assetKey: 'avatar_a', color: '#8B4513' },
  { id: 'survivor_b', name: '생존자 B', assetKey: 'avatar_b', color: '#556B2F' },
  { id: 'survivor_c', name: '생존자 C', assetKey: 'avatar_c', color: '#4682B4' },
  { id: 'survivor_d', name: '생존자 D', assetKey: 'avatar_d', color: '#9932CC' },
];
