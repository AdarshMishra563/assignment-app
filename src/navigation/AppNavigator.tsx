import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { RootStackParamList, MainTabParamList } from './types';
import { BottomTabBar } from './BottomTabBar';
import { useColor } from '../design-system/theme/ThemeProvider';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { DoctorListScreen } from '../features/consultations/screens/DoctorListScreen';
import { DoctorDetailScreen } from '../features/consultations/screens/DoctorDetailScreen';
import { BookingScreen } from '../features/consultations/screens/BookingScreen';
import { MyConsultationsScreen } from '../features/consultations/screens/MyConsultationsScreen';
import { TeleconsultationRoomScreen } from '../screens/TeleconsultationRoomScreen';

import { ProductListScreen } from '../features/shop/screens/ProductListScreen';
import { ProductDetailScreen } from '../features/shop/screens/ProductDetailScreen';
import { CartScreen } from '../features/shop/screens/CartScreen';
import { WishlistScreen } from '../features/shop/screens/WishlistScreen';
import { CheckoutScreen } from '../features/shop/screens/CheckoutScreen';

import { TimelineScreen } from '../features/health-records/screens/TimelineScreen';
import { RecordDetailScreen } from '../features/health-records/screens/RecordDetailScreen';

import { ProfileScreen } from '../screens/ProfileScreen';
import { DoshaQuizScreen } from '../screens/DoshaQuizScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="ConsultationsTab" component={DoctorListScreen} />
      <Tab.Screen name="ShopTab" component={ProductListScreen} />
      <Tab.Screen name="HealthRecordsTab" component={TimelineScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const COLOR = useColor();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: '',
        headerStyle: {
          backgroundColor: COLOR.background,
          borderBottomColor: COLOR.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: { fontWeight: '800', color: COLOR.text },
        headerTintColor: COLOR.primary,
        headerBackTitleStyle: { color: COLOR.primary },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorDetail"
        component={DoctorDetailScreen}
        options={{ title: 'Doctor Profile' }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: 'Book Consultation' }}
      />
      <Stack.Screen
        name="MyConsultations"
        component={MyConsultationsScreen}
        options={{ title: 'My Appointments' }}
      />
      <Stack.Screen
        name="TeleconsultationRoom"
        component={TeleconsultationRoomScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Ayurvedic Remedy' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Cart & Prescriptions' }}
      />
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ title: 'Saved Remedies' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout & Payment' }}
      />
      <Stack.Screen
        name="RecordDetail"
        component={RecordDetailScreen}
        options={{ title: 'Clinical Health Record' }}
      />
      <Stack.Screen
        name="DoshaQuiz"
        component={DoshaQuizScreen}
        options={{ title: 'Prakriti Assessment' }}
      />
    </Stack.Navigator>
  );
}
