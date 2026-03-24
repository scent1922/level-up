import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { PresetCard } from '@/components/onboarding/PresetCard';
import { SHELTER_PRESETS } from '@/constants/presets';

export default function ShelterSelectScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleNext() {
    if (!selectedId) return;
    router.push({
      pathname: '/onboarding/avatar-select',
      params: { shelterId: selectedId },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>쉘터를 선택하세요</Text>
        <Text style={styles.subtitle}>생존 거점이 될 쉘터 유형을 고르세요</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          {SHELTER_PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              name={preset.name}
              description={preset.description}
              color={preset.color}
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
