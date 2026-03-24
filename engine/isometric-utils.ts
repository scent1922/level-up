export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

// Convert grid coordinates to screen position (isometric projection)
export function gridToIso(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: (gridX - gridY) * (TILE_WIDTH / 2),
    y: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

export function isoToGrid(screenX: number, screenY: number): { gridX: number; gridY: number } {
  return {
    gridX: Math.round((screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2),
    gridY: Math.round((screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2),
  };
}

// Get grid dimensions by expansion level
export function getGridSize(expansionLevel: number): { width: number; height: number } {
  if (expansionLevel >= 4) return { width: 8, height: 6 }; // expansion_final (Lv50)
  if (expansionLevel >= 3) return { width: 6, height: 6 }; // expansion_3 (Lv30)
  if (expansionLevel >= 2) return { width: 6, height: 4 }; // expansion_2 (Lv15)
  return { width: 4, height: 4 }; // base
}

// Determine expansion level from installed facilities
export function expansionLevelFromFacilities(installedFacilities: string[]): number {
  if (installedFacilities.includes('expansion_final')) return 4;
  if (installedFacilities.includes('expansion_3')) return 3;
  if (installedFacilities.includes('expansion_2')) return 2;
  return 1;
}
