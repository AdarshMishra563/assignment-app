import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { CheckCircle2, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import { useColor } from '../design-system/theme/ThemeProvider';
import { typography } from '../design-system/theme/typography';
import { radius, spacing } from '../design-system/theme/spacing';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { dequeueAction, incrementRetry, QueuedAction, setLastSynced, setSyncing } from './syncQueue';
import { showToast } from '../design-system/components/Toast';
import { bookConsultationSlot, removeOfflineBooking } from '../features/consultations/store/consultationsSlice';

interface NetworkContextValue {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  isInternetReachable: true,
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [isDraining, setIsDraining] = useState(false);
  const [drainedCount, setDrainedCount] = useState(0);
  const COLOR = useColor();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const queue = useAppSelector((state) => state.syncQueue.queue);
  const myBookings = useAppSelector((state) => state.consultations.myBookings);

  const prevConnectedRef = useRef(true);
  const myBookingsRef = useRef(myBookings);
  myBookingsRef.current = myBookings;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      if (NetInfo && typeof NetInfo.addEventListener === 'function') {
        unsubscribe = NetInfo.addEventListener((state) => {
          setIsConnected(state?.isConnected ?? true);
          setIsInternetReachable(state?.isInternetReachable ?? null);
        });
      }
    } catch (e) {
      console.warn('[NetworkProvider] NetInfo initialization warning:', e);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Replay a single queued action against the real thunks, returning whether it synced.
  const replayQueuedAction = async (queuedAction: QueuedAction): Promise<boolean> => {
    if (queuedAction.type === 'BOOK_CONSULTATION') {
      const placeholder = myBookingsRef.current.find(
        (b) =>
          b.status === 'pending_sync' &&
          b.doctorId === queuedAction.payload.doctorId &&
          b.slotId === queuedAction.payload.slotId
      );

      try {
        await dispatch(bookConsultationSlot(queuedAction.payload)).unwrap();
        // bookConsultationSlot.fulfilled already added the confirmed booking;
        // drop the stale offline placeholder so it doesn't show twice.
        if (placeholder) {
          dispatch(removeOfflineBooking(placeholder.id));
        }
        return true;
      } catch (err: any) {
        dispatch(incrementRetry(queuedAction.id));
        showToast.error(
          `Could not sync booking${placeholder ? ` with ${placeholder.doctorName}` : ''}: ${
            err?.message || 'the slot may have been taken while offline'
          }. Will retry later.`
        );
        return false;
      }
    }

    // Unhandled queued action type — fail loudly instead of silently dropping it.
    console.warn(`[NetworkProvider] No replay handler for queued action type: ${queuedAction.type}`);
    return false;
  };

  // Monitor offline to online transition and drain queued tasks
  useEffect(() => {
    if (!prevConnectedRef.current && isConnected) {
      // Transitioned from offline to online
      if (queue.length > 0) {
        const count = queue.length;
        setDrainedCount(count);
        setIsDraining(true);
        dispatch(setSyncing(true));
        showToast.info(`🔄 Online: Draining ${count} queued offline task${count > 1 ? 's' : ''}...`);

        // Drain tasks: replay each queued action against the real API/thunks.
        const pendingQueue = [...queue];
        (async () => {
          let successCount = 0;

          for (const queuedAction of pendingQueue) {
            const synced = await replayQueuedAction(queuedAction);
            if (synced) {
              dispatch(dequeueAction(queuedAction.id));
              successCount += 1;
            }
            // Failed actions are left in the queue (with retryCount bumped)
            // so the next reconnect attempt retries them.
          }

          dispatch(setLastSynced());
          dispatch(setSyncing(false));
          setIsDraining(false);

          const failCount = pendingQueue.length - successCount;
          if (failCount === 0) {
            showToast.success(`✅ All ${count} offline task${count > 1 ? 's' : ''} synchronized successfully!`);
          } else if (successCount > 0) {
            showToast.info(
              `Synced ${successCount} of ${count} offline tasks. ${failCount} will retry on next reconnect.`
            );
          }
        })();
      } else {
        showToast.info('Back online — Network restored');
      }
    }

    prevConnectedRef.current = isConnected;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, queue.length, dispatch]);

  return (
    <NetworkContext.Provider value={{ isConnected, isInternetReachable }}>
      {children}
      {!isConnected ? (
        <View style={[styles.banner, { backgroundColor: COLOR.warning, paddingTop: insets.top + 7 }]}>
          <WifiOff size={14} color="#FFFFFF" style={{ marginRight: spacing.xs }} />
          <Text style={[typography.caption, styles.bannerText]}>
            Offline Mode — Changes will sync automatically when back online
          </Text>
        </View>
      ) : isDraining ? (
        <View
          style={[
            styles.banner,
            styles.drainingBanner,
            { backgroundColor: COLOR.primary, paddingTop: insets.top + 7 },
          ]}
        >
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: spacing.xs }} />
          <Text style={[typography.caption, styles.bannerText]}>
            Draining {drainedCount} offline task{drainedCount > 1 ? 's' : ''} (Bookings & Cart)...
          </Text>
        </View>
      ) : null}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  drainingBanner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
});
