import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, Info, ShieldCheck, Sparkles, Video } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  bookConsultationSlot,
  fetchDoctorById,
  fetchSlots,
} from '../store/consultationsSlice';
import { Slot } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { Card } from '../../../design-system/components/Card';
import { SlotGrid } from '../components/SlotGrid';
import { TextField } from '../../../design-system/components/TextField';
import { GradientButton } from '../../../design-system/components/GradientButton';
import { DashedDivider } from '../../../design-system/components/DashedDivider';
import { useNetwork } from '../../../offline/NetworkProvider';
import { enqueueAction } from '../../../offline/syncQueue';
import { addOfflineBooking } from '../store/consultationsSlice';
import { showToast } from '../../../design-system/components/Toast';

export const BookingScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { doctorId } = route.params;
  const COLOR = useColor();
  const dispatch = useAppDispatch();
  const { isConnected } = useNetwork();
  const insets = useSafeAreaInsets();

  const {
    selectedDoctor,
    slotsByDoctor,
    loadingSlots,
    bookingInProgress,
    bookingError,
  } = useAppSelector((state) => state.consultations);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [patientNote, setPatientNote] = useState('');

  useEffect(() => {
    dispatch(fetchDoctorById(doctorId));
    dispatch(fetchSlots(doctorId));
  }, [dispatch, doctorId]);

  const slots = slotsByDoctor[doctorId] || [];

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      showToast.warn('Please choose a time slot to proceed');
      return;
    }

    if (!isConnected) {
      // Queue offline
      const offlineBookingId = `offline_book_${Date.now()}`;
      const newBooking = {
        id: offlineBookingId,
        doctorId: selectedDoctor?.id || doctorId,
        doctorName: selectedDoctor?.name || 'Doctor',
        doctorSpecialty: selectedDoctor?.specialty || 'Ayurveda',
        doctorPhoto: selectedDoctor?.photo || 'https://images.unsplash.com/photo-1594824813580-ff677464d509?w=400',
        slotId: selectedSlot.id,
        slotTime: new Date(selectedSlot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending_sync' as const,
        createdAt: new Date().toISOString(),
        patientNote,
        consultationFee: selectedDoctor?.consultationFee || 500,
        meetingLink: 'https://amrutam.health/meet/pending-sync',
      };

      dispatch(addOfflineBooking(newBooking));
      dispatch(
        enqueueAction({
          type: 'BOOK_CONSULTATION',
          payload: {
            doctorId,
            slotId: selectedSlot.id,
            patientNote,
            slotVersion: selectedSlot.version,
          },
        })
      );

      showToast.info('Booking saved offline. Will synchronize when online.');
      navigation.navigate('MyConsultations');
      return;
    }

    try {
      const result = await dispatch(
        bookConsultationSlot({
          doctorId,
          slotId: selectedSlot.id,
          patientNote,
          slotVersion: selectedSlot.version,
        })
      ).unwrap();

      showToast.success(`🎉 Consultation booked with ${selectedDoctor?.name || 'Doctor'}!`);
      navigation.navigate('MyConsultations');
    } catch (err: any) {
      showToast.error('This slot was just taken or expired. Please pick another slot.');
      // Reload slots to refresh optimistic state
      dispatch(fetchSlots(doctorId));
    }
  };

  const doctor = selectedDoctor;

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}>
        {/* Doctor Banner */}
        {doctor && (
          <Card style={styles.doctorHeaderCard}>
            <Image
              source={{ uri: doctor.photo }}
              style={styles.docAvatar}
              accessibilityRole="image"
              accessibilityLabel={`Photo of ${doctor.name}`}
            />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[typography.subtitle, { color: COLOR.text }]}>{doctor.name}</Text>
              <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '700' }]}>
                {doctor.specialty}
              </Text>
              <Text style={[typography.caption, { color: COLOR.textMuted }]}>
                {doctor.clinicName}
              </Text>
            </View>
          </Card>
        )}

        {/* Slot Selection */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Calendar size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { color: COLOR.text }]}>Select Today's Slot</Text>
          </View>

          <Text style={[typography.caption, { color: COLOR.textMuted, marginVertical: spacing.xs }]}>
            All consultations are conducted via encrypted 1-on-1 HD Video.
          </Text>

          {loadingSlots ? (
            <ActivityIndicator size="small" color={COLOR.primary} style={{ marginVertical: spacing.md }} />
          ) : (
            <SlotGrid
              slots={slots}
              selectedSlotId={selectedSlot?.id || null}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />
          )}

          {bookingError ? (
            <View style={[styles.errorBox, { backgroundColor: COLOR.dangerSoft, borderColor: COLOR.danger }]}>
              <Info size={16} color={COLOR.danger} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.caption, { color: COLOR.danger, flex: 1 }]}>
                {bookingError}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Symptoms / Medical Notes Input */}
        <Card style={styles.sectionCard}>
          <Text style={[typography.subtitle, { color: COLOR.text, marginBottom: spacing.xs }]}>
            Health Concerns & Symptoms (Optional)
          </Text>
          <TextField
            placeholder="e.g. Digestive acidity, skin inflammation, sleep disturbance for 2 weeks..."
            value={patientNote}
            onChangeText={setPatientNote}
            multiline
            numberOfLines={3}
            inputStyle={{ minHeight: 70, textAlignVertical: 'top' }}
          />
        </Card>

        {/* Fee & Payment Breakdown */}
        <Card style={styles.sectionCard}>
          <Text style={[typography.subtitle, { color: COLOR.text, marginBottom: spacing.sm }]}>
            Consultation Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={[typography.body, { color: COLOR.textMuted }]}>Doctor Consultation Fee</Text>
            <Text style={[typography.body, { color: COLOR.text, fontWeight: '700' }]}>
              ₹{doctor?.consultationFee || 500}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[typography.body, { color: COLOR.textMuted }]}>Nadi Pulse Diagnostics</Text>
            <Text style={[typography.body, { color: COLOR.success, fontWeight: '700' }]}>
              FREE
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[typography.body, { color: COLOR.textMuted }]}>Digital e-Prescription</Text>
            <Text style={[typography.body, { color: COLOR.success, fontWeight: '700' }]}>
              INCLUDED
            </Text>
          </View>

          <DashedDivider color={COLOR.border} />

          <View style={[styles.summaryRow, { marginTop: spacing.xs }]}>
            <Text style={[typography.subtitle, { color: COLOR.text }]}>Total Amount</Text>
            <Text style={[typography.title, { color: COLOR.primary, fontWeight: '900' }]}>
              ₹{doctor?.consultationFee || 500}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Confirmation CTA */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: COLOR.surface,
            borderColor: COLOR.border,
            paddingBottom: insets.bottom ? insets.bottom + spacing.sm : spacing.md,
          },
        ]}
      >
        <GradientButton
          title={bookingInProgress ? 'Reserving Slot...' : selectedSlot ? `Confirm Booking (₹${doctor?.consultationFee || 500})` : 'Select a Slot to Continue'}
          onPress={handleConfirmBooking}
          disabled={!selectedSlot || bookingInProgress}
          loading={bookingInProgress}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  doctorHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  docAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    borderTopWidth: 1,
  },
});
