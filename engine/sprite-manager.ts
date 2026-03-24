// Sprite manager — placeholder for future pixel art asset loading.
// Currently returns placeholder colors for each entity type.

export interface SpriteInfo {
  color: string;
  borderColor: string;
  label: string;
}

const FACILITY_SPRITES: Record<string, SpriteInfo> = {
  generator:       { color: '#F4A460', borderColor: '#D2691E', label: '⚡ 발전기' },
  water_purifier:  { color: '#4FC3F7', borderColor: '#0288D1', label: '💧 정수기' },
  indoor_farm:     { color: '#66BB6A', borderColor: '#388E3C', label: '🌿 재배' },
  bed:             { color: '#9575CD', borderColor: '#512DA8', label: '🛏 침대' },
  bed_upgrade:     { color: '#BA68C8', borderColor: '#7B1FA2', label: '🛏 침대+' },
  entertainment:   { color: '#FF8A65', borderColor: '#E64A19', label: '🎮 엔터' },
  workbench:       { color: '#8D6E63', borderColor: '#5D4037', label: '🔧 작업대' },
  basic_shelter:   { color: '#78909C', borderColor: '#455A64', label: '🏠 기본' },
  expansion_2:     { color: '#AED581', borderColor: '#689F38', label: '🔓 확장2' },
  expansion_3:     { color: '#81C784', borderColor: '#388E3C', label: '🔓 확장3' },
  expansion_final: { color: '#A5D6A7', borderColor: '#2E7D32', label: '🔓 최종' },
};

export function getFacilitySprite(facilityId: string): SpriteInfo {
  return FACILITY_SPRITES[facilityId] ?? { color: '#BDBDBD', borderColor: '#757575', label: facilityId };
}

export function getFloorColor(presetColor: string, decayStage: number): string {
  // Desaturate / darken the floor based on decay
  if (decayStage >= 3) return '#3A3A3A';
  if (decayStage >= 2) return blendColor(presetColor, '#555555', 0.6);
  if (decayStage >= 1) return blendColor(presetColor, '#888888', 0.3);
  return presetColor;
}

export function getWallColor(presetColor: string, decayStage: number): string {
  if (decayStage >= 3) return '#2A2A2A';
  if (decayStage >= 2) return blendColor(presetColor, '#333333', 0.7);
  if (decayStage >= 1) return blendColor(presetColor, '#555555', 0.4);
  return darkenColor(presetColor, 0.3);
}

// Simple hex color blending utility
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function blendColor(hex1: string, hex2: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return rgbToHex(
    r1 * (1 - ratio) + r2 * ratio,
    g1 * (1 - ratio) + g2 * ratio,
    b1 * (1 - ratio) + b2 * ratio,
  );
}

function darkenColor(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}
