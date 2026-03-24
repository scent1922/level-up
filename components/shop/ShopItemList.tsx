import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getDatabase } from '@/db/database';
import { getShopItems } from '@/db/queries/shop-queries';
import type { ShopItem, ShopItemType } from '@/types';
import ShopItemCard from './ShopItemCard';

type Tab = 'shelter' | 'avatar';

const SHELTER_TYPES: ShopItemType[] = ['shelter_skin', 'facility_skin'];
const AVATAR_TYPES: ShopItemType[] = ['avatar_outfit', 'avatar_accessory'];

interface Props {
  userLevel: number;
  ownedSkinIds: string[];
  equippedItemIds: string[];
  onItemPress: (item: ShopItem) => void;
}

export default function ShopItemList({
  userLevel,
  ownedSkinIds,
  equippedItemIds,
  onItemPress,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('shelter');
  const [allItems, setAllItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = await getDatabase();
        const items = await getShopItems(db);
        if (!cancelled) {
          setAllItems(items);
        }
      } catch (e) {
        console.error('Failed to load shop items:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredItems = allItems.filter((item) => {
    if (activeTab === 'shelter') return SHELTER_TYPES.includes(item.type);
    return AVATAR_TYPES.includes(item.type);
  });

  const isOwned = useCallback(
    (item: ShopItem) => ownedSkinIds.includes(item.id) || equippedItemIds.includes(item.id),
    [ownedSkinIds, equippedItemIds]
  );

  const isLocked = useCallback(
    (item: ShopItem) =>
      item.unlock_level !== null && item.unlock_level > userLevel,
    [userLevel]
  );

  const handleItemPress = useCallback(
    (item: ShopItem) => {
      if (!isLocked(item) && !isOwned(item)) {
        onItemPress(item);
      }
    },
    [isLocked, isOwned, onItemPress]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ShopItem; index: number }) => {
      const isRightColumn = index % 2 === 1;
      return (
        <View style={[styles.cellWrapper, isRightColumn && styles.cellRight]}>
          <ShopItemCard
            item={item}
            owned={isOwned(item)}
            locked={isLocked(item)}
            onPress={() => handleItemPress(item)}
          />
        </View>
      );
    },
    [isOwned, isLocked, handleItemPress]
  );

  const keyExtractor = useCallback((item: ShopItem) => item.id, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#C8A84B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Segmented tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shelter' && styles.tabActive]}
          onPress={() => setActiveTab('shelter')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'shelter' && styles.tabTextActive]}>
            쉘터
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'avatar' && styles.tabActive]}
          onPress={() => setActiveTab('avatar')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'avatar' && styles.tabTextActive]}>
            아바타
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>아이템이 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}

const GAP = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#C8A84B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  tabTextActive: {
    color: '#C8A84B',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  cellWrapper: {
    flex: 1,
  },
  cellRight: {
    // right column — gap already handled by row gap
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
  },
});
