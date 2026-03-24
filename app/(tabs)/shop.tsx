import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import { useUserStore } from '@/stores/user-store';
import { useShelterStore } from '@/stores/shelter-store';
import ShopItemList from '@/components/shop/ShopItemList';
import PurchaseConfirmModal from '@/components/shop/PurchaseConfirmModal';
import type { ShopItem } from '@/types';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // iOS: use Alert as a lightweight fallback
    Alert.alert('', message, [{ text: '확인' }], { cancelable: true });
  }
}

export default function ShopScreen() {
  const user = useUserStore((s) => s.user);
  const spendPoints = useUserStore((s) => s.spendPoints);
  const shelter = useShelterStore((s) => s.shelter);
  const avatar = useShelterStore((s) => s.avatar);
  const applySkin = useShelterStore((s) => s.applySkin);
  const equipAvatarItem = useShelterStore((s) => s.equipAvatarItem);

  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  // Parse owned item IDs from shelter / avatar state
  const ownedSkinIds: string[] = (() => {
    if (!shelter) return [];
    try {
      const skins: Record<string, string> = JSON.parse(shelter.applied_skins);
      return Object.values(skins);
    } catch {
      return [];
    }
  })();

  const equippedItemIds: string[] = (() => {
    if (!avatar) return [];
    try {
      return JSON.parse(avatar.equipped_items) as string[];
    } catch {
      return [];
    }
  })();

  const handleItemPress = useCallback((item: ShopItem) => {
    setSelectedItem(item);
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleConfirm = useCallback(
    async (item: ShopItem) => {
      setSelectedItem(null);

      const success = await spendPoints(item.price, 'purchase');
      if (!success) {
        showToast('포인트가 부족합니다');
        return;
      }

      const isShelterItem =
        item.type === 'shelter_skin' || item.type === 'facility_skin';
      if (isShelterItem) {
        await applySkin(item.id, item.asset_key);
      } else {
        await equipAvatarItem(item.id);
      }

      showToast(`"${item.name}" 구매 완료!`);
    },
    [spendPoints, applySkin, equipAvatarItem]
  );

  const userPoints = user?.points ?? 0;
  const userLevel = user?.level ?? 1;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>상점</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={styles.pointsText}>{userPoints.toLocaleString()} P</Text>
        </View>
      </View>

      {/* Item list */}
      <ShopItemList
        userLevel={userLevel}
        ownedSkinIds={ownedSkinIds}
        equippedItemIds={equippedItemIds}
        onItemPress={handleItemPress}
      />

      {/* Purchase modal */}
      <PurchaseConfirmModal
        item={selectedItem}
        userPoints={userPoints}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#E8E8E8',
    letterSpacing: 1,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  coinIcon: {
    fontSize: 14,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C8A84B',
  },
});
