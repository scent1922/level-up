/**
 * Level-Up 전체 에셋 일괄 생성 파이프라인
 * Gemini 3.1 Flash Image Preview (Nano Banana 2)
 *
 * 컨셉: 세련된 아늑한 쉘터 + 일본 애니메이션 스타일 캐릭터
 * 캐릭터: 레퍼런스 이미지 기반 스타일 일관성 확보
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// 캐릭터 레퍼런스 이미지 로드
const CHAR_REF_PATH = path.join(__dirname, '..', 'assets', 'reference', 'character_style_ref.jpg');
const CHAR_REF_BASE64 = fs.existsSync(CHAR_REF_PATH) ? fs.readFileSync(CHAR_REF_PATH).toString('base64') : null;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3.1-flash-image-preview';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// ============================================================
// 공통 스타일 프리픽스
// ============================================================
const SHELTER_STYLE = `Isometric pixel art, top-down cutaway view with no ceiling.
The shelter is a cozy, stylish, sophisticated underground living space — NOT a dirty bunker.
Clean, warm, safe atmosphere — like a high-end apartment.
Pixel art style with clean lines and warm lighting.
Transparent background (PNG alpha).`;

const CHARACTER_STYLE = `Generate a pixel art character sprite that EXACTLY matches the art style of the attached reference image.

CRITICAL STYLE REQUIREMENTS (copy from reference):
- Same pixel art rendering technique: visible but refined pixels, anti-aliased edges
- Same body proportions: tall anime figure (~5-6 head ratio), long legs, slim build
- Same level of detail: detailed hair with individual pixel strands and highlights, detailed clothing folds and accessories
- Same shading style: warm-toned skin shading, soft gradient shadows on clothing
- Same color approach: warm muted palette with earth tones, desaturated military/outdoor colors
- Same outline style: dark subtle outlines, not harsh black
- Same overall aesthetic: Japanese anime meets pixel art, mature proportions (NOT chibi)

Full body, front-facing 3/4 view, relaxed standing pose.
White or transparent background.`;

const FACILITY_STYLE = `Isometric pixel art, clean modern design, NOT rusty or dirty.
Sleek and sophisticated, matching a luxury shelter interior.
Transparent background, pixel art style.`;

// ============================================================
// 에셋 정의
// ============================================================
const ASSETS = [
  // ─── 쉘터 베이스 (4종 × 3확장 = 12장) ───
  // 도시 벙커
  {
    category: 'shelters', filename: 'shelter_city_1.png',
    prompt: `${SHELTER_STYLE}
City shelter, stage 1 (small, single room, 4x4 grid).
Dark charcoal panel walls with subtle gold LED strip lighting along ceiling edges.
A modern bed with dark gray bedding and warm throw blanket.
A cream sofa, glass coffee table, pendant lights, wall sconces.
Framed art, potted plant, slippers, bathrobe on stand.
Color: dark charcoal walls, warm amber lights, cream/beige accents, navy blue touches.
256x256px.`
  },
  {
    category: 'shelters', filename: 'shelter_city_2.png',
    prompt: `${SHELTER_STYLE}
City shelter, stage 2 (medium, two connected rooms, 6x4 grid).
Left: living room with sofa, TV, bookshelf, rug. Right: bedroom with bed, nightstand, reading lamp.
Archway connecting rooms, consistent dark panel walls with warm LED lighting.
More furniture, more comfortable. Wine rack, decorative items.
384x256px.`
  },
  {
    category: 'shelters', filename: 'shelter_city_3.png',
    prompt: `${SHELTER_STYLE}
City shelter, stage 3 (large, three rooms in L-shape, 6x6 grid).
Living room, bedroom, and a small kitchen/bar area.
Kitchen: modern counter, bar stools, coffee machine, wine glasses.
Bedroom: king bed, walk-in closet hint, vanity mirror.
Living: large sofa, big screen TV, speaker system, art collection.
Luxurious and fully furnished. 384x384px.`
  },

  // 해안 벙커
  {
    category: 'shelters', filename: 'shelter_coast_1.png',
    prompt: `${SHELTER_STYLE}
Coastal shelter, stage 1 (small, single room, 4x4 grid).
Natural rock wall accent combined with white-washed modern walls.
Ocean-themed decor: seashell decorations, driftwood furniture, rope details.
A comfortable daybed with ocean-blue cushions, porthole-style light fixture.
Soft blue-white LED lighting, sandy-toned floor.
Color: white/cream walls, ocean blues, sandy beige, driftwood brown.
256x256px.`
  },
  {
    category: 'shelters', filename: 'shelter_coast_2.png',
    prompt: `${SHELTER_STYLE}
Coastal shelter, stage 2 (medium, two rooms, 6x4 grid).
Main room: beach-house living with wicker furniture, hammock chair, surfboard decoration.
Second room: cozy bedroom with ocean-view light panel, nautical decor.
Blue-green accent lighting, coral and shell decorations.
384x256px.`
  },
  {
    category: 'shelters', filename: 'shelter_coast_3.png',
    prompt: `${SHELTER_STYLE}
Coastal shelter, stage 3 (large, three rooms, 6x6 grid).
Living area, bedroom, and sunroom with aquarium wall and indoor water feature.
Tropical plants, woven rugs, hanging lanterns.
Premium beach resort aesthetic underground. 384x384px.`
  },

  // 산림 벙커
  {
    category: 'shelters', filename: 'shelter_forest_1.png',
    prompt: `${SHELTER_STYLE}
Forest shelter, stage 1 (small, single room, 4x4 grid).
Exposed brick and dark wood panel walls, hanging plants everywhere.
A cozy bed surrounded by potted plants, wooden desk with lamp.
Terrarium on shelf, herb garden corner, warm pendant lighting.
Color: dark backgrounds, rich greens, warm wood tones, brick accents.
256x256px.`
  },
  {
    category: 'shelters', filename: 'shelter_forest_2.png',
    prompt: `${SHELTER_STYLE}
Forest shelter, stage 2 (medium, two rooms, 6x4 grid).
Main room: botanical living space with large aquarium/terrarium divider.
Second room: workspace with desk, monitor, bookshelves surrounded by plants.
Coffee machine area, exercise corner. Lush green atmosphere.
384x256px.`
  },
  {
    category: 'shelters', filename: 'shelter_forest_3.png',
    prompt: `${SHELTER_STYLE}
Forest shelter, stage 3 (large, three rooms, 6x6 grid).
Living room with indoor tree and skylight simulation, bedroom with moss wall,
greenhouse room with full hydroponic garden and water feature.
Nature paradise underground. 384x384px.`
  },

  // 사막 벙커
  {
    category: 'shelters', filename: 'shelter_desert_1.png',
    prompt: `${SHELTER_STYLE}
Desert shelter, stage 1 (small, single room, 4x4 grid).
Sandstone-textured accent walls with modern white surfaces.
Moroccan-inspired decor: patterned rug, lantern lighting, arch details.
A low platform bed with warm earth-tone linens, cactus plants.
Color: warm sand, terracotta, white, gold accents, teal touches.
256x256px.`
  },
  {
    category: 'shelters', filename: 'shelter_desert_2.png',
    prompt: `${SHELTER_STYLE}
Desert shelter, stage 2 (medium, two rooms, 6x4 grid).
Main room: oasis lounge with floor cushions, hookah-style decoration, pendant lanterns.
Second room: cool bedroom with fountain/water feature, tiled floor.
384x256px.`
  },
  {
    category: 'shelters', filename: 'shelter_desert_3.png',
    prompt: `${SHELTER_STYLE}
Desert shelter, stage 3 (large, three rooms, 6x6 grid).
Luxury desert riad aesthetic: courtyard room with small pool/fountain center,
living room with arched doorways and mosaic tiles,
bedroom with canopy bed and starlight ceiling simulation.
384x384px.`
  },

  // ─── 시설 오브젝트 (8종) ───
  {
    category: 'facilities', filename: 'generator.png',
    prompt: `${FACILITY_STYLE}
Sleek modern portable generator. Matte black body, gold (#C8A84B) LED indicator lights.
Digital display showing power level. Neatly organized minimal cables.
64x64px.`
  },
  {
    category: 'facilities', filename: 'water_purifier.png',
    prompt: `${FACILITY_STYLE}
Modern water purification unit. Clean white-and-blue design, transparent water tank section
showing blue water level, small digital display, sleek chrome faucet.
64x64px.`
  },
  {
    category: 'facilities', filename: 'indoor_farm.png',
    prompt: `${FACILITY_STYLE}
Modern indoor hydroponic garden. Sleek white grow boxes with lush green plants,
stylish UV grow light bar above (soft purple glow), small tomatoes and herbs visible.
Clean minimalist design. 64x64px.`
  },
  {
    category: 'facilities', filename: 'bed_basic.png',
    prompt: `${FACILITY_STYLE}
Simple but clean modern single bed. White frame, light gray mattress,
neatly folded blanket, one pillow. Minimalist. 64x64px.`
  },
  {
    category: 'facilities', filename: 'bed_upgraded.png',
    prompt: `${FACILITY_STYLE}
Luxury double bed. Dark wood frame, thick mattress, premium dark bedding with warm throw,
fluffy pillows, bedside table with reading lamp and book. Cozy. 64x64px.`
  },
  {
    category: 'facilities', filename: 'entertainment.png',
    prompt: `${FACILITY_STYLE}
Modern entertainment setup. Flat screen TV on sleek stand, gaming console,
wireless headphones on charging dock, ambient LED strip behind screen.
64x64px.`
  },
  {
    category: 'facilities', filename: 'speaker.png',
    prompt: `${FACILITY_STYLE}
Premium wireless speaker system. Two matching modern speakers on a floating shelf,
small music note particles above, subtle LED accent. Minimal and elegant.
48x48px.`
  },
  {
    category: 'facilities', filename: 'workbench.png',
    prompt: `${FACILITY_STYLE}
Modern workspace desk. Clean wooden top, monitor with code/blueprints on screen,
designer desk lamp, organized tool drawer, coffee mug. Productive and tidy.
64x64px or 128x64px.`
  },

  // ─── 아바타 (4종) — 레퍼런스 이미지 참조 ───
  {
    category: 'avatars', filename: 'avatar_a.png', useCharRef: true,
    prompt: `${CHARACTER_STYLE}
Male character, survivor style.
Red-brown messy styled hair, determined amber eyes.
Dark long military coat over light gray hoodie, dark cargo pants, sturdy black boots.
Scarf around neck. Cool and reliable appearance.
128x192px.`
  },
  {
    category: 'avatars', filename: 'avatar_b.png', useCharRef: true,
    prompt: `${CHARACTER_STYLE}
Female character, engineer style.
Dark blue ponytail hair, focused violet eyes, goggles on forehead.
Blue work coveralls with tool belt, work gloves, utility boots.
Smart and capable appearance.
128x192px.`
  },
  {
    category: 'avatars', filename: 'avatar_c.png', useCharRef: true,
    prompt: `${CHARACTER_STYLE}
Male character, scholar style.
Messy sandy-brown hair, round glasses, gentle green eyes.
Oversized knit sweater over collared shirt, dark pants, worn sneakers.
Messenger bag strap across chest. Bookworm and kind appearance.
128x192px.`
  },
  {
    category: 'avatars', filename: 'avatar_d.png', useCharRef: true,
    prompt: `${CHARACTER_STYLE}
Female character, explorer style.
Long blonde wavy hair with golden highlights, big blue sparkling eyes, cheerful smile.
Oversized olive-khaki military parka jacket, black shorts, combat boots.
Small backpack. Adventurous and energetic appearance.
128x192px.`
  },

  // ─── UI 에셋 ───
  {
    category: 'ui', filename: 'app_icon.png',
    prompt: `App icon for "Level-Up" mobile habit tracker game.
Isometric view: cozy warm underground shelter visible through cutaway.
Inside: warm amber lighting, modern furniture, a small anime-style chibi character sitting on sofa reading.
Above ground: dark post-apocalyptic cityscape silhouette at night.
Strong contrast between dark dangerous outside and warm safe inside.
"LEVEL UP" in bold pixel font, gold (#C8A84B) color, at top.
1024x1024px, dark navy background (#0A0A1A), no transparency.
Pixel art style, polished for app store.`
  },
  {
    category: 'ui', filename: 'coin_icon.png',
    prompt: `Pixel art coin icon. Round gold coin with letter "P" engraved in center.
Metallic shine highlight on upper left. Clean edges.
Gold color (#C8A84B), dark engraving.
32x32px, transparent background.`
  },
  {
    category: 'ui', filename: 'xp_icon.png',
    prompt: `Pixel art XP star icon. Glowing crystal star shape.
Purple-blue color (#6A5AAA) with bright white center, small sparkle particles.
32x32px, transparent background.`
  },
  {
    category: 'ui', filename: 'streak_flame.png',
    prompt: `Pixel art flame icon. Stylized fire flame.
Gradient: red (#CC4444) at base to orange to yellow (#CCCC44) at tip.
Small ember particles floating up. Dynamic and energetic.
32x32px, transparent background.`
  },
];

// ============================================================
// 생성 엔진
// ============================================================
let successCount = 0;
let failCount = 0;

async function generateImage(prompt, outputPath, useCharRef = false) {
  try {
    // Build contents: text prompt + optional reference image
    let contents;
    if (useCharRef && CHAR_REF_BASE64) {
      contents = [
        { inlineData: { mimeType: 'image/jpeg', data: CHAR_REF_BASE64 } },
        { text: prompt },
      ];
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { responseModalities: ['Text', 'Image'] },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, buffer);
          successCount++;
          return true;
        }
      }
    }
    failCount++;
    return false;
  } catch (error) {
    console.error(`   ❌ ${error.message}`);
    failCount++;
    return false;
  }
}

async function main() {
  console.log('🎮 Level-Up 전체 에셋 생성 시작');
  console.log(`📦 총 ${ASSETS.length}개 에셋`);
  console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY ? '설정됨' : '❌ 미설정'}\n`);

  const startTime = Date.now();

  for (let i = 0; i < ASSETS.length; i++) {
    const asset = ASSETS[i];
    const outputPath = path.join(ASSETS_DIR, asset.category, asset.filename);
    const progress = `[${i + 1}/${ASSETS.length}]`;

    // 이미 존재하는 파일 스킵 (재실행 시)
    if (fs.existsSync(outputPath)) {
      console.log(`${progress} ⏭️  스킵 (이미 존재): ${asset.category}/${asset.filename}`);
      successCount++;
      continue;
    }

    console.log(`${progress} 🎨 생성 중: ${asset.category}/${asset.filename}${asset.useCharRef ? ' (+ 레퍼런스)' : ''}`);
    const ok = await generateImage(asset.prompt, outputPath, asset.useCharRef || false);
    if (ok) {
      const size = Math.round(fs.statSync(outputPath).size / 1024);
      console.log(`${progress} ✅ 완료 (${size}KB)`);
    } else {
      console.log(`${progress} ⚠️  실패 — 나중에 재시도 가능`);
    }

    // Rate limit 방지: 2초 대기
    if (i < ASSETS.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✨ 생성 완료!`);
  console.log(`   성공: ${successCount}/${ASSETS.length}`);
  console.log(`   실패: ${failCount}`);
  console.log(`   소요 시간: ${Math.floor(elapsed / 60)}분 ${elapsed % 60}초`);
  console.log(`   출력: ${ASSETS_DIR}`);

  if (failCount > 0) {
    console.log(`\n💡 실패한 에셋은 스크립트를 다시 실행하면 자동으로 재생성됩니다 (이미 생성된 것은 스킵).`);
  }
}

main().catch(console.error);
