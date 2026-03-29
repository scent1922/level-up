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
import { useAvatarMotion } from '@/engine/avatar-motion';
import type { AvatarMotionState } from '@/engine/avatar-motion';
import { getShelterImage, getAvatarIngame } from '@/assets/asset-manifest';

const CANVAS_HEIGHT = 400;
const SCREEN_WIDTH = Dimensions.get('window').width;
const UPDATE_INTERVAL_MS = 100; // 10fps update loop

const AVATAR_W = 48;
const AVATAR_H = 64;
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

interface ShelterCanvasProps {
  shelter: ShelterState;
  avatarPresetId: string;
  decayStage: number;
}

function ShelterCanvasInner({ shelter, avatarPresetId, decayStage }: ShelterCanvasProps) {
  const engineRef = useRef<AvatarEngine>(new AvatarEngine(1, 1));
  const lastTimeRef = useRef<number>(Date.now());
  const [avatarState, setAvatarState] = React.useState<AvatarMotionState>('idle');

  const avatarScreenX = useSharedValue(0);
  const avatarScreenY = useSharedValue(0);

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

  // Get animated style from avatar motion system
  const motionStyle = useAvatarMotion(avatarState);

  // Position animated style (drives the avatar across the canvas)
  const positionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: avatarScreenX.value },
      { translateY: avatarScreenY.value },
    ],
  }));

  // Avatar update loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const engine = engineRef.current;
      engine.update(delta, installedFacilities, FACILITY_POSITIONS);

      // Sync motion state from engine state
      const engineState = engine.state;
      setAvatarState(engineState as AvatarMotionState);

      // Drive animated position values for smooth avatar movement
      const screenPos = engine.getScreenPosition();
      avatarScreenX.value = withTiming(
        origin.originX + screenPos.x - AVATAR_W / 2,
        { duration: UPDATE_INTERVAL_MS * 0.9, easing: Easing.linear },
      );
      avatarScreenY.value = withTiming(
        origin.originY + screenPos.y - AVATAR_H + TILE_H / 2,
        { duration: UPDATE_INTERVAL_MS * 0.9, easing: Easing.linear },
      );
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installedFacilities, origin.originX, origin.originY, avatarScreenX, avatarScreenY]);

  const shelterSource = getShelterImage(shelter.preset_id, shelter.expansion_level);
  const avatarSource = getAvatarIngame(avatarPresetId);

  return (
    <View style={[styles.canvas, { width: SCREEN_WIDTH, height: CANVAS_HEIGHT }]}>
      {/* Shelter background image — single pre-rendered scene */}
      <Image
        source={shelterSource}
        style={styles.shelterImage}
        resizeMode="contain"
      />

      {/* Avatar: position driven by avatar-engine, visual motion by avatar-motion */}
      <Animated.View style={[styles.avatarContainer, positionStyle]}>
        <Animated.Image
          source={avatarSource}
          style={[styles.avatar, motionStyle]}
          resizeMode="contain"
        />
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
    backgroundColor: '#0D0D1A',
    overflow: 'hidden',
    position: 'relative',
  },
  shelterImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  avatarContainer: {
    position: 'absolute',
    width: AVATAR_W,
    height: AVATAR_H,
    zIndex: 1000,
  },
  avatar: {
    width: AVATAR_W,
    height: AVATAR_H,
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
