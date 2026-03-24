import type { ShelterState } from '@/types';
import { gridToIso, getGridSize, expansionLevelFromFacilities } from './isometric-utils';
import { getFacilitySprite, getFloorColor, getWallColor } from './sprite-manager';

export interface RenderObject {
  id: string;
  type: 'floor' | 'wall' | 'facility' | 'avatar' | 'decoration';
  gridX: number;
  gridY: number;
  screenX: number;
  screenY: number;
  width: number;  // pixels
  height: number; // pixels
  color: string;
  borderColor?: string;
  label?: string;
  zIndex: number;
  opacity?: number;
}

// Fixed facility grid positions
const FACILITY_POSITIONS: Record<string, { x: number; y: number }> = {
  generator:       { x: 1, y: 1 },
  water_purifier:  { x: 2, y: 1 },
  indoor_farm:     { x: 1, y: 2 },
  bed:             { x: 3, y: 0 },
  bed_upgrade:     { x: 3, y: 0 },
  entertainment:   { x: 3, y: 2 },
  workbench:       { x: 0, y: 3 },
};

const TILE_W = 64;
const TILE_H = 32;
const FACILITY_W = 48;
const FACILITY_H = 40;
const AVATAR_W = 20;
const AVATAR_H = 28;
const WALL_H = 40;

export function buildShelterScene(
  shelterState: ShelterState,
  presetColor: string,
  installedFacilities: string[],
  avatarPosition: { x: number; y: number },
  _avatarState: string,
  decayStage: number,
): RenderObject[] {
  const objects: RenderObject[] = [];
  const expansionLevel = expansionLevelFromFacilities(installedFacilities);
  const { width: gridW, height: gridH } = getGridSize(expansionLevel);
  const floorColor = getFloorColor(presetColor, decayStage);
  const wallColor = getWallColor(presetColor, decayStage);

  // 1. Floor tiles
  for (let gx = 0; gx < gridW; gx++) {
    for (let gy = 0; gy < gridH; gy++) {
      const { x, y } = gridToIso(gx, gy);
      objects.push({
        id: `floor_${gx}_${gy}`,
        type: 'floor',
        gridX: gx,
        gridY: gy,
        screenX: x - TILE_W / 2,
        screenY: y,
        width: TILE_W,
        height: TILE_H,
        color: floorColor,
        borderColor: wallColor,
        zIndex: gx + gy,
      });
    }
  }

  // 2. Wall segments along back edges (gx=0 column and gy=0 row)
  for (let gx = 0; gx < gridW; gx++) {
    const { x, y } = gridToIso(gx, 0);
    objects.push({
      id: `wall_top_${gx}`,
      type: 'wall',
      gridX: gx,
      gridY: 0,
      screenX: x - TILE_W / 2,
      screenY: y - WALL_H,
      width: TILE_W,
      height: WALL_H,
      color: wallColor,
      borderColor: wallColor,
      zIndex: gx - 1,
    });
  }
  for (let gy = 1; gy < gridH; gy++) {
    const { x, y } = gridToIso(0, gy);
    objects.push({
      id: `wall_left_${gy}`,
      type: 'wall',
      gridX: 0,
      gridY: gy,
      screenX: x - TILE_W / 2,
      screenY: y - WALL_H,
      width: TILE_W,
      height: WALL_H,
      color: wallColor,
      borderColor: wallColor,
      zIndex: gy - 1,
    });
  }

  // 3. Installed facilities
  for (const facilityId of installedFacilities) {
    const pos = FACILITY_POSITIONS[facilityId];
    if (!pos) continue;
    if (pos.x >= gridW || pos.y >= gridH) continue;

    const { x, y } = gridToIso(pos.x, pos.y);
    const sprite = getFacilitySprite(facilityId);
    objects.push({
      id: `facility_${facilityId}`,
      type: 'facility',
      gridX: pos.x,
      gridY: pos.y,
      screenX: x - FACILITY_W / 2,
      screenY: y - FACILITY_H + TILE_H / 2,
      width: FACILITY_W,
      height: FACILITY_H,
      color: sprite.color,
      borderColor: sprite.borderColor,
      label: sprite.label,
      zIndex: pos.x + pos.y + 1,
    });
  }

  // 4. Avatar
  const { x: ax, y: ay } = gridToIso(avatarPosition.x, avatarPosition.y);
  objects.push({
    id: 'avatar',
    type: 'avatar',
    gridX: avatarPosition.x,
    gridY: avatarPosition.y,
    screenX: ax - AVATAR_W / 2,
    screenY: ay - AVATAR_H + TILE_H / 2,
    width: AVATAR_W,
    height: AVATAR_H,
    color: '#F9A825',
    borderColor: '#E65100',
    label: '👤',
    zIndex: avatarPosition.x + avatarPosition.y + 2,
  });

  // 5. Decay overlay decoration
  if (decayStage >= 1) {
    const overlayOpacity = decayStage === 1 ? 0.15 : decayStage === 2 ? 0.35 : 0.6;
    const { x: ox, y: oy } = gridToIso(0, 0);
    const { x: ex, y: ey } = gridToIso(gridW - 1, gridH - 1);
    objects.push({
      id: 'decay_overlay',
      type: 'decoration',
      gridX: 0,
      gridY: 0,
      screenX: ox - TILE_W / 2,
      screenY: oy - WALL_H,
      width: ex - ox + TILE_W,
      height: ey - oy + WALL_H + TILE_H,
      color: '#8B0000',
      opacity: overlayOpacity,
      zIndex: 999,
    });
  }

  // Sort by zIndex
  objects.sort((a, b) => a.zIndex - b.zIndex);
  return objects;
}

// Calculate canvas origin offset so the shelter is centered
export function calcCanvasOrigin(
  canvasWidth: number,
  installedFacilities: string[],
): { originX: number; originY: number } {
  const expansionLevel = expansionLevelFromFacilities(installedFacilities);
  const { width: gridW, height: gridH } = getGridSize(expansionLevel);

  // Bounding box in iso space
  const topLeft = gridToIso(0, 0);
  const topRight = gridToIso(gridW - 1, 0);
  const bottomLeft = gridToIso(0, gridH - 1);
  const bottomRight = gridToIso(gridW - 1, gridH - 1);

  const minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x) - TILE_W / 2;
  const maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x) + TILE_W / 2;
  const minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y) - WALL_H;
  const maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y) + TILE_H;

  const sceneWidth = maxX - minX;
  const sceneHeight = maxY - minY;

  return {
    originX: (canvasWidth - sceneWidth) / 2 - minX,
    originY: 60 - minY, // leave 60px at top for status bar
  };
}
