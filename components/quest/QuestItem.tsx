import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import type { Quest, FrequencyType } from '@/types';

interface Props {
  quest: Quest;
  isCompletedToday: boolean;
  onCheck: (id: string) => void;
  onPress: (quest: Quest) => void;
}

const FREQUENCY_LABELS: Record<FrequencyType, (value: string) => string> = {
  daily: () => '매일',
  specific_days: (v) => {
    try {
      const days = JSON.parse(v) as number[];
      const labels = ['일', '월', '화', '수', '목', '금', '토'];
      if (days.length === 0) return '특정 요일';
      return days.map((d) => labels[d]).join(', ');
    } catch {
      return '특정 요일';
    }
  },
  every_n_days: (v) => {
    try {
      const n = JSON.parse(v) as number;
      return `${n}일마다`;
    } catch {
      return 'N일마다';
    }
  },
  n_per_week: (v) => {
    try {
      const n = JSON.parse(v) as number;
      return `주 ${n}회`;
    } catch {
      return '주 N회';
    }
  },
};

export default function QuestItem({ quest, isCompletedToday, onCheck, onPress }: Props) {
  const xpOpacity = useSharedValue(0);
  const xpTranslateY = useSharedValue(0);
  const isAnimating = useRef(false);

  const xpAnimStyle = useAnimatedStyle(() => ({
    opacity: xpOpacity.value,
    transform: [{ translateY: xpTranslateY.value }],
  }));

  const triggerXpAnimation = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    xpTranslateY.value = 0;
    xpOpacity.value = 0;
    xpOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 200 })
    );
    xpTranslateY.value = withTiming(-30, { duration: 800 }, () => {
      runOnJS(() => { isAnimating.current = false; })();
    });
  }, [xpOpacity, xpTranslateY]);

  const handleCheck = useCallback(() => {
    if (isCompletedToday) return;
    triggerXpAnimation();
    onCheck(quest.id);
  }, [isCompletedToday, quest.id, onCheck, triggerXpAnimation]);

  const handlePress = useCallback(() => {
    onPress(quest);
  }, [quest, onPress]);

  const frequencyLabel = FREQUENCY_LABELS[quest.frequency_type]?.(quest.frequency_value) ?? '매일';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Check button */}
      <View style={styles.checkArea}>
        <TouchableOpacity
          style={[styles.checkBtn, isCompletedToday && styles.checkBtnDone]}
          onPress={handleCheck}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isCompletedToday && (
            <Text style={styles.checkMark}>✓</Text>
          )}
        </TouchableOpacity>
        <Animated.View style={[styles.xpPopup, xpAnimStyle]} pointerEvents="none">
          <Text style={styles.xpText}>+20 XP</Text>
        </Animated.View>
      </View>

      {/* Quest info */}
      <View style={styles.info}>
        <Text
          style={[styles.questName, isCompletedToday && styles.questNameDone]}
          numberOfLines={1}
        >
          {quest.name}
        </Text>
        <View style={styles.badges}>
          <View style={styles.frequencyBadge}>
            <Text style={styles.frequencyText}>{frequencyLabel}</Text>
          </View>
        </View>
      </View>

      {/* Reminder time */}
      {quest.reminder_enabled && quest.reminder_time != null && (
        <Text style={styles.reminderTime}>{quest.reminder_time}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    gap: 12,
  },
  checkArea: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkBtnDone: {
    backgroundColor: '#C8A84B',
    borderColor: '#C8A84B',
  },
  checkMark: {
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: '700',
  },
  xpPopup: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -20 }],
    width: 50,
  },
  xpText: {
    color: '#C8A84B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  questName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E8E8E8',
  },
  questNameDone: {
    textDecorationLine: 'line-through',
    color: '#555',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  frequencyBadge: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  frequencyText: {
    fontSize: 11,
    color: '#888',
  },
  reminderTime: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
  },
});
