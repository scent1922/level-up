import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import NotificationSettings from '@/components/settings/NotificationSettings';

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <Text style={styles.pageTitle}>설정</Text>

        {/* Section 1: Notifications */}
        <SectionHeader title="알림" />
        <NotificationSettings />

        {/* Section 2: App info */}
        <SectionHeader title="앱 정보" />
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>앱 버전</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.appDescriptionBlock}>
            <Text style={styles.appName}>Level-Up</Text>
            <Text style={styles.appDescription}>
              폐허가 된 세계에서 퀘스트를 완료하며 쉘터를 키워가는 생존 성장 게임.{'\n'}
              매일 습관을 지키고 쉘터를 지켜내세요.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.tint,
    marginTop: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 24,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: {
    color: '#e0e0e0',
    fontSize: 15,
  },
  infoValue: {
    color: '#888',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 16,
  },
  appDescriptionBlock: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  appName: {
    color: Colors.dark.tint,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  appDescription: {
    color: '#777',
    fontSize: 13,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});
