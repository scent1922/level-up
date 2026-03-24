import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>LEVEL-UP</Text>
        <Text style={styles.tagline}>당신의 습관이 쉘터를 키웁니다</Text>
        <View style={styles.divider} />
        <Text style={styles.body}>
          문명이 무너진 세계. 당신은 생존자입니다.{'\n'}
          매일의 습관이 당신의 쉘터를 지키고 성장시킵니다.{'\n'}
          게으름은 붕괴를 부릅니다. 지금 시작하세요.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/onboarding/shelter-select')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 24,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#C8A84B',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 16,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 1,
  },
  divider: {
    height: 2,
    backgroundColor: '#C8A84B',
    marginBottom: 32,
    marginHorizontal: 48,
  },
  body: {
    color: '#888888',
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C8A84B',
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0A0A0A',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
