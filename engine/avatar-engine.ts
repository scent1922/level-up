import { gridToIso, getGridSize, expansionLevelFromFacilities } from './isometric-utils';

export class AvatarEngine {
  position: { x: number; y: number };   // fractional grid coordinates
  target: { x: number; y: number } | null;
  state: 'idle' | 'walking' | 'interacting';
  direction: 'down' | 'up' | 'left' | 'right';
  idleTimer: number;   // seconds remaining in current idle/interact pause
  private speed: number; // grid units per second

  constructor(startX: number, startY: number) {
    this.position = { x: startX, y: startY };
    this.target = null;
    this.state = 'idle';
    this.direction = 'down';
    this.idleTimer = 2 + Math.random() * 3;
    this.speed = 1.5; // grid units per second
  }

  update(
    deltaTime: number,
    installedFacilities: string[],
    facilityPositions: { x: number; y: number }[],
  ): void {
    const expansionLevel = expansionLevelFromFacilities(installedFacilities);
    const { width: gridW, height: gridH } = getGridSize(expansionLevel);

    switch (this.state) {
      case 'idle': {
        this.idleTimer -= deltaTime;
        if (this.idleTimer <= 0) {
          this._pickNewTarget(gridW, gridH);
        }
        break;
      }

      case 'walking': {
        if (!this.target) {
          this.state = 'idle';
          this.idleTimer = 2 + Math.random() * 3;
          break;
        }

        const dx = this.target.x - this.position.x;
        const dy = this.target.y - this.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.1) {
          // Arrived at target
          this.position.x = this.target.x;
          this.position.y = this.target.y;

          // Check if near a facility — 30% chance to interact
          const nearFacility = facilityPositions.some(
            (fp) =>
              Math.abs(fp.x - this.position.x) < 1.5 &&
              Math.abs(fp.y - this.position.y) < 1.5,
          );

          if (nearFacility && Math.random() < 0.3) {
            this.state = 'interacting';
            this.idleTimer = 2 + Math.random() * 2; // 2–4 seconds
          } else {
            this.state = 'idle';
            this.idleTimer = 3 + Math.random() * 5; // 3–8 seconds
          }
          this.target = null;
        } else {
          // Move toward target
          const step = Math.min(this.speed * deltaTime, dist);
          this.position.x += (dx / dist) * step;
          this.position.y += (dy / dist) * step;

          // Update direction
          if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
          } else {
            this.direction = dy > 0 ? 'down' : 'up';
          }
        }
        break;
      }

      case 'interacting': {
        this.idleTimer -= deltaTime;
        if (this.idleTimer <= 0) {
          this.state = 'idle';
          this.idleTimer = 3 + Math.random() * 5;
        }
        break;
      }
    }
  }

  getScreenPosition(): { x: number; y: number } {
    return gridToIso(this.position.x, this.position.y);
  }

  getGridPosition(): { x: number; y: number } {
    return { x: this.position.x, y: this.position.y };
  }

  private _pickNewTarget(gridW: number, gridH: number): void {
    // Pick a random valid grid cell
    const tx = Math.floor(Math.random() * gridW);
    const ty = Math.floor(Math.random() * gridH);
    this.target = { x: tx, y: ty };
    this.state = 'walking';
  }
}
