/**
 * Level-Up 에셋 생성 테스트 v2
 * 컨셉 변경: 세련된 아늑한 쉘터 + 애니메이션 스타일 캐릭터
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3.1-flash-image-preview';
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'test-gemini-v2');

async function generateImage(prompt, filename) {
  console.log(`\n🎨 생성 중: ${filename}`);
  console.log(`   프롬프트: ${prompt.substring(0, 100)}...`);

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          const filePath = path.join(OUTPUT_DIR, filename);
          fs.writeFileSync(filePath, buffer);
          console.log(`   ✅ 저장: ${filePath} (${Math.round(buffer.length / 1024)}KB)`);
          return filePath;
        }
      }
    }
    console.log('   ⚠️ 이미지 없음');
    if (response.candidates?.[0]?.content?.parts) {
      response.candidates[0].content.parts.forEach(p => {
        if (p.text) console.log('   텍스트:', p.text.substring(0, 200));
      });
    }
    return null;
  } catch (error) {
    console.error(`   ❌ 에러: ${error.message}`);
    return null;
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? '설정됨' : '❌ 미설정');

  // ─────────────────────────────────────────
  // 1. 도시 쉘터 — 세련된 모던 인테리어
  // ─────────────────────────────────────────
  await generateImage(
    `Isometric pixel art of a cozy, stylish underground shelter interior, top-down cutaway view with no ceiling.
The shelter is a modern, clean, and sophisticated living space — NOT a dirty bunker.
Think luxury urban apartment meets underground safehouse.

Interior details:
- Sleek dark walls with subtle panel lines and indirect warm LED lighting along ceiling edges
- A comfortable modern bed with clean dark gray bedding and a warm-toned throw blanket
- A cream/beige sofa with a small glass coffee table and wine bottle
- Polished dark floor with a soft area rug
- Hanging pendant lights and wall sconces with warm glow
- A small reading nook with a blue accent chair
- Clean, minimal decoration — a framed art piece, a potted plant, slippers near the bed
- Bathrobe hanging on a stand

Overall atmosphere: cozy, warm, safe, sophisticated — like a high-end hotel room.
Color palette: dark charcoal walls, warm amber lights, cream and beige accents, touches of navy blue.
Isometric 45-degree angle, pixel art style.
256x256px, transparent background.`,
    'shelter_city_v2.png'
  );

  // ─────────────────────────────────────────
  // 2. 산림 쉘터 — 보태니컬 그린 인테리어
  // ─────────────────────────────────────────
  await generateImage(
    `Isometric pixel art of a cozy underground shelter interior with a botanical/green theme.
Top-down cutaway view, no ceiling visible.

Interior details:
- Exposed brick walls combined with dark modern panels
- Abundant indoor plants — hanging plants, potted plants on shelves, small herb garden area
- A large glass aquarium or terrarium as a room divider
- Wooden floor sections with dark rugs
- A comfortable workspace with desk, monitor, and desk lamp
- Kitchen counter area with coffee machine and utensils on shelves
- A cozy sleeping area with a bed near a window-like light panel showing a forest scene
- Exercise equipment (treadmill) in one corner
- Overall lush, green, and alive atmosphere

Color palette: dark backgrounds, rich greens, warm wood tones, brick red accents.
Isometric 45-degree angle, pixel art style.
256x256px, transparent background.`,
    'shelter_forest_v2.png'
  );

  // ─────────────────────────────────────────
  // 3. 캐릭터 A — 남성, 애니메이션 스타일
  // ─────────────────────────────────────────
  await generateImage(
    `Pixel art character sprite in Japanese anime style.
Male character, post-apocalyptic survivor but stylish.
Anime-inspired features: large expressive eyes, sharp facial features, styled hair.

Appearance:
- Messy red-brown hair with side sweep
- Sharp determined anime eyes
- Wearing a long dark military-style coat over a light hoodie
- Dark pants and sturdy boots
- Confident standing pose, slightly turned

Style: Japanese anime pixel art, similar to anime gacha game character sprites.
NOT realistic — clearly anime/manga influenced proportions and features.
Full body, front-facing 3/4 view.
128x192px character on transparent background.
Clean pixel art with smooth anti-aliased edges.`,
    'avatar_male_a_v2.png'
  );

  // ─────────────────────────────────────────
  // 4. 캐릭터 B — 여성, 애니메이션 스타일
  // ─────────────────────────────────────────
  await generateImage(
    `Pixel art character sprite in Japanese anime style.
Female character, post-apocalyptic survivor but cute and stylish.
Anime-inspired features: large sparkling eyes, delicate facial features, flowing hair.

Appearance:
- Long blonde wavy hair with highlights
- Big blue anime eyes, gentle smile
- Wearing an oversized military-style parka/jacket in olive-khaki color
- Dark shorts and combat boots
- Casual relaxed standing pose

Style: Japanese anime pixel art, similar to anime gacha game character sprites.
Cute anime girl proportions — NOT realistic.
Full body, front-facing 3/4 view.
128x192px character on transparent background.
Clean pixel art with smooth anti-aliased edges.`,
    'avatar_female_a_v2.png'
  );

  // ─────────────────────────────────────────
  // 5. 시설: 발전기 (세련된 버전)
  // ─────────────────────────────────────────
  await generateImage(
    `Isometric pixel art of a sleek modern portable generator.
Clean industrial design, NOT rusty or dirty.
Matte black metal body with subtle gold (#C8A84B) LED indicator lights.
Smooth surfaces, minimal cables neatly organized.
Small digital display panel on front showing power level.
64x64px, transparent background, pixel art style.
Style: clean, modern, sophisticated — matches a luxury shelter interior.`,
    'generator_v2.png'
  );

  // ─────────────────────────────────────────
  // 6. 앱 아이콘
  // ─────────────────────────────────────────
  await generateImage(
    `App icon for "Level-Up" mobile habit tracker game.
Isometric view of a cozy, warm underground shelter interior visible through a cutaway.
Inside: warm amber lighting, comfortable modern furniture, a small anime-style character sitting on a sofa.
Above ground: dark post-apocalyptic cityscape silhouette.
Contrast between dark outside and warm cozy inside.
"LEVEL UP" text in bold pixel font, gold (#C8A84B) color.
1024x1024px, dark navy background (#0A0A1A), no transparency.
Pixel art style but polished for app store display.`,
    'app_icon_v2.png'
  );

  console.log('\n✨ v2 테스트 완료!', OUTPUT_DIR);
}

main().catch(console.error);
