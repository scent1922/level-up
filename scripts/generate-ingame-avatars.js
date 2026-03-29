/**
 * Level-Up 인게임 아바타 생성
 * 포트레이트(5~6등신) → 인게임 치비(2~2.5등신) 변환
 * 레퍼런스: 인게임 스타일 이미지 + 각 캐릭터 포트레이트
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3.1-flash-image-preview';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const OUTPUT_DIR = path.join(ASSETS_DIR, 'avatars', 'ingame');

// 레퍼런스 이미지 로드
function loadImage(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath).toString('base64');
}

const INGAME_REF1 = loadImage(path.join(ASSETS_DIR, 'reference', 'ingame_style_ref1.jpg'));
const INGAME_REF2 = loadImage(path.join(ASSETS_DIR, 'reference', 'ingame_style_ref2.jpg'));

const INGAME_STYLE = `You are converting a full-body anime character portrait into an in-game pixel art chibi sprite.

CRITICAL — Study the two STYLE REFERENCE images carefully. The in-game sprite MUST match:
- Proportions: 2 to 2.5 head-to-body ratio (very large head, tiny compact body)
- View angle: isometric 3/4 view (facing slightly down-left, as in a top-down RPG)
- Outline: thick dark pixel outlines (2-3px), clearly defined silhouette
- Detail density: extremely detailed clothing/accessories crammed into the tiny body
- Head: oversized, takes up ~40% of total height, hair is prominent and recognizable
- Eyes: simplified but expressive dots or small anime-style marks
- Body: stubby short limbs, wide stance, compact torso
- Shading: limited palette per character, 2-3 shade levels, warm undertone
- Size: approximately 48x64 pixels (scaled up to 96x128 for visibility)

The CHARACTER REFERENCE image shows the full character design. Extract the exact:
- Hair color, style, and distinctive features
- Clothing design, colors, and accessories
- Overall personality/vibe

Convert this character into the chibi in-game style while keeping them instantly recognizable.

Idle standing pose, facing front-left (isometric RPG perspective).
Transparent or plain light gray background.`;

const CHARACTERS = [
  {
    id: 'a',
    portrait: path.join(ASSETS_DIR, 'avatars', 'avatar_a.png'),
    desc: `Male survivor with red-brown messy hair, dark military long coat over gray hoodie, scarf, cargo pants, black boots. Cool and determined.`,
  },
  {
    id: 'b',
    portrait: path.join(ASSETS_DIR, 'avatars', 'avatar_b.png'),
    desc: `Female engineer with dark blue ponytail, goggles on forehead, blue coveralls, tool belt, work gloves, utility boots. Smart and capable.`,
  },
  {
    id: 'c',
    portrait: path.join(ASSETS_DIR, 'avatars', 'avatar_c.png'),
    desc: `Male scholar with messy sandy-brown hair, round glasses, oversized brown knit sweater, messenger bag, dark pants, worn sneakers. Gentle bookworm.`,
  },
  {
    id: 'd',
    portrait: path.join(ASSETS_DIR, 'avatars', 'avatar_d.png'),
    desc: `Female explorer with long blonde wavy hair, big blue eyes, olive-khaki oversized military parka, black shorts, combat boots, backpack. Cheerful and energetic.`,
  },
];

async function generateIngameAvatar(char) {
  console.log(`\n🎨 인게임 아바타 생성: avatar_${char.id}_ingame.png`);

  const portraitBase64 = loadImage(char.portrait);
  if (!portraitBase64) {
    console.log(`   ❌ 포트레이트 이미지 없음: ${char.portrait}`);
    return false;
  }

  const contents = [
    // Style references first
    { inlineData: { mimeType: 'image/jpeg', data: INGAME_REF1 } },
    { inlineData: { mimeType: 'image/jpeg', data: INGAME_REF2 } },
    // Character portrait
    { inlineData: { mimeType: 'image/png', data: portraitBase64 } },
    // Prompt
    {
      text: `${INGAME_STYLE}

The first two images are STYLE REFERENCES — match this exact pixel art chibi style.
The third image is the CHARACTER to convert.

Character details: ${char.desc}

Generate a single idle chibi sprite of this character in the reference style.
96x128px output, transparent background.`,
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { responseModalities: ['Text', 'Image'] },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          const outputPath = path.join(OUTPUT_DIR, `avatar_${char.id}_ingame.png`);
          fs.writeFileSync(outputPath, buffer);
          console.log(`   ✅ 저장: ${outputPath} (${Math.round(buffer.length / 1024)}KB)`);
          return true;
        }
      }
    }
    console.log('   ⚠️ 이미지 없음');
    return false;
  } catch (error) {
    console.error(`   ❌ 에러: ${error.message}`);
    return false;
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('🎮 인게임 아바타 생성 시작');
  console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY ? '설정됨' : '❌'}`);
  console.log(`📎 인게임 스타일 레퍼런스 1: ${INGAME_REF1 ? '✅' : '❌'}`);
  console.log(`📎 인게임 스타일 레퍼런스 2: ${INGAME_REF2 ? '✅' : '❌'}`);

  let success = 0;
  for (const char of CHARACTERS) {
    const ok = await generateIngameAvatar(char);
    if (ok) success++;
    await new Promise(r => setTimeout(r, 2000)); // rate limit
  }

  console.log(`\n✨ 완료! ${success}/${CHARACTERS.length} 성공`);
}

main().catch(console.error);
