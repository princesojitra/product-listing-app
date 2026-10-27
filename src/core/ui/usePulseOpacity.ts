import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/** A looping 0.4<->1 opacity pulse, for skeleton loading placeholders. */
export function usePulseOpacity(): Animated.Value {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return opacity;
}
