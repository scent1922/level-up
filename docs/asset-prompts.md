# Level-Up 에셋 생성 프롬프트 가이드

## 프로젝트 전체 설명 (Gemini에게 먼저 전달)

```
당신은 모바일 앱 "Level-Up"의 2D 픽셀아트 에셋을 제작하는 작업을 도와줍니다.

[앱 개요]
Level-Up은 일상 습관을 관리하는 게이미피케이션 모바일 앱입니다.
유저가 습관을 "퀘스트"로 등록하고 완료하면 경험치(XP)와 포인트를 얻습니다.
이를 통해 레벨업하고, 포스트아포칼립스 배경의 1인용 지하 쉘터를 육성·꾸밉니다.

[시각적 컨셉]
- 장르: 포스트아포칼립스 서바이벌
- 화면 구성: 2D 픽셀아트, 아이소메트릭(등축 투시) 뷰
- 분위기: 어둡고 긴장감 있지만, 희망적인 요소(식물, 따뜻한 조명)가 점차 추가됨
- 대상 유저: 18~35세, 인디 게임·픽셀아트를 좋아하는 감성

[핵심 메커니즘]
- 쉘터는 레벨업에 따라 점차 확장됨 (1칸 방 → 2칸 → 3칸 → 최종)
- 레벨업하면 새 시설(발전기, 정수기 등)을 설치할 수 있음
- 포인트로 쉘터/아바타 외형을 커스터마이징 가능
- 2주간 습관을 방치하면 쉘터가 열화되고 결국 파괴됨
- 쉘터 내부에는 아바타가 자동으로 돌아다니며 시설과 상호작용함

[아트 스타일 가이드]
- 스타일: 32~64px 기반 픽셀아트 (Stardew Valley, Caves of Qud, Fallout Shelter 참고)
- 시점: 아이소메트릭 (45도 탑다운)
- 색상: 테마별 제한 팔레트 (16~24색), 채도 낮은 톤 + 따뜻한 포인트 컬러
- 윤곽선: 1~2px 검은 윤곽 (character)  또는 어두운 동색 윤곽 (environment)
- 쉐이딩: 2~3단계 명암 (하이라이트 / 기본 / 그림자)
- 조명: 왼쪽 상단에서 오는 광원 기준
- 배경: 투명 (PNG, 알파 채널)
- 금색 액센트: #C8A84B (앱의 메인 액센트 컬러)
```

---

## 카테고리 1: 쉘터 베이스 (4종 × 3확장 = 12장)

각 쉘터는 아이소메트릭 뷰의 지하 벙커입니다. 위에서 내려다보는 시점으로, 천장이 잘려나간 상태의 인테리어가 보입니다.

### 1-1. 도시 벙커 (City Bunker)

**확장 1단계 (기본, 방 1개)**
```
Isometric pixel art of a small underground bunker interior,
top-down cutaway view with no ceiling.
Setting: beneath a ruined city.
Concrete walls with cracks, exposed rebar,
a single emergency light casting warm yellow glow,
a makeshift cot with thin blanket,
stacked canned food in corner,
bare concrete floor with drainage grate.
Dark muted color palette: grays (#4A4A5A, #3A3A4A),
gold accent light (#C8A84B).
4x4 tile grid, isometric 45-degree angle.
Pixel art style, 256x256px, transparent background.
```

**확장 2단계 (방 2개, Lv15)**
```
Isometric pixel art of a medium underground bunker interior,
top-down cutaway view, two connected rooms.
Setting: beneath a ruined city.
Left room: living area with improved cot, small table, storage crates.
Right room: utility area with space for equipment.
Concrete walls, multiple emergency lights,
a broken wall section connecting the rooms.
Same muted gray palette with gold accent lights.
6x4 tile grid, isometric 45-degree angle.
Pixel art style, 384x256px, transparent background.
```

**확장 3단계 (방 3개, Lv30)**
```
Isometric pixel art of a large underground bunker interior,
top-down cutaway view, three connected rooms in L-shape.
Setting: beneath a ruined city.
Main room: living quarters with bed, bookshelf, rug.
Side room 1: workshop/utility.
Side room 2: storage and garden space.
Reinforced concrete walls, multiple warm lights,
pipes running along ceiling, ventilation ducts visible.
6x6 tile grid, isometric 45-degree angle.
Pixel art style, 384x384px, transparent background.
```

### 1-2. 해안 벙커 (Coastal Bunker)

**확장 1단계**
```
Isometric pixel art of a small underground bunker interior,
top-down cutaway view.
Setting: inside a sea cliff cave, converted to a shelter.
Natural rock walls mixed with welded metal panels,
waterproof seals along edges,
dripping water collected in a bucket,
a hammock hanging from pipes,
blue-green tinted emergency light,
barnacles on lower walls, damp atmosphere.
Color palette: dark blues (#2A4A6A, #1A3A5A),
teal accents (#4A8A9A), rust (#8A5A3A).
4x4 tile grid, isometric 45-degree angle.
Pixel art style, 256x256px, transparent background.
```

**확장 2단계**
```
Same coastal bunker, expanded to two rooms (6x4 grid).
Additional room carved deeper into cliff.
Reinforced with metal beams,
porthole-style window blocked with metal plate,
fishing net decorations, improved waterproofing.
384x256px.
```

**확장 3단계**
```
Same coastal bunker, expanded to three rooms (6x6 grid, L-shape).
Third room is a natural cave pocket.
Stalactites, bioluminescent moss patches,
improved living conditions, wooden flooring sections.
384x384px.
```

### 1-3. 산림 벙커 (Forest Bunker)

**확장 1단계**
```
Isometric pixel art of a small underground bunker interior,
top-down cutaway view.
Setting: beneath a dense forest floor.
Earthen walls reinforced with wooden beams and tree roots,
tree roots penetrating the ceiling creating natural pillars,
dappled green light filtering through cracks above,
a sleeping bag on dried leaves,
lantern with warm glow, mushrooms growing on walls.
Color palette: earthy greens (#2D5A27, #3A6A32),
browns (#5A4A3A), warm amber (#B89A5A).
4x4 tile grid, isometric 45-degree angle.
Pixel art style, 256x256px, transparent background.
```

**확장 2단계**
```
Same forest bunker, expanded to two rooms (6x4 grid).
Second room partially open to a tree root system.
Wooden plank floor, vine-covered walls,
small underground stream channel visible.
384x256px.
```

**확장 3단계**
```
Same forest bunker, expanded to three rooms (6x6 grid, L-shape).
Third room is a root cellar / natural greenhouse.
Sunlight shaft from above, small plants growing,
cozy atmosphere with woven mats and wooden furniture.
384x384px.
```

### 1-4. 사막 벙커 (Desert Bunker)

**확장 1단계**
```
Isometric pixel art of a small underground bunker interior,
top-down cutaway view.
Setting: beneath desert sand, near an oasis.
Sandstone walls with carved niches,
sand-colored concrete reinforcement,
a makeshift cooling fan/vent on wall,
woven mat sleeping area, clay water jug,
warm amber lighting, sand particles visible in air.
Color palette: sandy yellows (#C4A35A, #A08A4A),
terracotta (#8A5A3A), cool shadow (#4A4A5A).
4x4 tile grid, isometric 45-degree angle.
Pixel art style, 256x256px, transparent background.
```

**확장 2단계**
```
Same desert bunker, expanded to two rooms (6x4 grid).
Second room has sandstone arch doorway.
Clay pot storage, woven carpet, improved ventilation.
384x256px.
```

**확장 3단계**
```
Same desert bunker, expanded to three rooms (6x6 grid, L-shape).
Third room connects to a natural underground spring.
Lush contrast — small plants near water,
tiled floor sections, lantern strings.
384x384px.
```

---

## 카테고리 2: 시설 오브젝트 (8종)

각 시설은 쉘터 내부에 배치되는 독립 오브젝트입니다. 아이소메트릭 시점에서 바라본 모습.

### 2-1. 발전기 (Generator) — Lv.5 해금
```
Isometric pixel art of a small portable generator,
post-apocalyptic style.
Boxy metal frame, exhaust pipe on top with smoke wisps,
control panel with green/amber indicator lights,
power cables extending from side,
oil stains on base, worn metal texture.
64x64px, transparent background, pixel art style.
Color: dark metal gray with gold (#C8A84B) indicator glow.
```

### 2-2. 정수 장치 (Water Purifier) — Lv.10 해금
```
Isometric pixel art of a DIY water purification system,
post-apocalyptic style.
Metal tank with visible water level (blue tint),
input pipe on top, output spigot on side,
"H2O" label stenciled on tank,
a water droplet dripping from spigot,
pressure gauge on front.
64x64px, transparent background, pixel art style.
Color: blue-gray metal (#4A6A8A) with blue water (#3A9AC4).
```

### 2-3. 실내 재배 시설 (Indoor Farm) — Lv.20 해금
```
Isometric pixel art of a small indoor hydroponic farm,
post-apocalyptic style.
Wooden grow boxes with green sprouts/small plants,
UV grow light hanging above (purple-pink glow),
water tubes connecting the boxes,
a few ripe tomatoes/vegetables visible.
64x64px, transparent background, pixel art style.
Color: brown wood (#6A5A3A), green plants (#4A8A3A), purple light (#9A5AAA).
```

### 2-4. 간이 침대 (Basic Bed) — 시작 시 포함
```
Isometric pixel art of a makeshift bed/cot,
post-apocalyptic style.
Metal frame folding cot, thin mattress,
crumpled gray blanket, flat pillow,
simple and worn appearance.
64x64px, transparent background, pixel art style.
Color: gray metal (#6A6A6A), off-white bedding (#9A9A8A).
```

### 2-5. 강화 침대 (Upgraded Bed) — Lv.25 해금
```
Isometric pixel art of an upgraded bed,
post-apocalyptic but comfortable style.
Proper wooden bed frame, thick mattress,
warm-colored quilt/comforter, fluffy pillow,
a small bedside shelf with a book and candle.
64x64px, transparent background, pixel art style.
Color: warm wood (#7A5A3A), cozy red-brown bedding (#8A5A4A).
```

### 2-6. 대형 스크린 (Entertainment Screen) — Lv.35 해금
```
Isometric pixel art of a large salvaged monitor/screen,
post-apocalyptic style.
Old CRT or flat panel on a makeshift stand,
screen showing static/blue glow,
wires and cables visible,
a game controller or remote nearby.
64x64px, transparent background, pixel art style.
Color: dark frame (#3A3A4A), blue-white screen glow (#6AAACC).
```

### 2-7. 스피커 (Speaker System) — Lv.35 해금 (스크린과 함께)
```
Isometric pixel art of salvaged speakers,
post-apocalyptic style.
Two mismatched speakers on a shelf,
visible speaker cone mesh,
audio wires, small music note particles above.
48x48px, transparent background, pixel art style.
Color: dark wood/metal (#4A3A3A), silver cone (#8A8A8A).
```

### 2-8. 작업대 (Workbench) — Lv.40 해금
```
Isometric pixel art of a heavy-duty workbench,
post-apocalyptic workshop style.
Sturdy metal-and-wood table,
vise clamp on corner, scattered tools (wrench, hammer),
overhead work lamp, small parts bins,
blueprints or schematics paper on surface.
64x64px (or 128x64px if wider), transparent background, pixel art style.
Color: wood top (#7A6A4A), metal legs (#5A5A5A), warm lamp (#C8A84B).
```

---

## 카테고리 3: 아바타 스프라이트 시트 (4종)

각 아바타는 포스트아포칼립스 생존자 캐릭터입니다. 스프라이트 시트로 제작하며, 모든 프레임이 한 이미지에 나란히 배치됩니다.

### 공통 스펙
- 프레임 크기: 32x48px (가로x세로, 각 프레임)
- 스케일: 2배 출력 권장 (64x96px per frame)
- 모션: idle(2), walk_down(4), walk_up(4), walk_left(4), walk_right(4), sleep(2), interact(3) = 23프레임
- 스프라이트 시트 배치: 한 행에 모든 프레임 가로 나열
- 배경: 투명

### 3-1. 생존자 A (남성, 군사 스타일)
```
Pixel art character sprite sheet,
post-apocalyptic male survivor.
Military-style outfit: olive drab jacket, cargo pants, combat boots.
Short dark hair, stubble beard, determined expression.
Brown skin tone.
23 frames in a row:
idle(2), walk_down(4), walk_up(4), walk_left(4), walk_right(4), sleep(2), interact(3).
Each frame 64x96px, transparent background.
Isometric-friendly 3/4 view for directional walks.
Style reference: Stardew Valley character sprites.
```

### 3-2. 생존자 B (여성, 엔지니어 스타일)
```
Pixel art character sprite sheet,
post-apocalyptic female survivor.
Engineer outfit: blue coveralls, tool belt, work gloves, goggles on forehead.
Dark ponytail hair, focused expression.
Light skin tone.
23 frames in a row:
idle(2), walk_down(4), walk_up(4), walk_left(4), walk_right(4), sleep(2), interact(3).
Each frame 64x96px, transparent background.
```

### 3-3. 생존자 C (남성, 학자 스타일)
```
Pixel art character sprite sheet,
post-apocalyptic male survivor.
Scholar outfit: tattered sweater, glasses, messenger bag, worn sneakers.
Messy brown hair, glasses, thoughtful expression.
Pale skin tone.
23 frames in a row:
idle(2), walk_down(4), walk_up(4), walk_left(4), walk_right(4), sleep(2), interact(3).
Each frame 64x96px, transparent background.
```

### 3-4. 생존자 D (여성, 탐험가 스타일)
```
Pixel art character sprite sheet,
post-apocalyptic female survivor.
Explorer outfit: leather jacket, scarf, hiking boots, backpack.
Short purple-dyed hair, adventurous expression.
Dark skin tone.
23 frames in a row:
idle(2), walk_down(4), walk_up(4), walk_left(4), walk_right(4), sleep(2), interact(3).
Each frame 64x96px, transparent background.
```

---

## 카테고리 4: 열화 오버레이 (3단계)

쉘터 위에 겹쳐지는 반투명 오버레이 이미지입니다.

### 4-1. 열화 1단계 (경고)
```
Semi-transparent overlay for isometric room,
light deterioration effects:
thin dust particles floating,
a few cobwebs in corners,
slightly dimmed lighting effect.
256x256px, mostly transparent with subtle effects.
PNG with alpha channel.
```

### 4-2. 열화 2단계 (심각)
```
Semi-transparent overlay for isometric room,
heavy deterioration effects:
thick dust clouds,
wall cracks (diagonal lines),
water leak puddles on floor,
flickering/broken light areas (dark spots),
debris/rubble small pieces.
256x256px, transparent with more visible effects.
PNG with alpha channel.
```

### 4-3. 파괴 연출 (배경)
```
Pixel art illustration of a destroyed underground bunker,
rubble and collapsed ceiling,
broken furniture scattered,
dust cloud, fallen debris,
dark and hopeless atmosphere.
Full scene, not overlay.
512x512px, dark background (#0A0A0A).
Used as destruction cutscene background.
```

---

## 카테고리 5: 상점 아이템 (20종)

각 아이템은 상점 썸네일(64x64px)로 제작합니다.

### 쉘터 스킨 (10종)
```
각각의 프롬프트 형식:
"Isometric pixel art of [아이템], 64x64px, transparent background,
post-apocalyptic style, for a bunker decoration shop."

1. 군용 카모 벽지 — Military camouflage wall texture tile
2. 녹슨 금속판 벽지 — Rusty corrugated metal wall panel
3. 목재 판넬 벽지 — Reclaimed wooden plank wall panel
4. 타일 바닥 — Checkered tile flooring (black and white)
5. 카펫 바닥 — Worn but cozy patterned carpet/rug
6. 나무 바닥 — Wooden plank flooring
7. 네온 사인 장식 — Small neon "OPEN" or "SAFE" sign glowing
8. 포스터 장식 — Faded pre-war propaganda poster on wall
9. 식물 장식 — Small potted succulent/cactus on shelf
10. 크리스마스 라이트 — String lights decoration (warm glow)
```

### 아바타 아이템 (10종)
```
각각의 프롬프트 형식:
"Pixel art of [아이템], icon/thumbnail view, 64x64px,
transparent background, post-apocalyptic style."

1. 가스 마스크 — Post-apocalyptic gas mask with round eye lenses
2. 고글 — Aviator-style leather and brass goggles
3. 야구 모자 — Worn baseball cap (faded red)
4. 비니 모자 — Knitted dark beanie hat
5. 가죽 자켓 — Rugged brown leather jacket
6. 방탄 조끼 — Tactical vest with pockets
7. 장갑 — Fingerless combat gloves
8. 부츠 — Heavy-duty military boots
9. 배낭 — Patched-up hiking backpack
10. 스카프 — Dust scarf / bandana (red checkered)
```

---

## 카테고리 6: UI 에셋

### 6-1. 탭 아이콘 (5개, 각 32x32px)
```
Pixel art icons, 32x32px each, transparent background,
minimal style, gold (#C8A84B) and white color scheme:
1. Home/shelter icon — small isometric house/bunker silhouette
2. Sword/quest icon — crossed sword and shield, or quest scroll
3. Calendar icon — simple calendar page with checkmark
4. Shopping cart icon — small cart or bag with coins
5. Gear/settings icon — mechanical gear/cog
```

### 6-2. 포인트 코인 아이콘 (32x32px)
```
Pixel art coin icon, 32x32px, transparent background.
Round gold coin with "P" engraved,
metallic shine highlight,
post-apocalyptic worn edges.
Color: gold (#C8A84B), dark engraving (#1A1A0A).
```

### 6-3. XP 아이콘 (32x32px)
```
Pixel art XP icon, 32x32px, transparent background.
Glowing star or crystal shape,
purple-blue color (#6A5AAA) with bright center,
small sparkle particles around it.
```

### 6-4. 스트릭 불꽃 아이콘 (32x32px)
```
Pixel art flame icon, 32x32px, transparent background.
Stylized fire flame,
gradient from red (#CC4444) at base to orange (#CCAA44) to yellow (#CCCC44) at tip,
small ember particles.
```

### 6-5. 앱 아이콘 (1024x1024px)
```
App icon for "Level-Up" mobile app.
Isometric view of a small underground bunker,
warm golden light emanating from inside,
dark post-apocalyptic surface above,
"LEVEL UP" text integrated into design,
gold accent color (#C8A84B).
1024x1024px, filled background (no transparency),
dark navy/black background (#0A0A1A).
Style: pixel art but polished for app store.
```

### 6-6. 스플래시 스크린 (1284x2778px, iPhone 기준)
```
Splash screen for "Level-Up" app.
Dark background (#0A0A0A),
"LEVEL UP" title centered in large bold pixel font,
gold (#C8A84B) for "LEVEL", white for "UP",
subtle bunker silhouette in background,
thin gold horizontal line below text.
Vertical orientation, 1284x2778px.
```

---

## 생성 팁

1. **일관성 유지**: 같은 카테고리의 에셋은 한 세션에서 연속으로 생성하면 스타일이 일관됩니다.
2. **팔레트 고정**: 각 쉘터 테마의 색상 팔레트를 먼저 정하고, 해당 팔레트만 사용하도록 지시하세요.
3. **스프라이트 시트**: 아바타는 개별 프레임을 따로 생성한 후 합치는 것이 품질이 더 좋을 수 있습니다.
4. **투명 배경**: 반드시 "transparent background, PNG" 를 명시하세요.
5. **크기**: 정확한 픽셀 크기를 명시하되, AI가 정확하게 맞추지 못할 수 있으므로 생성 후 리사이즈가 필요할 수 있습니다.
6. **레퍼런스**: "Style reference: Stardew Valley, Fallout Shelter, Caves of Qud" 를 추가하면 원하는 스타일에 더 가까워집니다.
