import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDatabase } from '@/db/database';
import { getQuestLogsByRange } from '@/db/queries/quest-log-queries';
import type { Quest, QuestLog } from '@/types';

const GOLD = '#C8A84B';
const TRACK_BG = '#2A2A2A';
const CELL_BG = '#1A1A1A';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const BAR_MAX_HEIGHT = 80;
const BAR_WIDTH = 8;

interface WeeklyStatsProps {
  userId: string;
  quests: Quest[];
}

interface DayStat {
  label: string;
  completed: number;
  total: number;
  xpEarned: number;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function padDate(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDateStr(date: Date): string {
  return `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`;
}

export default function WeeklyStats({ userId, quests }: WeeklyStatsProps) {
  const [stats, setStats] = useState<DayStat[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  const loadStats = useCallback(async () => {
    const today = new Date();
    const monday = getMonday(today);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const db = await getDatabase();
    const logs: QuestLog[] = await getQuestLogsByRange(
      db,
      userId,
      monday.toISOString(),
      sunday.toISOString()
    );

    const totalQuests = quests.filter((q) => q.is_active).length;

    // Group logs by date
    const byDate: Record<string, QuestLog[]> = {};
    logs.forEach((log) => {
      const key = log.completed_at.slice(0, 10);
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(log);
    });

    const daystats: DayStat[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const key = formatDateStr(day);
      const dayLogs = byDate[key] ?? [];
      daystats.push({
        label: DAY_LABELS[i],
        completed: dayLogs.length,
        total: totalQuests,
        xpEarned: dayLogs.reduce((sum, l) => sum + l.xp_earned, 0),
      });
    }

    setStats(daystats);
    setTotalCompleted(logs.length);
    setTotalXP(logs.reduce((sum, l) => sum + l.xp_earned, 0));
  }, [userId, quests]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>이번 주</Text>

      {/* Bar chart */}
      <View style={styles.chartRow}>
        {stats.map((stat) => {
          const rate = stat.total > 0 ? Math.min(stat.completed / stat.total, 1) : 0;
          const filledHeight = Math.max(rate * BAR_MAX_HEIGHT, rate > 0 ? 4 : 0);
          return (
            <View key={stat.label} style={styles.barWrapper}>
              <View style={[styles.barTrack, { height: BAR_MAX_HEIGHT }]}>
                <View
                  style={[
                    styles.barFill,
                    { height: filledHeight },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>완료 퀘스트</Text>
          <Text style={styles.summaryValue}>{totalCompleted}개</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>획득 XP</Text>
          <Text style={styles.summaryValue}>{totalXP}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CELL_BG,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8E8E8',
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    width: BAR_WIDTH,
    backgroundColor: TRACK_BG,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: BAR_WIDTH,
    backgroundColor: GOLD,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: TRACK_BG,
    paddingTop: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD,
  },
});
