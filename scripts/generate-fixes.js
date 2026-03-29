/**
 * Level-Up 에셋 수정 생성
 * 1. 쉘터 밖 배경 이미지 (4종)
 * 2. 초기 쉘터 재생성 — 최소 오브젝트 (4종)
 * 3. 인게임 캐릭터 스프라이트 시트 (4종 × idle+walk)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3.1-flash-image-preview';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Load reference images
function loadImage(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath).toString('base64');
}

const INGAME_REF1 = loadImage(path.join(ASSETS_DIR, 'reference', 'ingame_style_ref1.jpg'));
const INGAME_REF2 = loadImage(path.join(ASSETS_DIR, 'reference', 'ingame_style_ref2.jpg'));

async function generateImage(prompt, outputPath, referenceImages = []) {
  try {
    let contents;
    if (referenceImages.length > 0) {
      contents = [
        ...referenceImages.map(ref => ({ inlineData: { mimeType: ref.mime, data: ref.data } })),
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

async function main() {
  console.log('🎮 에셋 수정 생성 시작\n');

  // ═══════════════════════════════════════════
  // 1. 쉘터 밖 배경 이미지 (4종)
  // ═══════════════════════════════════════════
  console.log('── 1. 쉘터 밖 배경 이미지 ──');

  const backgrounds = [
    {
      filename: 'bg_city.png',
      prompt: `Dark post-apocalyptic underground background for a mobile game shelter view.
Setting: deep underground beneath a ruined city.
Dark concrete/rock walls extending around the shelter space, dim ambient lighting,
exposed pipes and cables along the edges, cracked concrete floor extending outward,
rubble and debris scattered around the perimeter.
No furniture or shelter objects — just the raw underground environment.
The center area should be slightly lighter (where the shelter will be placed).
Dark moody atmosphere, muted grays and browns.
Pixel art style matching an isometric game aesthetic.
512x512px, dark background, NO transparency.`
    },
    {
      filename: 'bg_coast.png',
      prompt: `Dark post-apocalyptic underground background for a mobile game shelter view.
Setting: inside a sea cliff cave system.
Natural rock cave walls with water stains, dripping stalactites,
dim blue-green bioluminescent glow from moss on walls,
wet rocky floor, small puddles reflecting light,
ocean sounds implied by wave-worn rock formations.
Center area slightly lighter for shelter placement.
Dark moody atmosphere, deep blues and teals.
Pixel art style matching an isometric game.
512x512px, dark background, NO transparency.`
    },
    {
      filename: 'bg_forest.png',
      prompt: `Dark post-apocalyptic underground background for a mobile game shelter view.
Setting: beneath a dense forest, underground root system.
Massive tree roots creating natural pillars and arches,
earthen walls with exposed layers of soil and rock,
scattered mushrooms glowing faintly, moss patches,
dappled green light filtering through cracks above.
Center area slightly lighter for shelter placement.
Dark earthy atmosphere, deep greens and browns.
Pixel art style matching an isometric game.
512x512px, dark background, NO transparency.`
    },
    {
      filename: 'bg_desert.png',
      prompt: `Dark post-apocalyptic underground background for a mobile game shelter view.
Setting: underground cavern beneath desert sand, near an oasis.
Sandstone cave walls with natural arch formations,
sand drifts along edges, ancient stone carvings partially visible,
warm amber light from cracks above, dry atmosphere,
small crystal formations in rock walls catching light.
Center area slightly lighter for shelter placement.
Dark sandy atmosphere, warm ambers and terracottas.
Pixel art style matching an isometric game.
512x512px, dark background, NO transparency.`
    },
  ];

  for (const bg of backgrounds) {
    console.log(`   🎨 ${bg.filename}`);
    await generateImage(bg.prompt, path.join(ASSETS_DIR, 'backgrounds', bg.filename));
    await new Promise(r => setTimeout(r, 2000));
  }

  // ═══════════════════════════════════════════
  // 2. 초기 쉘터 재생성 — 최소 오브젝트 (4종)
  // ═══════════════════════════════════════════
  console.log('\n── 2. 초기 쉘터 (최소 오브젝트) ──');

  const MINIMAL_SHELTER_STYLE = `Isometric pixel art of a small underground shelter interior, top-down cutaway view.
IMPORTANT: This is the STARTING shelter — very sparse and minimal.
Only include: a simple bed/cot, a small light source, and bare walls.
NO sofa, NO coffee table, NO art, NO plants, NO fancy furniture.
The room should feel empty and just barely livable — the player will upgrade it over time.
Clean pixel art style, transparent background (PNG alpha).
256x256px.`;

  const minimalShelters = [
    {
      filename: 'shelter_city_1.png',
      prompt: `${MINIMAL_SHELTER_STYLE}
City shelter: dark concrete panel walls, a single ceiling light, one basic metal cot with thin blanket, a small storage crate. That's it.
Color: dark charcoal, warm amber from the single light.`
    },
    {
      filename: 'shelter_coast_1.png',
      prompt: `${MINIMAL_SHELTER_STYLE}
Coastal shelter: natural rock walls with some metal reinforcement panels, a hammock or simple bed, a lantern for light. Very sparse.
Color: dark blue-gray rock, soft lantern glow.`
    },
    {
      filename: 'shelter_forest_1.png',
      prompt: `${MINIMAL_SHELTER_STYLE}
Forest shelter: earthen walls with wooden beam supports, tree roots visible on ceiling, a sleeping bag on the ground, a small oil lamp. Very bare.
Color: dark earth browns, warm lamp glow.`
    },
    {
      filename: 'shelter_desert_1.png',
      prompt: `${MINIMAL_SHELTER_STYLE}
Desert shelter: sandstone walls, a woven mat on the ground for sleeping, a single clay oil lamp. Extremely sparse — just survival basics.
Color: sandy beige walls, warm amber lamp glow.`
    },
  ];

  for (const shelter of minimalShelters) {
    console.log(`   🎨 ${shelter.filename}`);
    await generateImage(shelter.prompt, path.join(ASSETS_DIR, 'shelters', shelter.filename));
    await new Promise(r => setTimeout(r, 2000));
  }

  // ═══════════════════════════════════════════
  // 3. 인게임 스프라이트 시트 (4종)
  // ═══════════════════════════════════════════
  console.log('\n── 3. 인게임 스프라이트 시트 ──');

  const avatarPortraits = {
    a: loadImage(path.join(ASSETS_DIR, 'avatars', 'avatar_a.png')),
    b: loadImage(path.join(ASSETS_DIR, 'avatars', 'avatar_b.png')),
    c: loadImage(path.join(ASSETS_DIR, 'avatars', 'avatar_c.png')),
    d: loadImage(path.join(ASSETS_DIR, 'avatars', 'avatar_d.png')),
  };

  const SPRITE_STYLE = `Create a pixel art sprite sheet for an isometric RPG game character.

STUDY the style reference images — match their chibi proportions (2-2.5 head ratio) and pixel art technique.
The CHARACTER reference shows who to draw.

Create a SPRITE SHEET with 5 frames in a single horizontal row:
Frame 1: idle/standing (facing front-left, isometric view)
Frame 2: walk frame 1 (left foot forward)
Frame 3: walk frame 2 (right foot forward)
Frame 4: walk frame 1 mirrored (facing front-right)
Frame 5: walk frame 2 mirrored (facing front-right)

Each frame should be approximately 64x64 pixels.
Total sheet size: 320x64 pixels (5 frames × 64px wide).
White or light gray background (NOT transparent — for easier processing).
Clear separation between frames.
Consistent character appearance across all frames.`;

  const characters = [
    { id: 'a', desc: 'Male with red-brown hair, dark military coat, gray hoodie, scarf' },
    { id: 'b', desc: 'Female with dark blue ponytail, goggles, blue coveralls, tool belt' },
    { id: 'c', desc: 'Male with sandy-brown hair, glasses, brown knit sweater, messenger bag' },
    { id: 'd', desc: 'Female with blonde hair, olive parka, black shorts, combat boots' },
  ];

  for (const char of characters) {
    console.log(`   🎨 sprite_${char.id}.png`);
    const refs = [];
    if (INGAME_REF1) refs.push({ mime: 'image/jpeg', data: INGAME_REF1 });
    if (INGAME_REF2) refs.push({ mime: 'image/jpeg', data: INGAME_REF2 });
    if (avatarPortraits[char.id]) refs.push({ mime: 'image/png', data: avatarPortraits[char.id] });

    await generateImage(
      `${SPRITE_STYLE}\n\nCharacter: ${char.desc}`,
      path.join(ASSETS_DIR, 'avatars', 'sprites', `sprite_${char.id}.png`),
      refs
    );
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\n✨ 에셋 수정 생성 완료!');
}

main().catch(console.error);
