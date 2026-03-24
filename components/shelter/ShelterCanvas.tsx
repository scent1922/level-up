import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import type { ShelterState } from '@/types';
import { AvatarEngine } from '@/engine/avatar-engine';
import { buildShelterScene, calcCanvasOrigin, type RenderObject } from '@/engine/shelter-renderer';
import { SHELTER_PRESETS } from '@/constants/presets';

const CANVAS_HEIGHT = 400;
const SCREEN_WIDTH = Dimensions.get('window').width;
const UPDATE_INTERVAL_MS = 100; // 10fps update loop

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

export function ShelterCanvas({ shelter, avatarPresetId, decayStage }: ShelterCanvasProps) {
  const engineRef = useRef<AvatarEngine>(new AvatarEngine(1, 1));
  const lastTimeRef = useRef<number>(Date.now());

  const [renderObjects, setRenderObjects] = useState<RenderObject[]>([]);
  const [avatarGridPos, setAvatarGridPos] = useState({ x: 1, y: 1 });

  const avatarScreenX = useSharedValue(0);
  const avatarScreenY = useSharedValue(0);

  const installedFacilities: string[] = JSON.parse(shelter.installed_facilities);
  const preset = SHELTER_PRESETS.find((p) => p.id === shelter.preset_id);
  const presetColor = preset?.color ?? '#4A4A4A';

  const origin = calcCanvasOrigin(SCREEN_WIDTH, installedFacilities);

  const rebuildScene = useCallback(
    (avatarPos: { x: number; y: number }) => {
      const objects = buildShelterScene(
        shelter,
        presetColor,
        installedFacilities,
        avatarPos,
        engineRef.current.state,
        decayStage,
      );
      setRenderObjects(objects);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shelter.installed_facilities, shelter.preset_id, decayStage, presetColor],
  );

  // Initial build
  useEffect(() => {
    rebuildScene(engineRef.current.getGridPosition());
  }, [rebuildScene]);

  // Avatar update loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const engine = engineRef.current;
      engine.update(delta, installedFacilities, FACILITY_POSITIONS);

      const gridPos = engine.getGridPosition();
      setAvatarGridPos({ x: gridPos.x, y: gridPos.y });
      rebuildScene(gridPos);

      // Drive animated values for smooth avatar movement
      const screenPos = engine.getScreenPosition();
      const AVATAR_W = 20;
      const AVATAR_H = 28;
      const TILE_H = 32;
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
  }, [installedFacilities, rebuildScene, origin.originX, origin.originY, avatarScreenX, avatarScreenY]);

  const animatedAvatarStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: avatarScreenX.value },
      { translateY: avatarScreenY.value },
    ],
  }));

  return (
    <View style={[styles.canvas, { width: SCREEN_WIDTH, height: CANVAS_HEIGHT }]}>
      {renderObjects.map((obj) => {
        if (obj.type === 'avatar') {
          // Avatar is rendered separately with animation
          return null;
        }

        return (
          <View
            key={obj.id}
            style={[
              styles.renderObj,
              {
                left: origin.originX + obj.screenX,
                top: origin.originY + obj.screenY,
                width: obj.width,
                height: obj.height,
                backgroundColor: obj.color,
                borderColor: obj.borderColor ?? obj.color,
                zIndex: obj.zIndex,
                opacity: obj.opacity ?? 1,
                borderWidth: obj.type === 'floor' ? 1 : obj.type === 'wall' ? 0 : 2,
                borderRadius:
                  obj.type === 'facility' ? 4 : obj.type === 'floor' ? 0 : 0,
              },
            ]}
          >
            {obj.label && obj.type === 'facility' && (
              <Text style={styles.facilityLabel} numberOfLines={1}>
                {obj.label}
              </Text>
            )}
          </View>
        );
      })}

      {/* Animated avatar — rendered on top */}
      <Animated.View
        style={[
          styles.renderObj,
          styles.avatar,
          animatedAvatarStyle,
        ]}
      >
        <Text style={styles.avatarLabel}>👤</Text>
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

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: '#0D0D1A',
    overflow: 'hidden',
    position: 'relative',
  },
  renderObj: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  facilityLabel: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatar: {
    width: 20,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#F9A825',
    borderWidth: 2,
    borderColor: '#E65100',
    zIndex: 1000,
  },
  avatarLabel: {
    fontSize: 12,
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
  },
  decayText: {
    color: '#FFB3B3',
    fontSize: 12,
    fontWeight: '600',
  },
});
