import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import type { ShopItem } from '@/types';

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

const TYPE_LABELS: Record<string, string> = {
  shelter_skin: '쉘터 스킨',
  facility_skin: '시설 스킨',
  avatar_outfit: '아바타 의상',
  avatar_accessory: '아바타 액세서리',
};

interface Props {
  item: ShopItem | null;
  userPoints: number;
  onConfirm: (item: ShopItem) => void;
  onCancel: () => void;
}

export default function PurchaseConfirmModal({
  item,
  userPoints,
  onConfirm,
  onCancel,
}: Props) {
  const canAfford = item !== null && userPoints >= item.price;
  const previewColor = item ? colorFromAssetKey(item.asset_key) : '#333';

  const handleConfirm = useCallback(() => {
    if (item && canAfford) {
      onConfirm(item);
    }
  }, [item, canAfford, onConfirm]);

  return (
    <Modal
      visible={item !== null}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Preview */}
          <View style={[styles.preview, { backgroundColor: previewColor }]} />

          {/* Item info */}
          <Text style={styles.itemName}>{item?.name ?? ''}</Text>
          <Text style={styles.itemType}>{item ? TYPE_LABELS[item.type] ?? item.type : ''}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.priceText}>
              {item?.price === 0 ? '무료' : `${item?.price?.toLocaleString() ?? 0} P`}
            </Text>
          </View>

          {/* Balance */}
          <Text style={styles.balance}>
            보유 포인트: {userPoints.toLocaleString()} P
          </Text>

          {/* Insufficient funds warning */}
          {item !== null && !canAfford && (
            <Text style={styles.insufficientText}>포인트가 부족합니다</Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, !canAfford && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!canAfford}
              activeOpacity={0.8}
            >
              <Text style={[styles.confirmText, !canAfford && styles.confirmTextDisabled]}>
                구매
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    width: 300,
    backgroundColor: '#1A1A1A',
    borderRadius: 0,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8E8E8',
    textAlign: 'center',
  },
  itemType: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  coinIcon: {
    fontSize: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C8A84B',
  },
  balance: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  insufficientText: {
    fontSize: 13,
    color: '#E05050',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  cancelText: {
    color: '#AAA',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#C8A84B',
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#3A3A3A',
  },
  confirmText: {
    color: '#0A0A0A',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmTextDisabled: {
    color: '#666',
  },
});
