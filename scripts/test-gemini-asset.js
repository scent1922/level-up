/**
 * Level-Up 에셋 생성 테스트 스크립트
 * Gemini 3.1 Flash Image Preview로 도시 벙커 쉘터 + 아바타 샘플 생성
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'test-gemini');

async function generateImage(prompt, filename) {
  console.log(`\n🎨 생성 중: ${filename}`);
  console.log(`   프롬프트: ${prompt.substring(0, 80)}...`);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: prompt,
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    // 응답에서 이미지 파트 추출
    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          const filePath = path.join(OUTPUT_DIR, filename);
          fs.writeFileSync(filePath, buffer);
          console.log(`   ✅ 저장 완료: ${filePath} (${Math.round(buffer.length / 1024)}KB)`);
          return filePath;
        }
      }
    }
    console.log('   ⚠️ 이미지가 응답에 포함되지 않았습니다.');
    console.log('   응답:', JSON.stringify(response.candidates?.[0]?.content?.parts?.map(p => p.text || '[image]'), null, 2));
    return null;
  } catch (error) {
    console.error(`   ❌ 에러: ${error.message}`);
    return null;
  }
}

async function main() {
  // 출력 디렉토리 생성
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? '설정됨' : '❌ 미설정');
  console.log('📁 출력 경로:', OUTPUT_DIR);

  // ─────────────────────────────────────────
  // 테스트 1: 도시 벙커 쉘터 (아이소메트릭)
  // ─────────────────────────────────────────
  await generateImage(
    `Isometric pixel art of a small underground bunker interior, top-down cutaway view with no ceiling.
Setting: beneath a ruined city.
Concrete walls with cracks, exposed rebar, a single emergency light casting warm yellow glow,
a makeshift cot with thin blanket, stacked canned food in corner, bare concrete floor with drainage grate.
Dark muted color palette: grays, gold accent light (#C8A84B).
4x4 tile grid, isometric 45-degree angle.
Pixel art style, 256x256px, transparent background.
Style reference: Stardew Valley, Fallout Shelter.`,
    'shelter_city_test.png'
  );

  // ─────────────────────────────────────────
  // 테스트 2: 아바타 (정면, idle 포즈)
  // ─────────────────────────────────────────
  await generateImage(
    `Pixel art character sprite, post-apocalyptic male survivor.
Military-style outfit: olive drab jacket, cargo pants, combat boots.
Short dark hair, stubble beard, determined expression. Brown skin tone.
Front-facing idle pose, standing straight.
32x48 pixel character, scaled up to 128x192px for visibility.
Transparent background.
Style reference: Stardew Valley character sprites.`,
    'avatar_a_test.png'
  );

  // ─────────────────────────────────────────
  // 테스트 3: 발전기 시설 오브젝트
  // ─────────────────────────────────────────
  await generateImage(
    `Isometric pixel art of a small portable generator, post-apocalyptic style.
Boxy metal frame, exhaust pipe on top with smoke wisps,
control panel with green and amber indicator lights,
power cables extending from side, oil stains on base, worn metal texture.
64x64px, transparent background, pixel art style.
Color: dark metal gray with gold (#C8A84B) indicator glow.
Style reference: Stardew Valley, Fallout Shelter.`,
    'generator_test.png'
  );

  // ─────────────────────────────────────────
  // 테스트 4: 앱 아이콘
  // ─────────────────────────────────────────
  await generateImage(
    `App icon for "Level-Up" mobile app.
Isometric view of a small underground bunker with warm golden light emanating from inside,
dark post-apocalyptic surface above.
"LEVEL UP" text integrated into design, gold accent color (#C8A84B).
1024x1024px, filled background (no transparency), dark navy background (#0A0A1A).
Style: pixel art but polished for app store.`,
    'app_icon_test.png'
  );

  console.log('\n✨ 테스트 완료! 결과를 확인하세요:', OUTPUT_DIR);
}

main().catch(console.error);
