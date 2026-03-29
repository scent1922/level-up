import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useUserStore } from '@/stores/user-store';
import { useShelterStore } from '@/stores/shelter-store';
import { useQuestStore } from '@/stores/quest-store';
import FrequencyPicker, { type FrequencyValue } from '@/components/quest/FrequencyPicker';
import type { FrequencyType } from '@/types';

const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  daily: '매일',
  specific_days: '특정 요일',
  every_n_days: 'N일마다',
  n_per_week: '주 N회',
};

export default function FirstQuestScreen() {
  const params = useLocalSearchParams<{ shelterId: string; avatarId: string }>();
  const shelterId = Array.isArray(params.shelterId) ? params.shelterId[0] : params.shelterId;
  const avatarId = Array.isArray(params.avatarId) ? params.avatarId[0] : params.avatarId;

  const [questName, setQuestName] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [frequencyValue, setFrequencyValue] = useState('[]');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderHour, setReminderHour] = useState('09');
  const [reminderMinute, setReminderMinute] = useState('00');
  const [isLoading, setIsLoading] = useState(false);

  async function handleStart() {
    if (!shelterId || !avatarId) {
      Alert.alert('오류', '쉘터와 아바타를 먼저 선택해주세요');
      return;
    }

    if (!questName.trim()) {
      Alert.alert('퀘스트 이름을 입력하세요');
      return;
    }

    setIsLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Push notification permission not granted');
      }

      await useUserStore.getState().createNewUser(shelterId, avatarId);
      await useShelterStore.getState().createShelter(shelterId);
      await useShelterStore.getState().createAvatar(avatarId);

      const h = parseInt(reminderHour, 10) || 9;
      const m = parseInt(reminderMinute, 10) || 0;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      await useQuestStore.getState().createQuest({
        name: questName.trim(),
        description: null,
        frequency_type: frequencyType,
        frequency_value: frequencyValue,
        reminder_time: timeStr,
        reminder_enabled: reminderEnabled && status === 'granted',
        is_active: true,
      });

      router.replace('/(tabs)');
    } catch (e) {
      console.error('Onboarding completion failed:', e);
      Alert.alert('오류', '설정 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleFrequencyChange(result: FrequencyValue) {
    setFrequencyType(result.type);
    setFrequencyValue(result.value);
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>첫 번째 퀘스트를{'\n'}만들어보세요</Text>
        <Text style={styles.subtitle}>꾸준히 실천할 습관 하나를 정하세요</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>퀘스트 이름</Text>
          <TextInput
            style={styles.input}
            value={questName}
            onChangeText={setQuestName}
            placeholder="예: 물 2L 마시기"
            placeholderTextColor="#555555"
            maxLength={40}
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>반복 주기</Text>
          <FrequencyPicker
            value={{ type: frequencyType, value: frequencyValue }}
            onChange={handleFrequencyChange}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>알림</Text>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderLabel}>알림 받기</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#2A2A2A', true: '#C8A84B' }}
              thumbColor="#FFFFFF"
            />
          </View>
          {reminderEnabled && (
            <View style={styles.timeRow}>
              <TextInput
                style={styles.timeInput}
                value={reminderHour}
                onChangeText={(t) => {
                  const num = t.replace(/[^0-9]/g, '').slice(0, 2);
                  setReminderHour(num);
                }}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="09"
                placeholderTextColor="#555555"
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={reminderMinute}
                onChangeText={(t) => {
                  const num = t.replace(/[^0-9]/g, '').slice(0, 2);
                  setReminderMinute(num);
                }}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="00"
                placeholderTextColor="#555555"
              />
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, (!questName.trim() || isLoading) && styles.buttonDisabled]}
        onPress={handleStart}
        disabled={!questName.trim() || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#0A0A0A" />
        ) : (
          <Text style={[styles.buttonText, (!questName.trim() || isLoading) && styles.buttonTextDisabled]}>
            시작하기
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 1,
    lineHeight: 38,
  },
  subtitle: {
    color: '#888888',
    fontSize: 14,
  },
  form: {
    flex: 1,
    gap: 24,
    marginBottom: 32,
  },
  field: {
    gap: 10,
  },
  label: {
    color: '#C8A84B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reminderLabel: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  timeInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    width: 60,
    textAlign: 'center',
    paddingVertical: 10,
  },
  timeSeparator: {
    color: '#888888',
    fontSize: 20,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#C8A84B',
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#2A2A2A',
  },
  buttonText: {
    color: '#0A0A0A',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  buttonTextDisabled: {
    color: '#555555',
  },
});
