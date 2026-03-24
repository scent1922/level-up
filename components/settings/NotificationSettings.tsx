import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { create } from 'zustand';

// MVP: simple in-memory Zustand store for notification preferences.
// Persists only for the app session; can be wired to SQLite later.
interface NotificationPrefs {
  questReminder: boolean;
  dailySummary: boolean;
  dailySummaryTime: string; // HH:mm
  shelterWarning: boolean;
  levelUp: boolean;
  setQuestReminder: (v: boolean) => void;
  setDailySummary: (v: boolean) => void;
  setDailySummaryTime: (v: string) => void;
  setShelterWarning: (v: boolean) => void;
  setLevelUp: (v: boolean) => void;
}

export const useNotificationStore = create<NotificationPrefs>((set) => ({
  questReminder: true,
  dailySummary: false,
  dailySummaryTime: '09:00',
  shelterWarning: true,
  levelUp: true,
  setQuestReminder: (v) => set({ questReminder: v }),
  setDailySummary: (v) => set({ dailySummary: v }),
  setDailySummaryTime: (v) => set({ dailySummaryTime: v }),
  setShelterWarning: (v) => set({ shelterWarning: v }),
  setLevelUp: (v) => set({ levelUp: v }),
}));

interface RowProps {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  children?: React.ReactNode;
}

function SettingRow({ label, value, onToggle, children }: RowProps) {
  return (
    <View style={styles.rowWrapper}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#333', true: '#c8a200' }}
          thumbColor={value ? '#ffd700' : '#888'}
        />
      </View>
      {value && children}
    </View>
  );
}

export default function NotificationSettings() {
  const {
    questReminder, setQuestReminder,
    dailySummary, setDailySummary,
    dailySummaryTime, setDailySummaryTime,
    shelterWarning, setShelterWarning,
    levelUp, setLevelUp,
  } = useNotificationStore();

  const [timeInput, setTimeInput] = useState(dailySummaryTime);

  useEffect(() => {
    setTimeInput(dailySummaryTime);
  }, [dailySummaryTime]);

  const handleTimeBlur = () => {
    const match = timeInput.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (match) {
      setDailySummaryTime(timeInput);
    } else {
      setTimeInput(dailySummaryTime); // revert to last valid value
    }
  };

  return (
    <View style={styles.container}>
      <SettingRow label="퀘스트 리마인더" value={questReminder} onToggle={setQuestReminder} />

      <SettingRow label="데일리 요약" value={dailySummary} onToggle={setDailySummary}>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>알림 시각</Text>
          <TextInput
            style={styles.timeInput}
            value={timeInput}
            onChangeText={setTimeInput}
            onBlur={handleTimeBlur}
            placeholder="09:00"
            placeholderTextColor="#555"
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            maxLength={5}
          />
        </View>
      </SettingRow>

      <SettingRow label="쉘터 위험 경고" value={shelterWarning} onToggle={setShelterWarning} />

      <SettingRow label="레벨업 / 보상 알림" value={levelUp} onToggle={setLevelUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  rowWrapper: {
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    marginBottom: 2,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    color: '#e0e0e0',
    fontSize: 15,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  timeLabel: {
    color: '#888',
    fontSize: 13,
  },
  timeInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#444',
    minWidth: 70,
    textAlign: 'center',
  },
});
