import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuestStore } from '@/stores/quest-store';
import { getDatabase } from '@/db/database';
import { getQuestLogsForDate } from '@/db/queries/quest-log-queries';
import { useUserStore } from '@/stores/user-store';
import QuestItem from './QuestItem';
import type { Quest } from '@/types';

type Tab = 'today' | 'all';

interface Props {
  onQuestPress: (quest: Quest) => void;
}

export default function QuestList({ onQuestPress }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const quests = useQuestStore((s) => s.quests);
  const todayQuests = useQuestStore((s) => s.todayQuests);
  const loadQuests = useQuestStore((s) => s.loadQuests);
  const completeQuest = useQuestStore((s) => s.completeQuest);
  const user = useUserStore((s) => s.user);

  const loadCompletedIds = useCallback(async () => {
    if (!user) return;
    try {
      const db = await getDatabase();
      const today = new Date().toISOString().slice(0, 10);
      const logs = await getQuestLogsForDate(db, user.id, today);
      setCompletedIds(new Set(logs.map((l) => l.quest_id)));
    } catch {
      // silently fail
    }
  }, [user]);

  useEffect(() => {
    loadCompletedIds();
  }, [loadCompletedIds]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadQuests();
      await loadCompletedIds();
    } finally {
      setRefreshing(false);
    }
  }, [loadQuests, loadCompletedIds]);

  const handleCheck = useCallback(async (questId: string) => {
    // Optimistically mark as completed
    setCompletedIds((prev) => new Set([...prev, questId]));
    try {
      await completeQuest(questId);
    } catch {
      // Revert on error
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(questId);
        return next;
      });
    }
  }, [completeQuest]);

  const displayedQuests = activeTab === 'today'
    ? todayQuests.filter((q) => q.is_active)
    : quests.filter((q) => q.is_active);

  const renderItem = useCallback(({ item }: { item: Quest }) => (
    <QuestItem
      quest={item}
      isCompletedToday={completedIds.has(item.id)}
      onCheck={handleCheck}
      onPress={onQuestPress}
    />
  ), [completedIds, handleCheck, onQuestPress]);

  const keyExtractor = useCallback((item: Quest) => item.id, []);

  const EmptyState = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>아직 퀘스트가 없습니다</Text>
      <Text style={styles.emptySubtitle}>새 퀘스트를 만들어보세요!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Segmented tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'today' && styles.tabActive]}
          onPress={() => setActiveTab('today')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>
            오늘
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={displayedQuests}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          displayedQuests.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#C8A84B"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2A2A2A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  tabTextActive: {
    color: '#C8A84B',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#444',
  },
});
