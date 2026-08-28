import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  DoorClosed,
  Home,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { clearCart } from '../store/cartSlice';
import { useColor } from '../../../design-system/theme/ThemeProvider';
import { radius, spacing } from '../../../design-system/theme/spacing';
import { typography } from '../../../design-system/theme/typography';
import { Card } from '../../../design-system/components/Card';
import { GradientButton } from '../../../design-system/components/GradientButton';
import { Button } from '../../../design-system/components/Button';
import { DashedDivider } from '../../../design-system/components/DashedDivider';
import { showToast } from '../../../design-system/components/Toast';
import {
  DeliveryInstruction,
  DeliveryInstructionChips,
} from '../../../design-system/components/DeliveryInstructionChips';

export const CheckoutScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { total = 0, subtotal = 0, discountAmount = 0 } = route.params || {};
  const COLOR = useColor();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const user = useAppSelector((state) => state.auth.user);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'card' | 'cod' | 'wallet'>('upi');
  const [deliveryInstruction, setDeliveryInstruction] = useState<DeliveryInstruction>('leave_at_doorstep');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    const newOrderId = `AMR-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(newOrderId);

    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmed(true);
      dispatch(clearCart());
      showToast.success('Order placed successfully! Ayurvedic dispatch underway.');
    }, 1200);
  };

  // Order Confirmed State
  if (isConfirmed) {
    return (
      <View style={[styles.container, { backgroundColor: COLOR.background, paddingBottom: insets.bottom || spacing.lg }]}>
        <ScrollView contentContainerStyle={styles.confirmationContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.successIconCircle, { backgroundColor: COLOR.successSoft }]}>
            <CheckCircle2 size={56} color={COLOR.success} />
          </View>

          <Text style={[typography.display, { color: COLOR.text, textAlign: 'center', marginTop: spacing.md }]}>
            Order Confirmed!
          </Text>
          <Text style={[typography.body, { color: COLOR.textMuted, textAlign: 'center', marginTop: 4 }]}>
            Your Ayurvedic formulations are being hand-blended and prepared for dispatch.
          </Text>

          <Card style={[styles.orderDetailCard, { backgroundColor: COLOR.surface, borderColor: COLOR.border }]}>
            <View style={styles.confirmRow}>
              <Text style={[typography.caption, { color: COLOR.textMuted }]}>ORDER ID</Text>
              <Text style={[typography.subtitle, { color: COLOR.primary, fontWeight: '800' }]}>
                {orderId}
              </Text>
            </View>

            <View style={styles.confirmRow}>
              <Text style={[typography.caption, { color: COLOR.textMuted }]}>ESTIMATED DELIVERY</Text>
              <Text style={[typography.subtitle, { color: COLOR.text, fontWeight: '700' }]}>
                In 2-3 Business Days
              </Text>
            </View>

            <View style={styles.confirmRow}>
              <Text style={[typography.caption, { color: COLOR.textMuted }]}>PAYMENT METHOD</Text>
              <Text style={[typography.subtitle, { color: COLOR.text, fontWeight: '700' }]}>
                {selectedPayment === 'upi' ? 'UPI (Paid)' : selectedPayment === 'card' ? 'Credit Card (Paid)' : selectedPayment === 'wallet' ? 'Ayurvedic Wallet (Paid)' : 'Cash on Delivery'}
              </Text>
            </View>

            <DashedDivider color={COLOR.border} />

            <View style={[styles.confirmRow, { marginTop: spacing.xs }]}>
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Total Amount</Text>
              <Text style={[typography.title, { color: COLOR.primary, fontWeight: '900' }]}>
                ₹{total}
              </Text>
            </View>
          </Card>

          <View style={[styles.promiseBanner, { backgroundColor: COLOR.primarySoft, borderColor: COLOR.primary }]}>
            <Sparkles size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.caption, { color: COLOR.primaryDark, flex: 1, fontWeight: '600' }]}>
              Every formulation is verified by our senior Ayurvedic panel and batch-tested for purity.
            </Text>
          </View>

          <GradientButton
            title="Continue Exploring Remedies"
            onPress={() => navigation.navigate('MainTabs', { screen: 'ShopTab' })}
            style={{ width: '100%', marginTop: spacing.xl }}
          />

          <Button
            title="View Health Records & Vault"
            variant="outline"
            onPress={() => navigation.navigate('MainTabs', { screen: 'HealthRecordsTab' })}
            style={{ width: '100%', marginTop: spacing.sm }}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLOR.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}>
        {/* Delivery Address */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <MapPin size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { color: COLOR.text }]}>Delivery Address</Text>
          </View>

          <View style={[styles.addressBox, { backgroundColor: COLOR.surfaceAlt, borderColor: COLOR.border }]}>
            <View style={styles.addressNameRow}>
              <Text style={[typography.subtitle, { color: COLOR.text }]}>{user?.name || 'Aarav Sharma'}</Text>
              <View style={[styles.homePill, { backgroundColor: COLOR.primarySoft }]}>
                <Home size={12} color={COLOR.primary} />
                <Text style={[typography.label, { color: COLOR.primary, marginLeft: 3 }]}>HOME</Text>
              </View>
            </View>
            <Text style={[typography.body, { color: COLOR.textMuted, marginTop: 4 }]}>
              Flat 402, Shanti Nilayam Apartments, 12th Main Road, Indiranagar, Bengaluru, Karnataka 560038
            </Text>
            <Text style={[typography.caption, { color: COLOR.textMuted, marginTop: 4 }]}>
              Phone: {user?.phone || '+91 98765 43210'}
            </Text>
          </View>
        </Card>

        {/* Delivery Instructions (Mapped from mobilev2 SVG set) */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Truck size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { color: COLOR.text }]}>Delivery Instructions</Text>
          </View>
          <Text style={[typography.caption, { color: COLOR.textMuted, marginBottom: spacing.xs }]}>
            Choose preference for when the delivery partner reaches your doorstep:
          </Text>

          <DeliveryInstructionChips
            value={deliveryInstruction}
            onChange={setDeliveryInstruction}
            note={deliveryNote}
            onNoteChange={setDeliveryNote}
          />
        </Card>

        {/* Payment Method */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <CreditCard size={18} color={COLOR.primary} style={{ marginRight: spacing.xs }} />
            <Text style={[typography.subtitle, { color: COLOR.text }]}>Payment Method</Text>
          </View>

          <Pressable
            onPress={() => setSelectedPayment('upi')}
            accessibilityRole="radio"
            accessibilityLabel="Instant UPI (GPay / PhonePe / Paytm)"
            accessibilityState={{ selected: selectedPayment === 'upi' }}
            style={[
              styles.paymentOption,
              {
                backgroundColor: selectedPayment === 'upi' ? COLOR.surfaceAlt : COLOR.surface,
                borderColor: selectedPayment === 'upi' ? COLOR.primary : COLOR.border,
              },
            ]}
          >
            <View style={styles.paymentInfo}>
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Instant UPI (GPay / PhonePe / Paytm)</Text>
              <Text style={[typography.caption, { color: COLOR.textMuted }]}>Fastest verification & immediate dispatch</Text>
            </View>
            {selectedPayment === 'upi' && <CheckCircle2 size={18} color={COLOR.primary} />}
          </Pressable>

          <Pressable
            onPress={() => setSelectedPayment('card')}
            accessibilityRole="radio"
            accessibilityLabel="Credit / Debit Cards"
            accessibilityState={{ selected: selectedPayment === 'card' }}
            style={[
              styles.paymentOption,
              {
                backgroundColor: selectedPayment === 'card' ? COLOR.surfaceAlt : COLOR.surface,
                borderColor: selectedPayment === 'card' ? COLOR.primary : COLOR.border,
              },
            ]}
          >
            <View style={styles.paymentInfo}>
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Credit / Debit Cards</Text>
              <Text style={[typography.caption, { color: COLOR.textMuted }]}>Visa, MasterCard, RuPay, Netbanking</Text>
            </View>
            {selectedPayment === 'card' && <CheckCircle2 size={18} color={COLOR.primary} />}
          </Pressable>

          <Pressable
            onPress={() => setSelectedPayment('wallet')}
            accessibilityRole="radio"
            accessibilityLabel="Ayurvedic Health Wallet"
            accessibilityState={{ selected: selectedPayment === 'wallet' }}
            style={[
              styles.paymentOption,
              {
                backgroundColor: selectedPayment === 'wallet' ? COLOR.surfaceAlt : COLOR.surface,
                borderColor: selectedPayment === 'wallet' ? COLOR.primary : COLOR.border,
              },
            ]}
          >
            <View style={styles.paymentInfo}>
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Ayurvedic Health Wallet</Text>
              <Text style={[typography.caption, { color: COLOR.textMuted }]}>Balance: ₹2,400 · 1-Tap Pay</Text>
            </View>
            {selectedPayment === 'wallet' && <CheckCircle2 size={18} color={COLOR.primary} />}
          </Pressable>

          <Pressable
            onPress={() => setSelectedPayment('cod')}
            accessibilityRole="radio"
            accessibilityLabel="Cash on Delivery"
            accessibilityState={{ selected: selectedPayment === 'cod' }}
            style={[
              styles.paymentOption,
              {
                backgroundColor: selectedPayment === 'cod' ? COLOR.surfaceAlt : COLOR.surface,
                borderColor: selectedPayment === 'cod' ? COLOR.primary : COLOR.border,
              },
            ]}
          >
            <View style={styles.paymentInfo}>
              <Text style={[typography.subtitle, { color: COLOR.text }]}>Cash on Delivery (COD)</Text>
              <Text style={[typography.caption, { color: COLOR.textMuted }]}>Pay in cash or UPI at delivery</Text>
            </View>
            {selectedPayment === 'cod' && <CheckCircle2 size={18} color={COLOR.primary} />}
          </Pressable>
        </Card>

        {/* Final Payment Breakdown */}
        <Card style={styles.sectionCard}>
          <Text style={[typography.subtitle, { color: COLOR.text, marginBottom: spacing.sm }]}>
            Final Payment Breakdown
          </Text>

          <View style={styles.billRow}>
            <Text style={[typography.body, { color: COLOR.textMuted }]}>Subtotal</Text>
            <Text style={[typography.body, { color: COLOR.text, fontWeight: '700' }]}>₹{subtotal}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={[typography.body, { color: COLOR.success }]}>Promo Discount</Text>
              <Text style={[typography.body, { color: COLOR.success, fontWeight: '700' }]}>-₹{discountAmount}</Text>
            </View>
          )}

          <View style={styles.billRow}>
            <Text style={[typography.body, { color: COLOR.textMuted }]}>Standard Ayurvedic Shipping</Text>
            <Text style={[typography.body, { color: COLOR.success, fontWeight: '700' }]}>FREE</Text>
          </View>

          <DashedDivider color={COLOR.border} />

          <View style={[styles.billRow, { marginTop: spacing.xs }]}>
            <Text style={[typography.subtitle, { color: COLOR.text }]}>Total Amount to Pay</Text>
            <Text style={[typography.title, { color: COLOR.primary, fontWeight: '900' }]}>₹{total}</Text>
          </View>
        </Card>

        <View style={styles.securityBadge}>
          <ShieldCheck size={16} color={COLOR.success} style={{ marginRight: spacing.xs }} />
          <Text style={[typography.caption, { color: COLOR.textMuted }]}>
            256-Bit SSL Encrypted Medical Order Processing
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
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
          title={isProcessing ? 'Processing Order...' : `Place Order • ₹${total}`}
          onPress={handlePlaceOrder}
          loading={isProcessing}
          disabled={isProcessing}
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
  },
  confirmationContent: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  orderDetailCard: {
    width: '100%',
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs + 2,
  },
  promiseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    width: '100%',
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.xs + 2,
  },
  paymentInfo: {
    flex: 1,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    elevation: 12,
  },
});
