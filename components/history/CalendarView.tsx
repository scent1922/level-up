import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { getDatabase } from '@/db/database';
import { getQuestLogsByRange } from '@/db/queries/quest-log-queries';
import type { Quest, QuestLog } from '@/types';

const GOLD = '#C8A84B';
const BG = '#0A0A0A';
const CELL_BG = '#1A1A1A';
const TRACK_BG = '#2A2A2A';
const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarViewProps {
  userId: string;
  quests: Quest[];
}

interface DayStatus {
  completed: number;
  total: number;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function padDate(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${padDate(month + 1)}-${padDate(day)}`;
}

export default function CalendarView({ userId, quests }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [logs, setLogs] = useState<QuestLog[]>([]);

  const loadLogs = useCallback(async () => {
    const db = await getDatabase();
    const startDate = `${year}-${padDate(month + 1)}-01T00:00:00.000Z`;
    const lastDay = getDaysInMonth(year, month);
    const endDate = `${year}-${padDate(month + 1)}-${padDate(lastDay)}T23:59:59.999Z`;
    const result = await getQuestLogsByRange(db, userId, startDate, endDate);
    setLogs(result);
  }, [userId, year, month]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const goToPrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    const isCurrentOrFuture =
      year > today.getFullYear() ||
      (year === today.getFullYear() && month >= today.getMonth());
    if (isCurrentOrFuture) return;
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 30,
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -40) {
        goToNextMonth();
      } else if (gestureState.dx > 40) {
        goToPrevMonth();
      }
    },
  });

  // Build a map of date -> { completed, total } for this month
  const statusMap: Record<string, DayStatus> = {};
  const totalQuests = quests.filter((q) => q.is_active).length;

  logs.forEach((log) => {
    const dateKey = log.completed_at.slice(0, 10);
    if (!statusMap[dateKey]) {
      statusMap[dateKey] = { completed: 0, total: totalQuests };
    }
    statusMap[dateKey].completed += 1;
  });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);
  const todayStr = `${today.getFullYear()}-${padDate(today.getMonth() + 1)}-${padDate(today.getDate())}`;
  const isNextDisabled =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month >= today.getMonth());

  // Build grid cells: nulls for padding + day numbers
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad end to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const renderDayMarker = (day: number) => {
    const dateStr = formatDate(year, month, day);
    const isFuture =
      dateStr > todayStr ||
      (year > today.getFullYear()) ||
      (year === today.getFullYear() && month > today.getMonth());

    if (isFuture) return null;

    const status = statusMap[dateStr];
    if (!status || status.completed === 0) {
      return <View style={styles.markerEmpty} />;
    }
    if (status.completed >= status.total && status.total > 0) {
      return <View style={styles.markerFull} />;
    }
    return <View style={styles.markerPartial} />;
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Month Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {year}년 {month + 1}월
        </Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          style={styles.navButton}
          disabled={isNextDisabled}
        >
          <Text style={[styles.navArrow, isNextDisabled && styles.navArrowDisabled]}>
            {'>'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day-of-week headers */}
      <View style={styles.dowRow}>
        {DAY_HEADERS.map((d) => (
          <View key={d} style={styles.dowCell}>
            <Text style={styles.dowText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={styles.cell} />;
          }
          const dateStr = formatDate(year, month, day);
          const isToday = dateStr === todayStr;
          return (
            <View
              key={dateStr}
              style={[styles.cell, styles.dayCell, isToday && styles.todayCell]}
            >
              <Text style={[styles.dayText, isToday && styles.todayText]}>
                {day}
              </Text>
              {renderDayMarker(day)}
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.markerFull, styles.legendDot]} />
          <Text style={styles.legendText}>모두 완료</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.markerPartial, styles.legendDot]} />
          <Text style={styles.legendText}>일부 완료</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.markerEmpty, styles.legendDot]} />
          <Text style={styles.legendText}>미완료</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 20,
    color: GOLD,
    fontWeight: 'bold',
  },
  navArrowDisabled: {
    color: '#444',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8E8E8',
  },
  dowRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dowCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dowText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%` as const,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayCell: {
    backgroundColor: BG,
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: 2,
    gap: 2,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  dayText: {
    fontSize: 13,
    color: '#E8E8E8',
  },
  todayText: {
    color: GOLD,
    fontWeight: '700',
  },
  markerFull: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GOLD,
  },
  markerPartial: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    opacity: 0.6,
  },
  markerEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TRACK_BG,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: TRACK_BG,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    marginRight: 0,
  },
  legendText: {
    fontSize: 11,
    color: '#888',
  },
});
