import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['amrutam://', 'https://amrutam.health'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: 'home',
          ConsultationsTab: 'consultations',
          ShopTab: 'shop',
          HealthRecordsTab: 'records',
          ProfileTab: 'profile',
        },
      },
      DoctorDetail: 'doctor/:doctorId',
      Booking: 'book/:doctorId',
      ProductDetail: 'product/:productId',
      Cart: 'cart',
      RecordDetail: 'record/:recordId',
      DoshaQuiz: 'quiz',
    },
  },
};
