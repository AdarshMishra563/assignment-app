import React, { useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, CheckCircle, Clock, Video, VideoOff } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { cancelBooking, fetchMyBookings } from '../store/consultationsSlice';
import { Booking } from '../types';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { GradientButton } from '../../../design-system/components/GradientButton';
import { EmptyState } from '../../../design-system/components/EmptyState';

export const MyConsultationsScreen = ({ navigation }: { navigation: any }) => {
  const COLOR = useColor();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const { myBookings, loadingBookings, cancellingBookingId } = useAppSelector(
    (state) => state.consultations
  );

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancelPress = (item: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your consultation with ${item.doctorName}? This cannot be undone.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => {
            dispatch(cancelBooking(item.id));
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const isPendingSync = item.status === 'pending_sync';
    const isCancelled = item.status === 'cancelled';
    const isCancelling = cancellingBookingId === item.id;

    return (
      <Card style={[styles.bookingCard, isCancelled && styles.cancelledCard]}>
        <View style={styles.topRow}>
          <Image
            source={{ uri: item.doctorPhoto }}
            style={styles.avatar}
            accessibilityRole="image"
            accessibilityLabel={`Photo of ${item.doctorName}`}
          />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <View style={styles.statusRow}>
              <Text style={[typography.subtitle, { color: COLOR.text, flex: 1 }]} numberOfLines={1}>
                {item.doctorName}
              </Text>
              <Badge
                label={isCancelled ? 'CANCELLED' : isPendingSync ? 'OFFLINE QUEUE' : item.status.toUpperCase()}
                variant={isCancelled ? 'danger' : isPendingSync ? 'warning' : 'success'}
              />
            </View>
            <Text style={[typography.caption, { color: COLOR.primary, fontWeight: '700' }]}>
              {item.doctorSpecialty}
            </Text>
          </View>
        </View>

        <View style={[styles.timeRow, { backgroundColor: COLOR.surfaceAlt }]}>
          <Clock size={15} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
          <Text style={[typography.caption, { color: COLOR.text, fontWeight: '700' }]}>
            Slot: {item.slotTime}
          </Text>
        </View>

        {item.patientNote ? (
          <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: spacing.xs }]} numberOfLines={2}>
            Notes: "{item.patientNote}"
          </Text>
        ) : null}

        {!isCancelled ? (
          <View style={styles.actionsRow}>
            <GradientButton
              title="Join HD Video Consultation"
              icon={<Video size={16} color="#FFFFFF" />}
              onPress={() => {
                navigation.navigate('TeleconsultationRoom', { booking: item });
              }}
              style={{ flex: 1, marginTop: spacing.sm }}
            />
          </View>
        ) : null}

        {item.status === 'confirmed' ? (
          <Button
            title={isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            variant="outline"
            loading={isCancelling}
            disabled={isCancelling}
            onPress={() => handleCancelPress(item)}
            style={[styles.cancelButton, { borderColor: COLOR.danger }]}
            textStyle={{ color: COLOR.danger }}
          />
        ) : null}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background, paddingBottom: insets.bottom || spacing.md }]}>
      <View style={styles.header}>
        <Text style={[typography.title, { color: COLOR.text }]}>My Consultations</Text>
        <Text style={[typography.caption, { color: COLOR.textMuted }]}>
          Scheduled video sessions with your Ayurvedic Vaidyas
        </Text>
      </View>

      <FlatList
        data={myBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 + insets.bottom }]}
        ListEmptyComponent={
          <EmptyState
            icon={<Calendar size={48} color={COLOR.textMuted} />}
            title="No Bookings Yet"
            message="You haven't scheduled any Ayurvedic doctor appointments yet."
            action={
              <GradientButton
                title="Browse Doctors"
                onPress={() => navigation.navigate('MainTabs', { screen: 'ConsultationsTab' })}
              />
            }
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 80,
  },
  bookingCard: {
    marginBottom: spacing.md,
  },
  cancelledCard: {
    opacity: 0.55,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
});
