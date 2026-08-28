export type SlotStatus = 'available' | 'held' | 'booked' | 'expired';

export interface Slot {
  id: string;
  doctorId: string;
  startsAt: string;   // ISO 8601
  endsAt: string;
  status: SlotStatus;
  version: number;    // optimistic-concurrency token
}

export interface Doctor {
  id: string;
  name: string;
  nameHi?: string;
  specialty: string;
  subSpecialties?: string[];
  photo: string;
  rating: number;
  ratingCount: number;
  yearsExperience: number;
  consultationFee: number;
  languages: string[];
  city: string;
  clinicName: string;
  about: string;
  verified: boolean;
  ccimRegNo?: string;
  education: string;
  opdTimings?: string;
  nadiParikshaExpert?: boolean;
  availableSlotsCount?: number;
  totalSlotsToday?: number;
}

export type BookingStatus = 'pending_sync' | 'confirmed' | 'cancelled' | 'failed';

export interface Booking {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorPhoto: string;
  slotId: string;
  slotTime: string;
  status: BookingStatus;
  createdAt: string;
  patientNote?: string;
  consultationFee: number;
  meetingLink?: string;
}
