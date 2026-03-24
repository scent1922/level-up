import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakBannerProps {
  streakCount: number;
}

export default function StreakBanner({ streakCount }: StreakBannerProps) {
  const getBonusBadge = () => {
    if (streakCount >= 30) {
      return (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔥🔥 2배 XP 보너스!</Text>
        </View>
      );
    }
    if (streakCount >= 7) {
      return (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔥 1.5배 XP 보너스!</Text>
        </View>
      );
    }
    return null;
  };

  if (streakCount === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>오늘부터 새로운 시작!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <Text style={styles.flameIcon}>🔥</Text>
        <Text style={styles.streakCount}>{streakCount}</Text>
      </View>
      <Text style={styles.streakLabel}>연속 {streakCount}일 달성 중!</Text>
      {getBonusBadge()}
    </View>
  );
}

const GOLD = '#C8A84B';
const BG = '#1A1A1A';

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flameIcon: {
    fontSize: 40,
  },
  streakCount: {
    fontSize: 56,
    fontWeight: 'bold',
    color: GOLD,
    lineHeight: 64,
  },
  streakLabel: {
    fontSize: 16,
    color: '#E8E8E8',
    marginTop: 4,
  },
  badge: {
    marginTop: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: GOLD,
  },
  badgeText: {
    color: GOLD,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    color: '#E8E8E8',
    fontWeight: '600',
  },
});
