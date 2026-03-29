import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

import { useUserStore } from '@/stores/user-store';
import { useShelterStore } from '@/stores/shelter-store';
import { ShelterCanvas } from '@/components/shelter/ShelterCanvas';
import { StatusBar } from '@/components/shelter/StatusBar';
import { UpgradePanel } from '@/components/shelter/UpgradePanel';
import { XP_TIERS } from '@/constants/balance';

const SCREEN_WIDTH = Dimensions.get('window').width;

function getXpForLevel(level: number): number {
  const tier = XP_TIERS.find((t) => level >= t.minLevel && level <= t.maxLevel);
  return tier ? tier.xpPerLevel : 500;
}

export default function ShelterScreen() {
  const user = useUserStore((s) => s.user);
  const { shelter, avatar, loadShelter, checkDecay } = useShelterStore();

  useEffect(() => {
    loadShelter();
  }, [loadShelter]);

  useEffect(() => {
    if (shelter) {
      checkDecay();
    }
  }, [shelter, checkDecay]);

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>로딩 중…</Text>
      </View>
    );
  }

  if (!shelter) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noShelterText}>쉘터가 없습니다.</Text>
        <Text style={styles.noShelterSub}>온보딩을 완료해 쉘터를 만드세요.</Text>
      </View>
    );
  }

  const xpRequired = getXpForLevel(user.level);
  const avatarPresetId = avatar?.preset_id ?? 'survivor_a';

  return (
    <View style={styles.container}>
      {/* Status bar overlay at top */}
      <StatusBar
        level={user.level}
        xp={user.xp}
        xpRequired={xpRequired}
        points={user.points}
      />

      {/* Shelter canvas — main view */}
      <View style={styles.canvasContainer}>
        <ShelterCanvas
          shelter={shelter}
          avatarPresetId={avatarPresetId}
          decayStage={shelter.decay_stage}
        />
      </View>

      {/* Upgrade panel anchored at bottom */}
      <UpgradePanel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  noShelterText: {
    color: '#DDD',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noShelterSub: {
    color: '#888',
    fontSize: 14,
  },
  canvasContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
  },
});
