import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useColor } from '../theme/ThemeProvider';

export const ShimmerPlaceholder: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
  const COLOR = useColor();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-400, 400] });

  return (
    <View style={[{ backgroundColor: COLOR.surfaceAlt, overflow: 'hidden' }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: COLOR.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)' },
          ]}
        />
      </Animated.View>
    </View>
  );
};
