import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Dosha = 'vata' | 'pitta' | 'kapha';

export interface PatientProfileState {
  dosha: Dosha | null;
  quizCompletedAt: string | null;
  name: string;
  age: number;
  gender: 'female' | 'male' | 'other';
  allergies: string[];
  primaryConcern: string;
  biometricsEnabled: boolean;
  language: 'en' | 'hi';
}

const initialState: PatientProfileState = {
  dosha: 'pitta', // default initial profile recommendation
  quizCompletedAt: new Date().toISOString(),
  name: 'Aarav Sharma',
  age: 28,
  gender: 'male',
  allergies: ['Peanuts', 'Gluten', 'Synthetic Preservatives', 'Dust Mites'],
  primaryConcern: 'Digestive Balance & Stress Relief',
  biometricsEnabled: true,
  language: 'en',
};

const patientProfileSlice = createSlice({
  name: 'patientProfile',
  initialState,
  reducers: {
    setDosha(state, action: PayloadAction<Dosha>) {
      state.dosha = action.payload;
      state.quizCompletedAt = new Date().toISOString();
    },
    resetQuiz(state) {
      state.dosha = null;
      state.quizCompletedAt = null;
    },
    updateProfile(state, action: PayloadAction<Partial<PatientProfileState>>) {
      return { ...state, ...action.payload };
    },
    addAllergy(state, action: PayloadAction<string>) {
      if (!state.allergies.includes(action.payload)) {
        state.allergies.push(action.payload);
      }
    },
    removeAllergy(state, action: PayloadAction<string>) {
      state.allergies = state.allergies.filter((a) => a !== action.payload);
    },
    setLanguage(state, action: PayloadAction<'en' | 'hi'>) {
      state.language = action.payload;
    },
    setBiometricsEnabled(state, action: PayloadAction<boolean>) {
      state.biometricsEnabled = action.payload;
    },
  },
});

export const {
  setDosha,
  resetQuiz,
  updateProfile,
  addAllergy,
  removeAllergy,
  setLanguage,
  setBiometricsEnabled,
} = patientProfileSlice.actions;

export default patientProfileSlice.reducer;
