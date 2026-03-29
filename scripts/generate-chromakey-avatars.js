/**
 * 인게임 치비 아바타 + 스프라이트 시트 Chromakey 재생성
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenAI } = require('@google/genai');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3.1-flash-image-preview';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

function loadImage(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath).toString('base64');
}

const INGAME_REF1 = loadImage(path.join(ASSETS_DIR, 'reference', 'ingame_style_ref1.jpg'));
const INGAME_REF2 = loadImage(path.join(ASSETS_DIR, 'reference', 'ingame_style_ref2.jpg'));

async function generateImage(prompt, outputPath, refs = []) {
  try {
    let contents;
    if (refs.length > 0) {
      contents = [
        ...refs.map(r => ({ inlineData: { mimeType: r.mime, data: r.data } })),
        { text: prompt },
      ];
    } else {
      contents = prompt;
    }
    const response = await ai.models.generateContent({
      model: MODEL, contents,
      config: { responseModalities: ['Text', 'Image'] },
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, buffer);
          console.log(`   ✅ ${path.basename(outputPath)} (${Math.round(buffer.length / 1024)}KB)`);
          return true;
        }
      }
    }
    console.log('   ⚠️ 이미지 없음');
    return false;
  } catch (error) {
    console.error(`   ❌ ${error.message}`);
    return false;
  }
}

function removeGreen(inputPath, outputPath) {
  try {
    execFileSync('python3', [path.join(__dirname, 'remove_green.py'), inputPath, outputPath], { encoding: 'utf-8' });
    return true;
  } catch (e) {
    console.error(`   ❌ Green removal failed`);
    return false;
  }
}

const CHIBI_STYLE = `CRITICAL: Background MUST be solid flat chromakey green (#00FF00). Every pixel that is not part of the character must be pure #00FF00. No shadows on the green area.

Study the STYLE REFERENCE images. Match their chibi proportions (2-2.5 head ratio) and pixel art technique exactly.
The CHARACTER REFERENCE shows who to draw — extract their hair, clothing, accessories.

Pixel art chibi character sprite, isometric RPG style.
Idle standing pose, facing front-left (isometric 3/4 view).
The character should be small — suitable to be displayed inside a shelter room at about 32px display size.
96x128px output on solid #00FF00 green background.`;

const SPRITE_STYLE = `CRITICAL: Background MUST be solid flat chromakey green (#00FF00). Every pixel that is not the character must be pure #00FF00.

Study the STYLE REFERENCE images. Match their chibi proportions and pixel art technique.
The CHARACTER REFERENCE shows who to draw.

Create a SPRITE SHEET with 3 frames in a single horizontal row:
Frame 1: idle/standing (facing front-left, isometric view)
Frame 2: walk frame 1 (left foot forward, slight lean)
Frame 3: walk frame 2 (right foot forward, slight lean)

Each frame approximately 48x48 pixels.
Total sheet: 144x48 pixels (3 frames in a row).
All on solid #00FF00 green background. NO shadows on green.`;

const characters = [
  { id: 'a', desc: 'Male with red-brown messy hair, dark military coat, gray hoodie, scarf, cargo pants, black boots' },
  { id: 'b', desc: 'Female with dark blue ponytail, goggles on forehead, blue coveralls, tool belt, work gloves' },
  { id: 'c', desc: 'Male with sandy-brown messy hair, round glasses, oversized brown knit sweater, messenger bag' },
  { id: 'd', desc: 'Female with long blonde wavy hair, big blue eyes, olive-khaki military parka, black shorts, combat boots' },
];

async function main() {
  console.log('🎮 Chromakey 아바타 생성 시작\n');

  for (const char of characters) {
    const portrait = loadImage(path.join(ASSETS_DIR, 'avatars', `avatar_${char.id}.png`));
    const refs = [];
    if (INGAME_REF1) refs.push({ mime: 'image/jpeg', data: INGAME_REF1 });
    if (INGAME_REF2) refs.push({ mime: 'image/jpeg', data: INGAME_REF2 });
    if (portrait) refs.push({ mime: 'image/png', data: portrait });

    // 1. Chibi idle
    console.log(`\n── 치비 idle: avatar_${char.id}_ingame ──`);
    const chibiRaw = path.join(ASSETS_DIR, 'avatars', 'ingame', 'raw', `avatar_${char.id}_ingame.png`);
    const chibiFinal = path.join(ASSETS_DIR, 'avatars', 'ingame', `avatar_${char.id}_ingame.png`);
    const ok1 = await generateImage(`${CHIBI_STYLE}\n\nCharacter: ${char.desc}`, chibiRaw, refs);
    if (ok1) {
      console.log(`   🔄 녹색 → 투명`);
      removeGreen(chibiRaw, chibiFinal);
    }
    await new Promise(r => setTimeout(r, 2500));

    // 2. Sprite sheet
    console.log(`── 스프라이트: sprite_${char.id} ──`);
    const spriteRaw = path.join(ASSETS_DIR, 'avatars', 'sprites', 'raw', `sprite_${char.id}.png`);
    const spriteFinal = path.join(ASSETS_DIR, 'avatars', 'sprites', `sprite_${char.id}.png`);
    fs.mkdirSync(path.dirname(spriteRaw), { recursive: true });
    const ok2 = await generateImage(`${SPRITE_STYLE}\n\nCharacter: ${char.desc}`, spriteRaw, refs);
    if (ok2) {
      console.log(`   🔄 녹색 → 투명`);
      removeGreen(spriteRaw, spriteFinal);
    }
    await new Promise(r => setTimeout(r, 2500));
  }

  console.log('\n✨ 완료!');
}

main().catch(console.error);
