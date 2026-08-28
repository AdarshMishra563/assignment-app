import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

export const RadialGlowBackground: React.FC<{
  color: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ color, opacity = 0.22, style }) => (
  <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
    <Svg width="100%" height="100%">
      <Defs>
        <RadialGradient id="radialGlow" cx="50%" cy="0%" r="80%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.6" stopColor={color} stopOpacity={opacity * 0.4} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx="50%" cy="0%" r="70%" fill="url(#radialGlow)" />
    </Svg>
  </View>
);
