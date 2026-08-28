import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, FileText, Paperclip, Pill } from 'lucide-react-native';
import { HealthRecord } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { RecordTypeTag } from './RecordTypeTag';
import { TimelineConnector } from '../../../design-system/components/TimelineConnector';
import { Badge } from '../../../design-system/components/Badge';

interface TimelineEntryProps {
  record: HealthRecord;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = React.memo(({
  record,
  onPress,
  isFirst,
  isLast,
}) => {
  const COLOR = useColor();

  const formattedDate = new Date(record.date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getNodeColor = () => {
    switch (record.type) {
      case 'prescription':
        return COLOR.primary;
      case 'lab_report':
        return COLOR.info;
      case 'allergy':
        return COLOR.danger;
      case 'diet_plan':
        return COLOR.success;
      case 'vaccination':
        return COLOR.warning;
      default:
        return COLOR.accent;
    }
  };

  const visibleTags = record.tags ? record.tags.slice(0, 3) : [];
  const recordLabel = `${record.type.replace(/_/g, ' ')} record: ${record.title}, dated ${formattedDate}`;

  return (
    <View style={styles.container}>
      <TimelineConnector
        color={COLOR.border}
        nodeColor={getNodeColor()}
        isFirst={isFirst}
        isLast={isLast}
      />

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={recordLabel}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: COLOR.surface, borderColor: COLOR.border },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.headerRow}>
          <RecordTypeTag type={record.type} />
          <Text style={[typography.caption, { color: COLOR.textMuted }]}>{formattedDate}</Text>
        </View>

        <Text style={[typography.subtitle, { color: COLOR.text, marginTop: 4 }]} numberOfLines={1}>
          {record.title}
        </Text>

        <View style={styles.doctorRow}>
          {record.doctorPhoto ? (
            <Image
              source={{ uri: record.doctorPhoto }}
              style={styles.docAvatar}
              accessibilityRole="image"
              accessibilityLabel={`Photo of ${record.doctorName}`}
            />
          ) : null}
          <Text style={[typography.caption, { color: COLOR.text, fontWeight: '700', marginLeft: record.doctorPhoto ? 6 : 0 }]}>
            {record.doctorName}
          </Text>
        </View>

        <Text style={[typography.bodySmall, { color: COLOR.textMuted, marginTop: 4 }]} numberOfLines={2}>
          {record.notes}
        </Text>

        {visibleTags.length > 0 && (
          <View style={styles.tagRow} accessibilityLabel={`Tags: ${visibleTags.join(', ')}`}>
            {visibleTags.map((tag, idx) => (
              <Badge key={`${tag}_${idx}`} label={tag} variant="default" style={styles.tagBadge} />
            ))}
            {record.tags.length > 3 && (
              <Text style={[typography.label, { color: COLOR.textMuted, marginLeft: 2 }]}>
                +{record.tags.length - 3}
              </Text>
            )}
          </View>
        )}

        {/* Badges for attachments / prescribed medicines */}
        <View style={styles.metaFooter}>
          {record.prescribedMedicines && record.prescribedMedicines.length > 0 && (
            <View
              style={[styles.metaChip, { backgroundColor: COLOR.primarySoft }]}
              accessibilityLabel={`${record.prescribedMedicines.length} prescribed medicines`}
            >
              <Pill size={12} color={COLOR.primary} style={{ marginRight: 3 }} />
              <Text style={[typography.label, { color: COLOR.primary }]}>
                {record.prescribedMedicines.length} Medicines
              </Text>
            </View>
          )}

          {record.attachments && record.attachments.length > 0 && (
            <View
              style={[styles.metaChip, { backgroundColor: COLOR.surfaceAlt }]}
              accessibilityLabel={`${record.attachments.length} attachment${record.attachments.length > 1 ? 's' : ''}`}
            >
              <Paperclip size={12} color={COLOR.textMuted} style={{ marginRight: 3 }} />
              <Text style={[typography.label, { color: COLOR.textMuted }]}>
                {record.attachments.length} Attachment
              </Text>
            </View>
          )}

          <ChevronRight size={16} color={COLOR.textMuted} style={{ marginLeft: 'auto' }} />
        </View>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  card: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  docAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  tagBadge: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  metaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginRight: spacing.xs,
  },
});
