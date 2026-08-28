import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

export const TimelineConnector: React.FC<{
  color: string;
  nodeColor: string;
  showLine?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}> = ({ color, nodeColor, showLine = true, isFirst = false, isLast = false }) => (
  <View style={{ width: 24, alignItems: 'center' }}>
    {showLine && (
      <Svg width={24} height="100%" style={{ position: 'absolute', top: isFirst ? 20 : 0, bottom: isLast ? '50%' : 0 }}>
        <Line
          x1="12"
          y1="0"
          x2="12"
          y2="100%"
          stroke={color}
          strokeWidth={2}
          strokeDasharray="2,4"
          strokeLinecap="round"
        />
      </Svg>
    )}
    <Svg width={24} height={24} style={{ marginTop: 14 }}>
      <Circle cx="12" cy="12" r="7" fill={nodeColor} stroke="#FFFFFF" strokeWidth={2.5} />
    </Svg>
  </View>
);
