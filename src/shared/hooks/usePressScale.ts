import { useRef } from 'react';
import { Animated } from 'react-native';

export function usePressScale(scaleTo = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  return {
    animatedStyle: { transform: [{ scale }] },
    onPressIn,
    onPressOut,
  };
}
