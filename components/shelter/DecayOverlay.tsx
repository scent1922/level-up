import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { DecayStage } from '@/types';

interface DecayOverlayProps {
  decayStage: DecayStage;
}

const { width, height } = Dimensions.get('window');

// A single floating dust particle
function DustParticle({ index }: { index: number }) {
  const translateY = useSharedValue(Math.random() * height);
  const translateX = useSharedValue(Math.random() * width);
  const opacity = useSharedValue(Math.random() * 0.5 + 0.2);

  useEffect(() => {
    const duration = 4000 + Math.random() * 4000;
    const delay = index * 300;

    translateY.value = withRepeat(
      withTiming(translateY.value - 80 - Math.random() * 60, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      true
    );
    translateX.value = withRepeat(
      withTiming(translateX.value + (Math.random() - 0.5) * 40, {
        duration: duration * 0.7,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(Math.random() * 0.3 + 0.1, { duration: duration * 0.5 }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const size = 2 + Math.random() * 3;

  return (
    <Animated.View
      style={[
        styles.dustParticle,
        style,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );
}

// Flickering light overlay for stage 2
function FlickerOverlay() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, {
        duration: 600 + Math.random() * 400,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[StyleSheet.absoluteFill, styles.flickerOverlay, animStyle]} />;
}

// Diagonal crack lines for stage 2
function CrackLines() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.crack1} />
      <View style={styles.crack2} />
      <View style={styles.crack3} />
    </View>
  );
}

export default function DecayOverlay({ decayStage }: DecayOverlayProps) {
  if (decayStage === 0) return null;

  if (decayStage === 1) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.overlayStage1]} pointerEvents="none">
        {Array.from({ length: 8 }).map((_, i) => (
          <DustParticle key={i} index={i} />
        ))}
      </View>
    );
  }

  // Stage 2
  return (
    <View style={[StyleSheet.absoluteFill, styles.overlayStage2]} pointerEvents="none">
      {Array.from({ length: 14 }).map((_, i) => (
        <DustParticle key={i} index={i} />
      ))}
      <CrackLines />
      <FlickerOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  overlayStage1: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  overlayStage2: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dustParticle: {
    position: 'absolute',
    backgroundColor: '#888',
  },
  flickerOverlay: {
    backgroundColor: 'rgba(255,160,0,0.06)',
  },
  crack1: {
    position: 'absolute',
    width: 2,
    height: 120,
    backgroundColor: 'rgba(80,60,40,0.6)',
    top: '20%',
    left: '30%',
    transform: [{ rotate: '35deg' }],
  },
  crack2: {
    position: 'absolute',
    width: 1.5,
    height: 90,
    backgroundColor: 'rgba(80,60,40,0.5)',
    top: '45%',
    left: '60%',
    transform: [{ rotate: '-25deg' }],
  },
  crack3: {
    position: 'absolute',
    width: 1,
    height: 70,
    backgroundColor: 'rgba(80,60,40,0.4)',
    top: '65%',
    left: '20%',
    transform: [{ rotate: '50deg' }],
  },
});
