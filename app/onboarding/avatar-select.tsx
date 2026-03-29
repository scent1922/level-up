import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { PresetCard } from '@/components/onboarding/PresetCard';
import { AVATAR_PRESETS } from '@/constants/presets';
import { AvatarPortraits } from '@/assets/asset-manifest';

export default function AvatarSelectScreen() {
  const { shelterId } = useLocalSearchParams<{ shelterId: string }>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleNext() {
    if (!selectedId) return;
    router.push({
      pathname: '/onboarding/first-quest',
      params: { shelterId, avatarId: selectedId },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>생존자를 선택하세요</Text>
        <Text style={styles.subtitle}>당신을 대표할 생존자 캐릭터를 고르세요</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          {AVATAR_PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              name={preset.name}
              color={preset.color}
              image={AvatarPortraits[preset.id]}
              selected={selectedId === preset.id}
              onPress={() => setSelectedId(preset.id)}
            />
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.button, !selectedId && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!selectedId}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, !selectedId && styles.buttonTextDisabled]}>다음</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
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
  },
  subtitle: {
    color: '#888888',
    fontSize: 14,
  },
  grid: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
