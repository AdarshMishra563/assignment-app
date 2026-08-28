import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import consultationsReducer from '../features/consultations/store/consultationsSlice';
import productsReducer from '../features/shop/store/productsSlice';
import cartReducer from '../features/shop/store/cartSlice';
import wishlistReducer from '../features/shop/store/wishlistSlice';
import healthRecordsReducer from '../features/health-records/store/healthRecordsSlice';
import syncQueueReducer from '../offline/syncQueue';
import authReducer from '../shared/security/authSlice';
import patientProfileReducer from '../shared/patientProfile/patientProfileSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  consultations: consultationsReducer,
  products: productsReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  healthRecords: healthRecordsReducer,
  syncQueue: syncQueueReducer,
  patientProfile: patientProfileReducer,
});

const persistConfig = {
  key: 'amrutam-pharma-root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth', 'cart', 'wishlist', 'syncQueue', 'healthRecords', 'patientProfile'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
