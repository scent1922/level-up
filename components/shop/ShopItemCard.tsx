import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ShopItem } from '@/types';

// Derive a deterministic color from asset_key
function colorFromAssetKey(key: string): string {
  const COLORS = [
    '#4A3728', '#2D4A3E', '#3D2D4A', '#4A4228', '#2D3D4A',
    '#4A2D35', '#2A4A3D', '#4A3D2D', '#2D2D4A', '#3A4A2D',
  ];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff;
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface Props {
  item: ShopItem;
  owned: boolean;
  locked: boolean;
  onPress: () => void;
}

export default function ShopItemCard({ item, owned, locked, onPress }: Props) {
  const bgColor = colorFromAssetKey(item.asset_key);

  return (
    <TouchableOpacity
      style={[styles.card, locked && styles.cardLocked]}
      onPress={onPress}
      disabled={locked}
      activeOpacity={0.8}
    >
      {/* Preview rectangle */}
      <View style={[styles.preview, { backgroundColor: bgColor }]}>
        {locked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockLabel}>
              Lv.{item.unlock_level} 필요
            </Text>
          </View>
        )}
        {owned && (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedBadgeText}>✓</Text>
          </View>
        )}
      </View>

      {/* Item name */}
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>

      {/* Price row */}
      {owned ? (
        <View style={styles.priceRow}>
          <Text style={styles.ownedText}>보유 중</Text>
        </View>
      ) : (
        <View style={styles.priceRow}>
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={[styles.price, locked && styles.priceLocked]}>
            {item.price === 0 ? '무료' : item.price.toLocaleString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    overflow: 'hidden',
  },
  cardLocked: {
    opacity: 0.5,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  lockIcon: {
    fontSize: 22,
  },
  lockLabel: {
    fontSize: 11,
    color: '#AAA',
    fontWeight: '600',
  },
  ownedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2D7A2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownedBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E8E8E8',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
    gap: 4,
  },
  coinIcon: {
    fontSize: 12,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C8A84B',
  },
  priceLocked: {
    color: '#666',
  },
  ownedText: {
    fontSize: 12,
    color: '#2D9E2D',
    fontWeight: '600',
  },
});
