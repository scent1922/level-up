/**
 * Level-Up 쉘터 에셋 재생성 — Chromakey 녹색 배경 + 투명 변환
 *
 * 컨셉: 이전 버전의 세련되고 아늑한 인테리어 유지
 * 초기 쉘터(stage 1): 침대만 배치, 나머지 오브젝트 없음
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenAI } = require('@google/genai');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3.1-flash-image-preview';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

async function generateImage(prompt, outputPath) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
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

// Green screen removal Python script path
const GREEN_REMOVE_SCRIPT = path.join(__dirname, 'remove_green.py');

function ensureGreenRemoveScript() {
  if (fs.existsSync(GREEN_REMOVE_SCRIPT)) return;
  fs.writeFileSync(GREEN_REMOVE_SCRIPT, `
import sys
import numpy as np
from PIL import Image

input_path = sys.argv[1]
output_path = sys.argv[2]

img = Image.open(input_path).convert("RGBA")
data = np.array(img, dtype=np.float32)

r, g, b = data[:,:,0]/255, data[:,:,1]/255, data[:,:,2]/255
cmax = np.maximum(np.maximum(r, g), b)
cmin = np.minimum(np.minimum(r, g), b)
diff = cmax - cmin

hue = np.zeros_like(cmax)
mask_r = (cmax == r) & (diff > 0)
mask_g = (cmax == g) & (diff > 0)
mask_b = (cmax == b) & (diff > 0)
hue[mask_r] = (60 * ((g[mask_r] - b[mask_r]) / diff[mask_r]) + 360) % 360
hue[mask_g] = (60 * ((b[mask_g] - r[mask_g]) / diff[mask_g]) + 120) % 360
hue[mask_b] = (60 * ((r[mask_b] - g[mask_b]) / diff[mask_b]) + 240) % 360

sat = np.zeros_like(cmax)
sat[cmax > 0] = diff[cmax > 0] / cmax[cmax > 0]

green_mask = (hue >= 80) & (hue <= 160) & (sat > 0.2) & (cmax > 0.1)

result = np.array(img)
result[green_mask, 3] = 0

edge_mask = (hue >= 70) & (hue <= 170) & (sat > 0.1) & (cmax > 0.05) & ~green_mask
result[edge_mask, 3] = np.clip(result[edge_mask, 3].astype(int) - 128, 0, 255).astype(np.uint8)

out = Image.fromarray(result)
out.save(output_path)
print(f"OK {out.size[0]}x{out.size[1]}")
`);
}

function removeGreenScreen(inputPath, outputPath) {
  ensureGreenRemoveScript();
  try {
    const result = execFileSync('python3', [GREEN_REMOVE_SCRIPT, inputPath, outputPath], { encoding: 'utf-8' });
    console.log(`   🔄 ${result.trim()}`);
    return true;
  } catch (e) {
    console.error(`   ❌ Green removal failed`);
    return false;
  }
}

const CHROMAKEY_STYLE = `Isometric pixel art, top-down cutaway view with no ceiling.
CRITICAL: The background MUST be solid, flat, uniform chromakey green (#00FF00).
Every pixel outside the shelter structure must be pure green (#00FF00).
No gradients, no shadows, no variation in the green — pure flat #00FF00.
The shelter walls and floor should NOT be green — only the empty space around it.

The shelter interior style: cozy, stylish, sophisticated — warm and livable.
Think modern luxury apartment underground. Warm ambient lighting, clean surfaces.
Pixel art style with clean lines.
256x256px.`;

async function main() {
  console.log('🎮 Chromakey 쉘터 에셋 생성 시작\n');

  const shelters = [
    {
      filename: 'shelter_city_1.png',
      prompt: `${CHROMAKEY_STYLE}
City shelter, stage 1 — cozy but MINIMAL. Medium-sized isometric room (4x4 grid).
Sleek dark charcoal panel walls with subtle warm LED strip lighting along ceiling edges.
ONLY furniture: one SMALL single bed (NOT double) placed in one corner, taking about 15-20% of floor space.
Dark gray bedding with warm orange throw blanket.
The rest of the room is EMPTY — clean dark floor with LOTS of open space, warm ambient lighting from wall sconces.
Do NOT include: sofa, table, chairs, plants, art, shelves, or any other furniture.`
    },
    {
      filename: 'shelter_coast_1.png',
      prompt: `${CHROMAKEY_STYLE}
Coastal shelter, stage 1 — cozy but MINIMAL. Medium-sized isometric room (4x4 grid).
White-washed modern walls with natural rock accent sections, soft blue-white LED lighting.
ONLY furniture: one SMALL daybed with ocean-blue cushions in one corner, taking about 15-20% of floor space.
The rest of the room is EMPTY — clean sandy-toned floor with LOTS of open space, gentle ambient glow.
Do NOT include: hammock chair, surfboard, wicker furniture, or any other objects.`
    },
    {
      filename: 'shelter_forest_1.png',
      prompt: `${CHROMAKEY_STYLE}
Forest shelter, stage 1 — cozy but MINIMAL. Medium-sized isometric room (4x4 grid).
Exposed brick walls combined with dark wood panels, hanging pendant warm light.
ONLY furniture: one SMALL cozy bed in one corner, taking about 15-20% of floor space.
The rest of the room is EMPTY — wooden floor with LOTS of open space, warm pendant lighting.
Do NOT include: desk, aquarium, coffee machine, exercise equipment, plants, or any other objects.`
    },
    {
      filename: 'shelter_desert_1.png',
      prompt: `${CHROMAKEY_STYLE}
Desert shelter, stage 1 — cozy but MINIMAL. Medium-sized isometric room (4x4 grid).
Sandstone-textured accent walls with modern white surfaces, Moroccan lantern for lighting.
ONLY furniture: one SMALL low platform bed with warm earth-tone linens in one corner, taking about 15-20% of floor space.
The rest of the room is EMPTY — clean tiled floor with LOTS of open space, warm amber lantern glow.
Do NOT include: floor cushions, rugs, fountain, or decorative objects.`
    },
    {
      filename: 'shelter_city_2.png',
      prompt: `${CHROMAKEY_STYLE}
City shelter, stage 2 (medium, two connected rooms, 6x4 grid).
Left: living room with sofa, TV, bookshelf, rug. Right: bedroom with bed, nightstand, reading lamp.
Archway connecting rooms, dark panel walls with warm LED lighting. Wine rack, decorative items.
384x256px.`
    },
    {
      filename: 'shelter_city_3.png',
      prompt: `${CHROMAKEY_STYLE}
City shelter, stage 3 (large, three rooms in L-shape, 6x6 grid).
Living room, bedroom, kitchen/bar area. Fully furnished luxury.
384x384px.`
    },
    {
      filename: 'shelter_coast_2.png',
      prompt: `${CHROMAKEY_STYLE}
Coastal shelter, stage 2 (medium, two rooms, 6x4 grid).
Beach-house living with wicker furniture, hammock chair, nautical decor. Blue-green accent lighting.
384x256px.`
    },
    {
      filename: 'shelter_coast_3.png',
      prompt: `${CHROMAKEY_STYLE}
Coastal shelter, stage 3 (large, three rooms, 6x6 grid).
Living area, bedroom, sunroom with aquarium wall. Tropical resort aesthetic.
384x384px.`
    },
    {
      filename: 'shelter_forest_2.png',
      prompt: `${CHROMAKEY_STYLE}
Forest shelter, stage 2 (medium, two rooms, 6x4 grid).
Botanical living space with aquarium/terrarium divider, workspace, plants everywhere.
384x256px.`
    },
    {
      filename: 'shelter_forest_3.png',
      prompt: `${CHROMAKEY_STYLE}
Forest shelter, stage 3 (large, three rooms, 6x6 grid).
Indoor tree, moss wall, greenhouse room. Nature paradise underground.
384x384px.`
    },
    {
      filename: 'shelter_desert_2.png',
      prompt: `${CHROMAKEY_STYLE}
Desert shelter, stage 2 (medium, two rooms, 6x4 grid).
Oasis lounge with floor cushions, pendant lanterns, fountain.
384x256px.`
    },
    {
      filename: 'shelter_desert_3.png',
      prompt: `${CHROMAKEY_STYLE}
Desert shelter, stage 3 (large, three rooms, 6x6 grid).
Luxury desert riad: courtyard with pool, mosaic tiles, canopy bed.
384x384px.`
    },
  ];

  for (const s of shelters) {
    const rawPath = path.join(ASSETS_DIR, 'shelters', 'raw', s.filename);
    const finalPath = path.join(ASSETS_DIR, 'shelters', s.filename);

    console.log(`\n🎨 ${s.filename}`);
    fs.mkdirSync(path.dirname(rawPath), { recursive: true });
    const ok = await generateImage(s.prompt, rawPath);
    if (ok) {
      removeGreenScreen(rawPath, finalPath);
    }
    await new Promise(r => setTimeout(r, 2500));
  }

  console.log('\n✨ 완료!');
}

main().catch(console.error);
