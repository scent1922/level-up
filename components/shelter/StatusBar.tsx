import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBarProps {
  level: number;
  xp: number;
  xpRequired: number;
  points: number;
}

export function StatusBar({ level, xp, xpRequired, points }: StatusBarProps) {
  const progress = xpRequired > 0 ? Math.min(xp / xpRequired, 1) : 0;

  return (
    <View style={styles.container}>
      {/* Level + XP */}
      <View style={styles.levelBlock}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{level}</Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.xpLabel}>
            {xp} / {xpRequired} XP
          </Text>
        </View>
      </View>

      {/* Points */}
      <View style={styles.pointsBlock}>
        <Text style={styles.coinIcon}>🪙</Text>
        <Text style={styles.pointsText}>{points.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
    backgroundColor: 'rgba(10,10,10,0.82)',
  },
  levelBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    backgroundColor: '#F4A825',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelText: {
    color: '#0A0A0A',
    fontWeight: '700',
    fontSize: 13,
  },
  xpBarContainer: {
    gap: 2,
  },
  xpBarBg: {
    width: 120,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#F4A825',
    borderRadius: 3,
  },
  xpLabel: {
    color: '#AAA',
    fontSize: 10,
  },
  pointsBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinIcon: {
    fontSize: 16,
  },
  pointsText: {
    color: '#F4A825',
    fontWeight: '700',
    fontSize: 15,
  },
});
