import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export const BadgeSeal: React.FC<{
  size?: number;
  color: string;
  children: React.ReactNode;
}> = ({ size = 48, color, children }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 3}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="3,3"
        fill="none"
      />
    </Svg>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
