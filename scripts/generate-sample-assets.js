/**
 * Level-Up 샘플 에셋 생성 스크립트
 * 아이소메트릭 픽셀아트 스타일의 쉘터 + 아바타 샘플 생성
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// ============================================================
// 팔레트 정의 (제한된 색상 팔레트 — 픽셀아트 핵심)
// ============================================================
const PALETTES = {
  city: {
    floor: ['#3a3a4a', '#4a4a5a', '#333344'],
    wall: ['#5a5a6a', '#6a6a7a', '#4a4a5a'],
    wallDark: ['#3a3a4a', '#444455', '#333344'],
    accent: '#8a7a5a',
    light: '#c8a84b',
    shadow: '#1a1a2a',
    bg: '#0a0a1a',
  },
  // 나머지 테마는 샘플 확인 후 추가
};

const AVATAR_PALETTE = {
  skin: '#d4a574',
  skinShadow: '#b8896a',
  hair: '#4a3a2a',
  shirt: '#6a8a4a',
  shirtShadow: '#4a6a3a',
  pants: '#3a4a5a',
  pantsShadow: '#2a3a4a',
  boots: '#3a2a1a',
  outline: '#1a1a1a',
  eye: '#1a1a1a',
};

const FACILITY_PALETTE = {
  generator: { body: '#6a6a7a', accent: '#c8a84b', glow: '#ffdd66', dark: '#3a3a4a' },
  water_purifier: { body: '#4a6a8a', accent: '#6ab4d4', water: '#3a9ac4', dark: '#2a4a6a' },
};

// ============================================================
// 유틸리티
// ============================================================

/** 아이소메트릭 좌표 변환 (그리드 → 스크린) */
function gridToIso(gx, gy, tileW, tileH, originX, originY) {
  return {
    x: originX + (gx - gy) * (tileW / 2),
    y: originY + (gx + gy) * (tileH / 2),
  };
}

/** 아이소메트릭 다이아몬드 타일 그리기 */
function drawIsoDiamond(ctx, cx, cy, w, h, fillColor, strokeColor) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);       // top
  ctx.lineTo(cx + w / 2, cy);       // right
  ctx.lineTo(cx, cy + h / 2);       // bottom
  ctx.lineTo(cx - w / 2, cy);       // left
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/** 아이소메트릭 박스(큐브) 그리기 */
function drawIsoBox(ctx, cx, cy, w, h, boxH, topColor, leftColor, rightColor) {
  // Top face
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2 - boxH);
  ctx.lineTo(cx + w / 2, cy - boxH);
  ctx.lineTo(cx, cy + h / 2 - boxH);
  ctx.lineTo(cx - w / 2, cy - boxH);
  ctx.closePath();
  ctx.fillStyle = topColor;
  ctx.fill();

  // Left face
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - boxH);
  ctx.lineTo(cx, cy + h / 2 - boxH);
  ctx.lineTo(cx, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy);
  ctx.closePath();
  ctx.fillStyle = leftColor;
  ctx.fill();

  // Right face
  ctx.beginPath();
  ctx.moveTo(cx + w / 2, cy - boxH);
  ctx.lineTo(cx, cy + h / 2 - boxH);
  ctx.lineTo(cx, cy + h / 2);
  ctx.lineTo(cx + w / 2, cy);
  ctx.closePath();
  ctx.fillStyle = rightColor;
  ctx.fill();
}

/** 픽셀 단위 사각형 (스케일 적용) */
function drawPixel(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
}

// ============================================================
// 1. 도시 벙커 쉘터 (Stage 1 — 기본)
// ============================================================
function generateCityShelter() {
  const W = 256;
  const H = 256;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const palette = PALETTES.city;

  // 배경
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);

  const tileW = 48;
  const tileH = 24;
  const originX = W / 2;
  const originY = 60;
  const gridSize = 4;

  // 바닥 타일
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const { x, y } = gridToIso(gx, gy, tileW, tileH, originX, originY);
      const colorIdx = (gx + gy) % palette.floor.length;
      drawIsoDiamond(ctx, x, y, tileW - 1, tileH - 1, palette.floor[colorIdx], palette.shadow + '60');
    }
  }

  // 뒷벽 (왼쪽)
  for (let i = 0; i < gridSize; i++) {
    const { x, y } = gridToIso(0, i, tileW, tileH, originX, originY);
    drawIsoBox(ctx, x - tileW / 4, y - tileH / 2, tileW / 2, tileH, 36,
      palette.wall[0], palette.wallDark[0], palette.wall[1]);
  }

  // 뒷벽 (오른쪽)
  for (let i = 0; i < gridSize; i++) {
    const { x, y } = gridToIso(i, 0, tileW, tileH, originX, originY);
    drawIsoBox(ctx, x + tileW / 4, y - tileH / 2, tileW / 2, tileH, 36,
      palette.wall[1], palette.wall[0], palette.wallDark[1]);
  }

  // 비상등 효과 (벽에 작은 노란 점들)
  const lights = [
    gridToIso(0, 1, tileW, tileH, originX, originY),
    gridToIso(0, 3, tileW, tileH, originX, originY),
    gridToIso(2, 0, tileW, tileH, originX, originY),
  ];
  lights.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x - 8, y - 30, 3, 0, Math.PI * 2);
    ctx.fillStyle = palette.light;
    ctx.fill();
    // 글로우
    ctx.beginPath();
    ctx.arc(x - 8, y - 30, 8, 0, Math.PI * 2);
    ctx.fillStyle = palette.light + '30';
    ctx.fill();
  });

  // 통조림 더미 (우측 하단 코너)
  const cans = gridToIso(3, 3, tileW, tileH, originX, originY);
  for (let i = 0; i < 3; i++) {
    drawIsoBox(ctx, cans.x - 6 + i * 7, cans.y - 2 - i * 3, 8, 4, 6,
      '#8a8a6a', '#6a6a4a', '#7a7a5a');
  }

  // 간이 침대 (좌측 하단)
  const bed = gridToIso(3, 1, tileW, tileH, originX, originY);
  drawIsoBox(ctx, bed.x, bed.y - 2, 30, 15, 5, '#5a4a3a', '#4a3a2a', '#3a2a1a');
  // 베개
  drawIsoBox(ctx, bed.x - 8, bed.y - 5, 10, 5, 4, '#7a7a6a', '#6a6a5a', '#5a5a4a');

  // "SHELTER" 텍스트 (하단)
  ctx.fillStyle = palette.light + '80';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CITY BUNKER', W / 2, H - 12);

  return canvas;
}

// ============================================================
// 2. 아바타 스프라이트 시트 (idle 2프레임 + walk_down 4프레임)
// ============================================================
function generateAvatarSpriteSheet() {
  const FRAME_W = 32;
  const FRAME_H = 48;
  const FRAMES = 6; // idle×2 + walk_down×4
  const SCALE = 2; // 2x 스케일로 출력

  const canvas = createCanvas(FRAME_W * SCALE * FRAMES, FRAME_H * SCALE);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const p = AVATAR_PALETTE;
  const s = SCALE;

  function drawAvatarFrame(offsetX, breathOffset, legOffset, armOffset) {
    const ox = offsetX;
    const by = breathOffset; // 호흡 오프셋

    // 부츠
    drawPixel(ctx, ox + 10 * s, (38 + legOffset) * s, s * 3, p.boots);
    drawPixel(ctx, ox + 18 * s, (38 - legOffset) * s, s * 3, p.boots);

    // 바지
    drawPixel(ctx, ox + 11 * s, (32 + legOffset) * s, s * 2, p.pants);
    drawPixel(ctx, ox + 11 * s, (34 + legOffset) * s, s * 2, p.pants);
    drawPixel(ctx, ox + 11 * s, (36 + legOffset) * s, s * 2, p.pantsShadow);
    drawPixel(ctx, ox + 18 * s, (32 - legOffset) * s, s * 2, p.pants);
    drawPixel(ctx, ox + 18 * s, (34 - legOffset) * s, s * 2, p.pants);
    drawPixel(ctx, ox + 18 * s, (36 - legOffset) * s, s * 2, p.pantsShadow);

    // 몸통
    for (let y = 20; y < 32; y++) {
      const color = y < 26 ? p.shirt : p.shirtShadow;
      drawPixel(ctx, ox + 10 * s, (y + by) * s, s, color);
      for (let x = 11; x < 21; x++) {
        drawPixel(ctx, ox + x * s, (y + by) * s, s, color);
      }
      drawPixel(ctx, ox + 21 * s, (y + by) * s, s, color);
    }

    // 팔 (좌)
    drawPixel(ctx, ox + 8 * s, (22 + by + armOffset) * s, s * 2, p.shirt);
    drawPixel(ctx, ox + 8 * s, (24 + by + armOffset) * s, s * 2, p.shirtShadow);
    drawPixel(ctx, ox + 8 * s, (26 + by + armOffset) * s, s * 2, p.skin);

    // 팔 (우)
    drawPixel(ctx, ox + 22 * s, (22 + by - armOffset) * s, s * 2, p.shirt);
    drawPixel(ctx, ox + 22 * s, (24 + by - armOffset) * s, s * 2, p.shirtShadow);
    drawPixel(ctx, ox + 22 * s, (26 + by - armOffset) * s, s * 2, p.skin);

    // 머리
    for (let y = 8; y < 20; y++) {
      for (let x = 11; x < 21; x++) {
        const color = y < 12 ? p.hair : (y < 14 ? p.skin : p.skinShadow);
        drawPixel(ctx, ox + x * s, (y + by) * s, s, y === 8 || y === 19 || x === 11 || x === 20 ? p.outline : color);
      }
    }

    // 눈
    drawPixel(ctx, ox + 13 * s, (14 + by) * s, s, p.eye);
    drawPixel(ctx, ox + 18 * s, (14 + by) * s, s, p.eye);

    // 머리카락 디테일
    drawPixel(ctx, ox + 12 * s, (9 + by) * s, s * 2, p.hair);
    drawPixel(ctx, ox + 14 * s, (8 + by) * s, s * 2, p.hair);
    drawPixel(ctx, ox + 18 * s, (9 + by) * s, s * 2, p.hair);
  }

  // Frame 0: idle 1 (정면, 기본)
  drawAvatarFrame(0, 0, 0, 0);
  // Frame 1: idle 2 (호흡 — 약간 위로)
  drawAvatarFrame(FRAME_W * SCALE, -1, 0, 0);
  // Frame 2-5: walk down (다리 교차)
  drawAvatarFrame(FRAME_W * SCALE * 2, 0, -1, 1);
  drawAvatarFrame(FRAME_W * SCALE * 3, -1, 0, 0);
  drawAvatarFrame(FRAME_W * SCALE * 4, 0, 1, -1);
  drawAvatarFrame(FRAME_W * SCALE * 5, -1, 0, 0);

  return canvas;
}

// ============================================================
// 3. 시설 오브젝트 — 발전기
// ============================================================
function generateGenerator() {
  const W = 64;
  const H = 64;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const c = FACILITY_PALETTE.generator;

  // 배경 투명
  ctx.clearRect(0, 0, W, H);

  // 본체 (아이소메트릭 박스)
  drawIsoBox(ctx, 32, 38, 40, 20, 24, c.body, c.dark, '#5a5a6a');

  // 배기구 (상단)
  drawIsoBox(ctx, 24, 22, 12, 6, 8, '#7a7a8a', c.dark, c.body);

  // 계기판 (정면)
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(26, 30, 12, 8);

  // 계기판 불빛
  ctx.fillStyle = '#44dd44';
  ctx.fillRect(28, 32, 3, 3);
  ctx.fillStyle = c.glow;
  ctx.fillRect(33, 32, 3, 3);

  // 전력선
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(44, 26);
  ctx.lineTo(52, 18);
  ctx.lineTo(56, 20);
  ctx.stroke();

  // 글로우 효과
  ctx.beginPath();
  ctx.arc(32, 14, 6, 0, Math.PI * 2);
  ctx.fillStyle = c.glow + '20';
  ctx.fill();

  return canvas;
}

// ============================================================
// 4. 시설 오브젝트 — 정수기
// ============================================================
function generateWaterPurifier() {
  const W = 64;
  const H = 64;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const c = FACILITY_PALETTE.water_purifier;

  ctx.clearRect(0, 0, W, H);

  // 탱크 본체
  drawIsoBox(ctx, 32, 40, 36, 18, 28, c.body, c.dark, '#3a5a7a');

  // 물 표시 (반투명 파란색)
  ctx.fillStyle = c.water + '80';
  ctx.fillRect(20, 24, 16, 12);

  // 파이프 (상단)
  ctx.strokeStyle = '#8a8a9a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(32, 12);
  ctx.lineTo(32, 20);
  ctx.stroke();

  // 수도꼭지
  ctx.strokeStyle = '#8a8a9a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(38, 36);
  ctx.lineTo(46, 36);
  ctx.lineTo(46, 42);
  ctx.stroke();

  // 물방울
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(46, 46, 2, 0, Math.PI * 2);
  ctx.fill();

  // 라벨
  ctx.fillStyle = '#ffffff60';
  ctx.font = '6px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('H₂O', 28, 34);

  return canvas;
}

// ============================================================
// 5. UI 아이콘 — 포인트 코인
// ============================================================
function generateCoinIcon() {
  const S = 32;
  const canvas = createCanvas(S, S);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, S, S);

  // 외곽 원
  ctx.beginPath();
  ctx.arc(16, 16, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#c8a84b';
  ctx.fill();
  ctx.strokeStyle = '#a0882a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 내부 원
  ctx.beginPath();
  ctx.arc(16, 16, 9, 0, Math.PI * 2);
  ctx.strokeStyle = '#e0c86b';
  ctx.lineWidth = 1;
  ctx.stroke();

  // P 문자
  ctx.fillStyle = '#1a1a0a';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('P', 16, 17);

  // 하이라이트
  ctx.beginPath();
  ctx.arc(12, 11, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff30';
  ctx.fill();

  return canvas;
}

// ============================================================
// 6. 앱 아이콘
// ============================================================
function generateAppIcon() {
  const S = 1024;
  const canvas = createCanvas(S, S);
  const ctx = canvas.getContext('2d');

  // 배경 그라데이션
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, '#1a1a2a');
  grad.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  // 쉘터 실루엣 (중앙)
  const cx = S / 2;
  const cy = S / 2 + 50;

  // 아이소메트릭 바닥
  ctx.beginPath();
  ctx.moveTo(cx, cy - 120);
  ctx.lineTo(cx + 250, cy);
  ctx.lineTo(cx, cy + 120);
  ctx.lineTo(cx - 250, cy);
  ctx.closePath();
  ctx.fillStyle = '#3a3a4a';
  ctx.fill();
  ctx.strokeStyle = '#c8a84b40';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 벽 (뒤)
  ctx.beginPath();
  ctx.moveTo(cx - 250, cy);
  ctx.lineTo(cx - 250, cy - 200);
  ctx.lineTo(cx, cy - 320);
  ctx.lineTo(cx, cy - 120);
  ctx.closePath();
  ctx.fillStyle = '#4a4a5a';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + 250, cy);
  ctx.lineTo(cx + 250, cy - 200);
  ctx.lineTo(cx, cy - 320);
  ctx.lineTo(cx, cy - 120);
  ctx.closePath();
  ctx.fillStyle = '#5a5a6a';
  ctx.fill();

  // 비상등 글로우
  for (const [lx, ly] of [[-100, -200], [100, -200], [0, -280]]) {
    ctx.beginPath();
    ctx.arc(cx + lx, cy + ly, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#c8a84b';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + lx, cy + ly, 50, 0, Math.PI * 2);
    ctx.fillStyle = '#c8a84b20';
    ctx.fill();
  }

  // "LEVEL" 텍스트
  ctx.fillStyle = '#c8a84b';
  ctx.font = 'bold 120px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LEVEL', cx, 200);

  // "UP" 텍스트
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 160px monospace';
  ctx.fillText('UP', cx, 340);

  // 하단 라인
  ctx.strokeStyle = '#c8a84b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 200, 370);
  ctx.lineTo(cx + 200, 370);
  ctx.stroke();

  return canvas;
}

// ============================================================
// 저장
// ============================================================
function saveCanvas(canvas, filePath) {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Saved: ${filePath} (${Math.round(buffer.length / 1024)}KB)`);
}

const assetsDir = path.join(__dirname, '..', 'assets');

// 생성 및 저장
saveCanvas(generateCityShelter(), path.join(assetsDir, 'shelters', 'shelter_city_base.png'));
saveCanvas(generateAvatarSpriteSheet(), path.join(assetsDir, 'avatars', 'avatar_a_spritesheet.png'));
saveCanvas(generateGenerator(), path.join(assetsDir, 'facilities', 'generator.png'));
saveCanvas(generateWaterPurifier(), path.join(assetsDir, 'facilities', 'water_purifier.png'));
saveCanvas(generateCoinIcon(), path.join(assetsDir, 'ui', 'coin_icon.png'));
saveCanvas(generateAppIcon(), path.join(assetsDir, 'ui', 'app_icon.png'));

console.log('\n🎮 샘플 에셋 생성 완료!');
