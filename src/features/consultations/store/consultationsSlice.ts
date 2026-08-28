import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { Doctor, Slot, Booking } from '../types';
import { showToast } from '../../../design-system/components/Toast';

interface ConsultationsState {
  doctors: Doctor[];
  totalDoctors: number;
  doctorsPage: number;
  hasMoreDoctors: boolean;
  loadingDoctors: boolean;

  selectedDoctor: Doctor | null;
  loadingDoctorDetail: boolean;

  slotsByDoctor: Record<string, Slot[]>;
  loadingSlots: boolean;

  myBookings: Booking[];
  loadingBookings: boolean;

  bookingInProgress: boolean;
  bookingError: string | null;

  cancellingBookingId: string | null;

  selectedSpecialty: string;
  selectedCity: string;
  searchQuery: string;
}

const initialState: ConsultationsState = {
  doctors: [],
  totalDoctors: 0,
  doctorsPage: 1,
  hasMoreDoctors: true,
  loadingDoctors: false,

  selectedDoctor: null,
  loadingDoctorDetail: false,

  slotsByDoctor: {},
  loadingSlots: false,

  myBookings: [],
  loadingBookings: false,

  bookingInProgress: false,
  bookingError: null,

  cancellingBookingId: null,

  selectedSpecialty: 'All Specialties',
  selectedCity: 'All Cities',
  searchQuery: '',
};

export const fetchDoctors = createAsyncThunk(
  'consultations/fetchDoctors',
  async (
    params: {
      page?: number;
      search?: string;
      specialty?: string;
      city?: string;
      refresh?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const page = params.page || 1;
      const { data } = await apiClient.get<{
        items: Doctor[];
        total: number;
        page: number;
        hasMore: boolean;
      }>('/doctors', {
        params: {
          page,
          limit: 20,
          search: params.search,
          specialty: params.specialty,
          city: params.city,
        },
      });
      return { ...data, refresh: params.refresh };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch doctors');
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  'consultations/fetchDoctorById',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<Doctor>(`/doctors/${doctorId}`);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch doctor details');
    }
  }
);

export const fetchSlots = createAsyncThunk(
  'consultations/fetchSlots',
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<Slot[]>(`/doctors/${doctorId}/slots`);
      return { doctorId, slots: data };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load consultation slots');
    }
  }
);

export const bookConsultationSlot = createAsyncThunk(
  'consultations/bookConsultationSlot',
  async (
    payload: {
      doctorId: string;
      slotId: string;
      patientNote?: string;
      slotVersion?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.post<{ booking: Booking; slot: Slot }>('/consultations/book', payload);
      showToast.success('Consultation booked successfully! Room link generated.');
      return data;
    } catch (err: any) {
      showToast.error(err.message || 'Slot booking failed. Please pick another slot.');
      return rejectWithValue(err.message || 'Booking failed');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'consultations/cancelBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post<{ booking: Booking; slot: Slot | null }>(
        ENDPOINTS.CANCEL_BOOKING(bookingId)
      );
      showToast.success('Booking cancelled successfully.');
      return data;
    } catch (err: any) {
      showToast.error(err.message || 'Failed to cancel booking. Please try again.');
      return rejectWithValue(err.message || 'Cancellation failed');
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'consultations/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get<Booking[]>('/consultations/my-bookings');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load bookings');
    }
  }
);

const consultationsSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {
    setSpecialtyFilter(state, action: PayloadAction<string>) {
      state.selectedSpecialty = action.payload;
    },
    setCityFilter(state, action: PayloadAction<string>) {
      state.selectedCity = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearBookingError(state) {
      state.bookingError = null;
    },
    addOfflineBooking(state, action: PayloadAction<Booking>) {
      state.myBookings.unshift(action.payload);
    },
    removeOfflineBooking(state, action: PayloadAction<string>) {
      state.myBookings = state.myBookings.filter((b) => b.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Doctors list
    builder
      .addCase(fetchDoctors.pending, (state, action) => {
        state.loadingDoctors = true;
        if (action.meta.arg.refresh) {
          state.doctors = [];
        }
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loadingDoctors = false;
        if (action.payload.refresh || action.payload.page === 1) {
          state.doctors = action.payload.items;
        } else {
          state.doctors = [...state.doctors, ...action.payload.items];
        }
        state.doctorsPage = action.payload.page;
        state.totalDoctors = action.payload.total;
        state.hasMoreDoctors = action.payload.hasMore;
      })
      .addCase(fetchDoctors.rejected, (state) => {
        state.loadingDoctors = false;
      });

    // Doctor detail
    builder
      .addCase(fetchDoctorById.pending, (state) => {
        state.loadingDoctorDetail = true;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loadingDoctorDetail = false;
        state.selectedDoctor = action.payload;
      })
      .addCase(fetchDoctorById.rejected, (state) => {
        state.loadingDoctorDetail = false;
      });

    // Slots
    builder
      .addCase(fetchSlots.pending, (state) => {
        state.loadingSlots = true;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.loadingSlots = false;
        state.slotsByDoctor[action.payload.doctorId] = action.payload.slots;
      })
      .addCase(fetchSlots.rejected, (state) => {
        state.loadingSlots = false;
      });

    // Book slot
    builder
      .addCase(bookConsultationSlot.pending, (state) => {
        state.bookingInProgress = true;
        state.bookingError = null;
      })
      .addCase(bookConsultationSlot.fulfilled, (state, action) => {
        state.bookingInProgress = false;
        state.myBookings.unshift(action.payload.booking);
        // update local slot status
        const docSlots = state.slotsByDoctor[action.payload.slot.doctorId];
        if (docSlots) {
          const idx = docSlots.findIndex((s) => s.id === action.payload.slot.id);
          if (idx !== -1) {
            docSlots[idx] = action.payload.slot;
          }
        }
      })
      .addCase(bookConsultationSlot.rejected, (state, action) => {
        state.bookingInProgress = false;
        state.bookingError = (action.payload as string) || 'Booking failed';
      });

    // My bookings
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loadingBookings = true;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loadingBookings = false;
        state.myBookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state) => {
        state.loadingBookings = false;
      });

    // Cancel booking
    builder
      .addCase(cancelBooking.pending, (state, action) => {
        state.cancellingBookingId = action.meta.arg;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancellingBookingId = null;
        const idx = state.myBookings.findIndex((b) => b.id === action.payload.booking.id);
        if (idx !== -1) {
          state.myBookings[idx] = action.payload.booking;
        }
        const updatedSlot = action.payload.slot;
        if (updatedSlot) {
          const docSlots = state.slotsByDoctor[updatedSlot.doctorId];
          if (docSlots) {
            const slotIdx = docSlots.findIndex((s) => s.id === updatedSlot.id);
            if (slotIdx !== -1) {
              docSlots[slotIdx] = updatedSlot;
            }
          }
        }
      })
      .addCase(cancelBooking.rejected, (state) => {
        state.cancellingBookingId = null;
      });
  },
});

export const {
  setSpecialtyFilter,
  setCityFilter,
  setSearchQuery,
  clearBookingError,
  addOfflineBooking,
  removeOfflineBooking,
} = consultationsSlice.actions;

export default consultationsSlice.reducer;
