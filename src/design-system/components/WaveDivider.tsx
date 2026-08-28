import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const WaveDivider: React.FC<{ color: string; height?: number; flip?: boolean }> = ({
  color,
  height = 28,
  flip = false,
}) => (
  <Svg
    width="100%"
    height={height}
    viewBox="0 0 400 40"
    preserveAspectRatio="none"
    style={flip ? { transform: [{ rotate: '180deg' }] } : undefined}
  >
    <Path d="M0,20 C100,45 300,-5 400,20 L400,40 L0,40 Z" fill={color} />
  </Svg>
);
