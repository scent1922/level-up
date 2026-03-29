import React, { useEffect, useMemo, useRef } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import type { ShelterState } from '@/types';
import { AvatarEngine } from '@/engine/avatar-engine';
import { calcCanvasOrigin } from '@/engine/shelter-renderer';
import { getShelterImage, getBackground, getAvatarSprite } from '@/assets/asset-manifest';

const CANVAS_HEIGHT = 400;
const SCREEN_WIDTH = Dimensions.get('window').width;
const UPDATE_INTERVAL_MS = 100; // 10fps position update loop

// Sprite sheet constants — 5 frames per sheet, each frame is 64×64px
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;
const FRAME_COUNT = 5;

// Display size for the sprite on screen — small relative to shelter
const SPRITE_DISPLAY_W = 32;
const SPRITE_DISPLAY_H = 32;

// Avatar tile height offset (matches original layout)
const TILE_H = 32;

// Fixed facility positions for avatar engine
const FACILITY_POSITIONS = [
  { x: 1, y: 1 }, // generator
  { x: 2, y: 1 }, // water_purifier
  { x: 1, y: 2 }, // indoor_farm
  { x: 3, y: 0 }, // bed
  { x: 3, y: 2 }, // entertainment
  { x: 0, y: 3 }, // workbench
];

// Walkable area within the shelter canvas (as fraction of canvas dimensions).
// The isometric floor is in the center-lower portion of the scene.
const WALKABLE_AREA = {
  centerX: 0.5,
  centerY: 0.6,   // floor is in lower portion of shelter image
  radiusX: 0.25,  // horizontal extent
  radiusY: 0.12,  // vertical extent (isometric compression)
};

interface ShelterCanvasProps {
  shelter: ShelterState;
  avatarPresetId: string;
  decayStage: number;
}

function ShelterCanvasInner({ shelter, avatarPresetId, decayStage }: ShelterCanvasProps) {
  const engineRef = useRef<AvatarEngine>(new AvatarEngine(1, 1));
  const lastTimeRef = useRef<number>(Date.now());

  // Sprite frame state — drives the frame strip translateX
  const [currentFrame, setCurrentFrame] = React.useState(0);
  const [avatarEngineState, setAvatarEngineState] = React.useState<'idle' | 'walking' | 'interacting'>('idle');

  const avatarScreenX = useSharedValue(0);
  const avatarScreenY = useSharedValue(0);
  // Subtle Y bounce for walking state (replaces old rotate/scale animation)
  const avatarBounceY = useSharedValue(0);

  // Fix Issue 2 & 6: useMemo prevents new array reference each render (breaks update loop)
  // and guards against malformed JSON
  const installedFacilities = useMemo<string[]>(() => {
    try {
      return JSON.parse(shelter?.installed_facilities || '[]');
    } catch {
      return [];
    }
  }, [shelter?.installed_facilities]);

  const origin = calcCanvasOrigin(SCREEN_WIDTH, installedFacilities);

  // Avatar position animated style
  const positionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: avatarScreenX.value },
      { translateY: avatarScreenY.value + avatarBounceY.value },
    ],
  }));

  // Avatar position + engine state update loop (10fps)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const engine = engineRef.current;
      engine.update(delta, installedFacilities, FACILITY_POSITIONS);

      const engineState = engine.state;
      setAvatarEngineState(engineState);

      // Constrain avatar position to walkable area on canvas
      const rawScreenPos = engine.getScreenPosition();
      const walkCenterX = SCREEN_WIDTH * WALKABLE_AREA.centerX;
      const walkCenterY = CANVAS_HEIGHT * WALKABLE_AREA.centerY;
      const walkRadiusX = SCREEN_WIDTH * WALKABLE_AREA.radiusX;
      const walkRadiusY = CANVAS_HEIGHT * WALKABLE_AREA.radiusY;

      const baseX = origin.originX + rawScreenPos.x - SPRITE_DISPLAY_W / 2;
      const baseY = origin.originY + rawScreenPos.y - SPRITE_DISPLAY_H + TILE_H / 2;

      // Clamp to walkable ellipse
      const relX = baseX - walkCenterX;
      const relY = baseY - walkCenterY;
      const ellipseCheck = (relX / walkRadiusX) ** 2 + (relY / walkRadiusY) ** 2;
      let clampedX = baseX;
      let clampedY = baseY;
      if (ellipseCheck > 1) {
        const angle = Math.atan2(relY / walkRadiusY, relX / walkRadiusX);
        clampedX = walkCenterX + Math.cos(angle) * walkRadiusX;
        clampedY = walkCenterY + Math.sin(angle) * walkRadiusY;
      }

      avatarScreenX.value = withTiming(clampedX, {
        duration: UPDATE_INTERVAL_MS * 0.9,
        easing: Easing.linear,
      });
      avatarScreenY.value = withTiming(clampedY, {
        duration: UPDATE_INTERVAL_MS * 0.9,
        easing: Easing.linear,
      });
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installedFacilities, origin.originX, origin.originY, avatarScreenX, avatarScreenY]);

  // Sprite frame cycling — 4fps for walking, hold frame 0 for idle/interacting
  useEffect(() => {
    if (avatarEngineState !== 'walking') {
      setCurrentFrame(0);
      avatarBounceY.value = withTiming(0, { duration: 150 });
      return;
    }

    // Walking: cycle frames 0→1→2 at ~4fps (250ms per frame)
    const frameCycle = [0, 1, 2];
    let frameIdx = 0;
    const spriteInterval = setInterval(() => {
      frameIdx = (frameIdx + 1) % frameCycle.length;
      setCurrentFrame(frameCycle[frameIdx]);

      // Subtle Y bounce: alternate +2 / -2 each frame
      avatarBounceY.value = withTiming(frameIdx % 2 === 0 ? -2 : 2, { duration: 200 });
    }, 250);

    return () => clearInterval(spriteInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarEngineState]);

  const shelterSource = getShelterImage(shelter.preset_id, shelter.expansion_level);
  const backgroundSource = getBackground(shelter.preset_id);
  const spriteSource = getAvatarSprite(avatarPresetId);

  return (
    <View style={[styles.canvas, { width: SCREEN_WIDTH, height: CANVAS_HEIGHT }]}>
      {/* Layer 1: Background image — full container, behind everything */}
      <View style={[styles.backgroundImage, { backgroundColor: '#1a1020' }]}>
        <Image
          source={backgroundSource}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={(e) => console.log('BG image load error:', e.nativeEvent.error)}
        />
      </View>

      {/* Layer 2: Shelter PNG — transparent background, overlays on background */}
      <Image
        source={shelterSource}
        style={styles.shelterImage}
        resizeMode="contain"
      />

      {/* Layer 3: Avatar sprite — constrained to walkable floor area */}
      <Animated.View style={[styles.avatarContainer, positionStyle]}>
        {/* Sprite frame window: clips to one frame width */}
        <View style={styles.spriteWindow}>
          <Image
            source={spriteSource}
            style={[
              styles.spriteSheet,
              { transform: [{ translateX: -currentFrame * FRAME_WIDTH }] },
            ]}
            resizeMode="cover"
          />
        </View>
      </Animated.View>

      {/* Decay status indicator */}
      {decayStage >= 1 && (
        <View style={styles.decayBanner}>
          <Text style={styles.decayText}>
            {decayStage === 1 && '⚠️ 쉘터가 열화되기 시작했습니다'}
            {decayStage === 2 && '🔴 쉘터 상태가 심각합니다'}
            {decayStage === 3 && '💀 쉘터가 파괴되었습니다'}
          </Text>
        </View>
      )}
    </View>
  );
}

export function ShelterCanvas(props: ShelterCanvasProps) {
  return <ShelterCanvasInner {...props} />;
}

const styles = StyleSheet.create({
  canvas: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0A0A0A',
  },
  // Layer 1: full-bleed background, no transparency
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  // Layer 2: shelter PNG sits on top of background; no backgroundColor so transparency shows through
  shelterImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  // Layer 3: avatar container positioned by Animated values
  avatarContainer: {
    position: 'absolute',
    width: SPRITE_DISPLAY_W,
    height: SPRITE_DISPLAY_H,
    zIndex: 1000,
  },
  // Clips to exactly one sprite frame
  spriteWindow: {
    width: SPRITE_DISPLAY_W,
    height: SPRITE_DISPLAY_H,
    overflow: 'hidden',
  },
  // Full sprite sheet scaled to display size; translateX shifts to show correct frame
  spriteSheet: {
    width: SPRITE_DISPLAY_W * FRAME_COUNT,
    height: SPRITE_DISPLAY_H,
  },
  decayBanner: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(139,0,0,0.75)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    zIndex: 2000,
  },
  decayText: {
    color: '#FFB3B3',
    fontSize: 12,
    fontWeight: '600',
  },
});
