import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useColor } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type DeliveryInstruction =
  | 'leave_at_doorstep'
  | 'ring_bell'
  | 'call_before_delivery'
  | 'other';

export const INSTRUCTION_LABELS: Record<DeliveryInstruction, string> = {
  leave_at_doorstep: 'Leave at door',
  ring_bell: 'Ring the bell',
  call_before_delivery: 'Call on arrival',
  other: 'Other',
};

// SVG: Leave at door
const DoorstepIcon = ({ size = 20, stroke = '#66705F', fill = 'none' }: { size?: number; stroke?: string; fill?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 5 8.6 6.5v11L21 21Z" fill={fill} />
    <Path
      d="M5 3h14a2 2 0 0 1 2 2v16H3V5a2 2 0 0 1 2-2ZM21 5 8.6 6.5v11L21 21"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Circle cx={11.4} cy={12} r={1} fill={stroke} />
  </Svg>
);

// SVG: Ring the bell
const RingBellIcon = ({ size = 20, stroke = '#66705F', fill = 'none' }: { size?: number; stroke?: string; fill?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinejoin="round"
      fill={fill}
    />
    <Path
      d="M13.73 21a2 2 0 0 1-3.46 0"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

// SVG: Call on arrival
const CallBeforeIcon = ({ size = 20, stroke = '#66705F', fill = 'none' }: { size?: number; stroke?: string; fill?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.2 3.5h2.9l1.5 3.6-1.9 1.2a11.5 11.5 0 0 0 5 5l1.2-1.9 3.6 1.5v2.9a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinejoin="round"
      fill={fill}
    />
  </Svg>
);

// SVG: Instruction Note
const InstructionNoteIcon = ({ size = 20, stroke = '#66705F', fill = 'none' }: { size?: number; stroke?: string; fill?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinejoin="round"
      fill={fill}
    />
    <Path d="M14 2v6h6" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" fill="none" />
    <Line x1={8} y1={13} x2={16} y2={13} stroke={stroke} strokeWidth={1.4} strokeLinecap="round" />
    <Line x1={8} y1={17} x2={13} y2={17} stroke={stroke} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

const INSTRUCTIONS: {
  id: DeliveryInstruction;
  renderIcon: (props: { size?: number; stroke?: string; fill?: string }) => React.ReactNode;
}[] = [
  { id: 'leave_at_doorstep', renderIcon: (p) => <DoorstepIcon {...p} /> },
  { id: 'ring_bell', renderIcon: (p) => <RingBellIcon {...p} /> },
  { id: 'call_before_delivery', renderIcon: (p) => <CallBeforeIcon {...p} /> },
  { id: 'other', renderIcon: (p) => <InstructionNoteIcon {...p} /> },
];

export interface DeliveryInstructionChipsProps {
  value: DeliveryInstruction;
  onChange: (val: DeliveryInstruction) => void;
  note: string;
  onNoteChange: (val: string) => void;
}

export const DeliveryInstructionChips: React.FC<DeliveryInstructionChipsProps> = ({
  value,
  onChange,
  note,
  onNoteChange,
}) => {
  const COLOR = useColor();

  return (
    <View style={styles.container}>
      <View style={styles.chipsRow}>
        {INSTRUCTIONS.map(({ id, renderIcon }) => {
          const isActive = value === id;
          return (
            <Pressable
              key={id}
              onPress={() => onChange(id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? COLOR.primarySoft : COLOR.surface,
                  borderColor: isActive ? COLOR.primary : COLOR.border,
                },
              ]}
            >
              {renderIcon({
                size: 20,
                stroke: isActive ? COLOR.primary : COLOR.textMuted,
                fill: isActive ? COLOR.primarySoft : 'none',
              })}
              <Text
                numberOfLines={2}
                style={[
                  typography.caption,
                  styles.label,
                  {
                    color: isActive ? COLOR.primary : COLOR.textMuted,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {INSTRUCTION_LABELS[id]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {value === 'other' ? (
        <TextInput
          multiline
          value={note}
          onChangeText={onNoteChange}
          placeholder="Tell the courier / rider what to do (e.g. Leave with security guard)..."
          placeholderTextColor={COLOR.textMuted}
          style={[
            styles.noteInput,
            {
              backgroundColor: COLOR.surfaceAlt,
              borderColor: COLOR.border,
              color: COLOR.text,
            },
          ]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    marginHorizontal: 3,
    borderRadius: radius.md,
    borderWidth: 1.5,
    minHeight: 70,
  },
  label: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 13,
  },
  noteInput: {
    minHeight: 70,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    textAlignVertical: 'top',
    fontSize: 13,
  },
});
