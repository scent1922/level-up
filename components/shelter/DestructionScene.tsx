import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useShelterStore } from '@/stores/shelter-store';

interface DestructionSceneProps {
  visible: boolean;
}

const { width, height } = Dimensions.get('window');

function FallingParticle({ index }: { index: number }) {
  const startX = (Math.random() * width * 0.8) + width * 0.1;
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const duration = 1500 + Math.random() * 1500;
    const delay = index * 120;

    // Fix Issue 3: store timer handle so it can be cleared on unmount
    const timer = setTimeout(() => {
      translateY.value = withRepeat(
        withTiming(height + 20, { duration, easing: Easing.in(Easing.quad) }),
        -1,
        false
      );
      rotate.value = withRepeat(
        withTiming(360 + Math.random() * 360, { duration }),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: duration * 0.7 }),
          withTiming(0, { duration: duration * 0.3 })
        ),
        -1,
        false
      );
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const pWidth = 6 + Math.random() * 14;
  const pHeight = 4 + Math.random() * 10;

  return (
    <Animated.View
      style={[
        styles.particle,
        style,
        { width: pWidth, height: pHeight },
      ]}
    />
  );
}

export default function DestructionScene({ visible }: DestructionSceneProps) {
  const [showOptions, setShowOptions] = useState(false);
  const destroyShelter = useShelterStore((state) => state.destroyShelter);

  const bgOpacity = useSharedValue(0);
  const textShakeX = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      setShowOptions(false);
      bgOpacity.value = 0;
      return;
    }

    // Fade in background
    bgOpacity.value = withTiming(1, { duration: 800 });

    // Shake text
    textShakeX.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 80 }),
        withTiming(-12, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(-8, { duration: 80 }),
        withTiming(0, { duration: 80 }),
      ),
      3,
      false
    );

    // Show options after 3 seconds
    const timer = setTimeout(() => setShowOptions(true), 3000);
    return () => clearTimeout(timer);
  }, [visible]);

  const handleRestart = async () => {
    await destroyShelter();
    router.replace('/onboarding');
  };

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: textShakeX.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.container, bgStyle]}>
        {/* Falling particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <FallingParticle key={i} index={i} />
        ))}

        {/* Destruction text */}
        <View style={styles.content}>
          <Animated.Text style={[styles.destructionText, shakeStyle]}>
            쉘터가 파괴되었습니다
          </Animated.Text>
          <Text style={styles.subText}>방치로 인해 모든 것이 무너졌습니다.</Text>
        </View>

        {/* Options — appear after 3 seconds */}
        {showOptions && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
              <Text style={styles.restartButtonText}>새로운 쉘터 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(10,0,0,0.97)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#5a3a2a',
    borderRadius: 2,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  destructionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff2222',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  subText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 32,
    right: 32,
    alignItems: 'center',
  },
  restartButton: {
    backgroundColor: '#cc2222',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
