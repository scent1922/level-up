import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useQuestStore } from '@/stores/quest-store';
import QuestList from '@/components/quest/QuestList';
import QuestFormModal from '@/components/quest/QuestFormModal';
import type { Quest } from '@/types';

export default function QuestsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  const loadQuests = useQuestStore((s) => s.loadQuests);
  const createQuest = useQuestStore((s) => s.createQuest);
  const updateQuest = useQuestStore((s) => s.updateQuest);
  const deleteQuest = useQuestStore((s) => s.deleteQuest);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const openCreateModal = useCallback(() => {
    setSelectedQuest(null);
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((quest: Quest) => {
    setSelectedQuest(quest);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedQuest(null);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>퀘스트</Text>
      </View>

      {/* Quest List */}
      <QuestList onQuestPress={openEditModal} />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openCreateModal}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Form Modal */}
      <QuestFormModal
        visible={modalVisible}
        quest={selectedQuest}
        onClose={closeModal}
        onCreate={createQuest}
        onUpdate={updateQuest}
        onDelete={deleteQuest}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E8E8E8',
    letterSpacing: -0.5,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C8A84B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C8A84B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#0A0A0A',
    fontWeight: '300',
    lineHeight: 32,
  },
});
