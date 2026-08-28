import React from 'react';
import { HealthRecordType } from '../types';
import { Badge, BadgeVariant } from '../../../design-system/components/Badge';

export const RecordTypeTag: React.FC<{ type: HealthRecordType }> = ({ type }) => {
  const getBadgeProps = (): { label: string; variant: BadgeVariant } => {
    switch (type) {
      case 'prescription':
        return { label: 'PRESCRIPTION', variant: 'primary' };
      case 'lab_report':
        return { label: 'LAB REPORT', variant: 'info' };
      case 'consultation_summary':
        return { label: 'CONSULTATION', variant: 'accent' };
      case 'allergy':
        return { label: 'ALLERGY RECORD', variant: 'danger' };
      case 'diet_plan':
        return { label: 'AHARA DIET PLAN', variant: 'success' };
      case 'vaccination':
        return { label: 'VACCINATION', variant: 'warning' };
      default:
        return { label: 'RECORD', variant: 'default' };
    }
  };

  const { label, variant } = getBadgeProps();
  return <Badge label={label} variant={variant} />;
};
