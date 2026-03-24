import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useUserStore } from '@/stores/user-store';
import { useQuestStore } from '@/stores/quest-store';
import StreakBanner from '@/components/history/StreakBanner';
import CalendarView from '@/components/history/CalendarView';
import WeeklyStats from '@/components/history/WeeklyStats';

export default function HistoryScreen() {
  const user = useUserStore((state) => state.user);
  const quests = useQuestStore((state) => state.quests);

  if (!user) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <StreakBanner streakCount={user.streak_count} />
      <CalendarView userId={user.id} quests={quests} />
      <WeeklyStats userId={user.id} quests={quests} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  contentContainer: {
    paddingBottom: 32,
  },
});
