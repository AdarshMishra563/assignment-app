import { useAppSelector } from '../../store/hooks';

export function usePatientAllergies(): string[] {
  const profileAllergies = useAppSelector((state) => state.patientProfile.allergies || []);
  const records = useAppSelector((state) => state.healthRecords.records || []);

  const allergyRecordTags = records
    .filter((r) => r.type === 'allergy')
    .flatMap((r) => r.tags.filter((t) => t.toLowerCase() !== 'allergy'));

  const combined = Array.from(new Set([...profileAllergies, ...allergyRecordTags]));
  return combined;
}
