import { Booking } from '../features/consultations/types';

export type RootStackParamList = {
  MainTabs: undefined;
  DoctorDetail: { doctorId: string };
  Booking: { doctorId: string };
  MyConsultations: undefined;
  TeleconsultationRoom: { booking: Booking };
  ProductDetail: { productId: string };
  Cart: undefined;
  Wishlist: undefined;
  Checkout: { total: number; subtotal: number; discountAmount: number };
  RecordDetail: { recordId: string };
  DoshaQuiz: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ConsultationsTab: undefined;
  ShopTab: undefined;
  HealthRecordsTab: undefined;
  ProfileTab: undefined;
};
