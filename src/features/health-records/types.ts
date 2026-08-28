export type HealthRecordType = 'prescription' | 'lab_report' | 'consultation_summary' | 'allergy' | 'diet_plan' | 'vaccination';

export interface PrescribedMedicine {
  productId?: string; // cross-module reorder reference
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  price?: number;
}

export interface Attachment {
  id: string;
  title: string;
  fileType: 'pdf' | 'image' | 'lab_doc';
  fileSize: string;
  url: string;
  thumbnail?: string;
}

export interface HealthRecord {
  id: string;
  type: HealthRecordType;
  title: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorPhoto?: string;
  date: string; // ISO 8601
  notes: string;
  diagnosis?: string;
  tags: string[];
  prescribedMedicines?: PrescribedMedicine[];
  attachments?: Attachment[];
  vitals?: {
    bloodPressure?: string;
    pulseRate?: string;
    prakritiDiagnosis?: string;
    temperature?: string;
    bmi?: string;
  };
  // Present when type === 'vaccination'. Reuses date/title/doctor/tags/attachments
  // from the base record for "when/who/what document"; this only carries the
  // immunization-specific facts that don't fit those fields.
  vaccination?: {
    vaccineName: string;
    doseNumber: number;
    totalDoses?: number;
    nextDueDate?: string; // ISO 8601
    batchNumber?: string;
    manufacturer?: string;
  };
}
