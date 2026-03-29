import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

export type AvatarMotionState = 'idle' | 'walking' | 'sleeping' | 'interacting';

export function useAvatarMotion(state: AvatarMotionState) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Reset all values before applying new animation
    translateY.value = 0;
    rotate.value = 0;
    scale.value = 1;

    switch (state) {
      case 'idle': {
        // Gentle breathing bounce: translateY oscillates -2px → +2px over ~2 seconds
        translateY.value = withRepeat(
          withSequence(
            withTiming(-2, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
            withTiming(2, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          false,
        );
        // Slight scale pulse: 1.0 → 1.02 → 1.0
        scale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
            withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          false,
        );
        break;
      }

      case 'walking': {
        // Faster bounce: translateY oscillates -3px → +3px over ~0.5 seconds
        translateY.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 250, easing: Easing.inOut(Easing.quad) }),
            withTiming(3, { duration: 250, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          false,
        );
        // Tilt left/right alternating ±3 degrees
        rotate.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 250, easing: Easing.inOut(Easing.quad) }),
            withTiming(3, { duration: 250, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          false,
        );
        break;
      }

      case 'sleeping': {
        // Constant -15 degrees tilt (lying down)
        rotate.value = withTiming(-15, { duration: 500, easing: Easing.out(Easing.quad) });
        // Very slow breathing: translateY oscillates -1px → +1px over ~3 seconds
        translateY.value = withDelay(
          500,
          withRepeat(
            withSequence(
              withTiming(-1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
              withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
            ),
            -1,
            false,
          ),
        );
        // Slow pulse: 1.0 → 0.98 → 1.0
        scale.value = withRepeat(
          withSequence(
            withTiming(0.98, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
            withTiming(1.0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          false,
        );
        break;
      }

      case 'interacting': {
        // Quick bow: rotate 0 → 10 → 0 degrees, period ~1 second
        rotate.value = withRepeat(
          withSequence(
            withTiming(10, { duration: 300, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          false,
        );
        // Slight dip: translateY 0 → 4px and back, synchronized with bow
        translateY.value = withRepeat(
          withSequence(
            withTiming(4, { duration: 300, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          false,
        );
        break;
      }
    }
  }, [state, translateY, rotate, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return animatedStyle;
}
