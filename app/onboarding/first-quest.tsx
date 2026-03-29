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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useUserStore } from '@/stores/user-store';
import { useShelterStore } from '@/stores/shelter-store';
import { useQuestStore } from '@/stores/quest-store';

export default function FirstQuestScreen() {
  // Fix Issue 5: typed params with array guards for type safety
  const params = useLocalSearchParams<{ shelterId: string; avatarId: string }>();
  const shelterId = Array.isArray(params.shelterId) ? params.shelterId[0] : params.shelterId;
  const avatarId = Array.isArray(params.avatarId) ? params.avatarId[0] : params.avatarId;

  const [questName, setQuestName] = useState('');
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
      // 1. Request push notification permission
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Push notification permission not granted');
      }

      // 2. Create user
      await useUserStore.getState().createNewUser(shelterId, avatarId);

      // 3. Create shelter and avatar
      await useShelterStore.getState().createShelter(shelterId);
      await useShelterStore.getState().createAvatar(avatarId);

      // 4. Create first quest
      await useQuestStore.getState().createQuest({
        name: questName.trim(),
        description: null,
        frequency_type: 'daily',
        frequency_value: JSON.stringify([]),
        reminder_time: '09:00',
        reminder_enabled: status === 'granted',
        is_active: true,
      });

      // 5. Navigate to main app
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Onboarding completion failed:', e);
      Alert.alert('오류', '설정 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
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
          <View style={styles.badge}>
            <Text style={styles.badgeText}>매일</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>알림 시간</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>09:00</Text>
          </View>
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
    marginBottom: 40,
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
    gap: 28,
    marginBottom: 40,
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
  badge: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
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
