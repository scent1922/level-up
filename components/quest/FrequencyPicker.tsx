import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import type { FrequencyType } from '@/types';

export interface FrequencyValue {
  type: FrequencyType;
  value: string;
}

interface Props {
  value: FrequencyValue;
  onChange: (v: FrequencyValue) => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function FrequencyPicker({ value, onChange }: Props) {
  const [selectedDays, setSelectedDays] = useState<number[]>(() => {
    if (value.type === 'specific_days') {
      try {
        return JSON.parse(value.value) as number[];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [nDays, setNDays] = useState<string>(() => {
    if (value.type === 'every_n_days') {
      try {
        const parsed = JSON.parse(value.value);
        return String(parsed);
      } catch {
        return '2';
      }
    }
    return '2';
  });

  const [nPerWeek, setNPerWeek] = useState<string>(() => {
    if (value.type === 'n_per_week') {
      try {
        const parsed = JSON.parse(value.value);
        return String(parsed);
      } catch {
        return '3';
      }
    }
    return '3';
  });

  const options: { type: FrequencyType; label: string }[] = [
    { type: 'daily', label: '매일' },
    { type: 'specific_days', label: '특정 요일' },
    { type: 'every_n_days', label: 'N일마다' },
    { type: 'n_per_week', label: '주 N회' },
  ];

  const selectType = (type: FrequencyType) => {
    let newValue = '[]';
    if (type === 'daily') newValue = '[]';
    else if (type === 'specific_days') newValue = JSON.stringify(selectedDays);
    else if (type === 'every_n_days') newValue = JSON.stringify(parseInt(nDays, 10) || 2);
    else if (type === 'n_per_week') newValue = JSON.stringify(parseInt(nPerWeek, 10) || 3);
    onChange({ type, value: newValue });
  };

  const toggleDay = (dayIdx: number) => {
    const next = selectedDays.includes(dayIdx)
      ? selectedDays.filter((d) => d !== dayIdx)
      : [...selectedDays, dayIdx].sort((a, b) => a - b);
    setSelectedDays(next);
    onChange({ type: 'specific_days', value: JSON.stringify(next) });
  };

  const handleNDaysChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setNDays(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num >= 2 && num <= 30) {
      onChange({ type: 'every_n_days', value: JSON.stringify(num) });
    }
  };

  const handleNPerWeekChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setNPerWeek(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num >= 1 && num <= 7) {
      onChange({ type: 'n_per_week', value: JSON.stringify(num) });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.optionsRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.type}
            style={[styles.optionBtn, value.type === opt.type && styles.optionBtnActive]}
            onPress={() => selectType(opt.type)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, value.type === opt.type && styles.optionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {value.type === 'specific_days' && (
        <View style={styles.daysRow}>
          {DAY_LABELS.map((label, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.dayBtn, selectedDays.includes(idx) && styles.dayBtnActive]}
              onPress={() => toggleDay(idx)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, selectedDays.includes(idx) && styles.dayTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {value.type === 'every_n_days' && (
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>매</Text>
          <TextInput
            style={styles.numberInput}
            value={nDays}
            onChangeText={handleNDaysChange}
            keyboardType="number-pad"
            maxLength={2}
            placeholderTextColor="#555"
          />
          <Text style={styles.inputLabel}>일마다 (2–30)</Text>
        </View>
      )}

      {value.type === 'n_per_week' && (
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>주</Text>
          <TextInput
            style={styles.numberInput}
            value={nPerWeek}
            onChangeText={handleNPerWeekChange}
            keyboardType="number-pad"
            maxLength={1}
            placeholderTextColor="#555"
          />
          <Text style={styles.inputLabel}>회 (1–7)</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  optionBtnActive: {
    backgroundColor: '#3A2E10',
    borderColor: '#C8A84B',
  },
  optionText: {
    fontSize: 13,
    color: '#888',
  },
  optionTextActive: {
    color: '#C8A84B',
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  dayBtnActive: {
    backgroundColor: '#3A2E10',
    borderColor: '#C8A84B',
  },
  dayText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  dayTextActive: {
    color: '#C8A84B',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#888',
  },
  numberInput: {
    width: 52,
    height: 36,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    color: '#E8E8E8',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
});
