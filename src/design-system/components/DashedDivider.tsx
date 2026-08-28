import React from 'react';
import Svg, { Line } from 'react-native-svg';

export const DashedDivider: React.FC<{ color: string; strokeWidth?: number; dashArray?: string }> = ({
  color,
  strokeWidth = 1,
  dashArray = '4,4',
}) => (
  <Svg height={strokeWidth * 2} width="100%" style={{ marginVertical: 6 }}>
    <Line x1="0" y1={strokeWidth} x2="100%" y2={strokeWidth} stroke={color} strokeWidth={strokeWidth} strokeDasharray={dashArray} />
  </Svg>
);
