import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

const LEAF_PATH = 'M12 2C8 6 4 10 4 15a8 8 0 0 0 16 0c0-5-4-9-8-13z';

const POSITIONS = [
  { x: 20, y: 40, rot: -20, scale: 1.4 },
  { x: 260, y: 90, rot: 35, scale: 1.1 },
  { x: 120, y: 220, rot: 10, scale: 1.6 },
  { x: 300, y: 320, rot: -45, scale: 1.2 },
  { x: 40, y: 420, rot: 60, scale: 1.0 },
  { x: 220, y: 500, rot: -15, scale: 1.3 },
  { x: 80, y: 640, rot: 25, scale: 1.5 },
  { x: 280, y: 720, rot: -30, scale: 1.2 },
];

export const LeafPatternBackground: React.FC<{ color: string; opacity?: number }> = ({
  color,
  opacity = 0.06,
}) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width="100%" height="100%">
      {POSITIONS.map((p, i) => (
        <G
          key={i}
          transform={`translate(${p.x}, ${p.y}) rotate(${p.rot}) scale(${p.scale})`}
          opacity={opacity}
        >
          <Path d={LEAF_PATH} fill={color} />
        </G>
      ))}
    </Svg>
  </View>
);
