import { C, shadow } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated, Dimensions, ScrollView, StatusBar,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const W = Dimensions.get('window').width;

/**
 * Order Confirmation Screen
 * Shown after a successful order placement with order details and CTAs
 */
export default function OrderConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const orderId = params.orderId as string;
  const totalAmount = parseFloat((params.totalAmount as string) || '0');
  const paymentMethod = params.paymentMethod as string;
  const itemCount = parseInt((params.itemCount as string) || '0');

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Sequenced entrance animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.parallel([
        Animated.timing(checkAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      ]),
    ]).start();
  }, []);

  const displayOrderId = orderId
    ? `#${orderId.slice(-8).toUpperCase()}`
    : `#${Date.now().toString().slice(-8)}`;

  const estDelivery = new Date(Date.now() + 15 * 60000).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>

        {/* Success Icon */}
        <View style={st.iconSection}>
          <Animated.View style={[st.iconRing, { transform: [{ scale: scaleAnim }] }]}>
            <View style={st.iconInner}>
              <Animated.Text style={[st.checkMark, { opacity: checkAnim }]}>✓</Animated.Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={st.successTitle}>Order Placed! 🎉</Text>
            <Text style={st.successSub}>Your order has been confirmed successfully</Text>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Order ID Card */}
          <View style={st.orderIdCard}>
            <View style={st.orderIdRow}>
              <Text style={st.orderIdLabel}>ORDER ID</Text>
              <View style={st.orderIdPill}>
                <Text style={st.orderIdText}>{displayOrderId}</Text>
              </View>
            </View>
          </View>

          {/* Details Card */}
          <View style={st.detailsCard}>
            <Text style={st.detailsTitle}>Order Details</Text>

            <View style={st.detailRow}>
              <Text style={st.detailIcon}>🛒</Text>
              <View style={st.detailBody}>
                <Text style={st.detailLabel}>Items Ordered</Text>
                <Text style={st.detailValue}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
              </View>
            </View>

            <View style={st.detailDivider} />

            <View style={st.detailRow}>
              <Text style={st.detailIcon}>💳</Text>
              <View style={st.detailBody}>
                <Text style={st.detailLabel}>Payment Method</Text>
                <Text style={st.detailValue}>
                  {paymentMethod === 'cod' ? 'Cash on Delivery' :
                   paymentMethod === 'upi' ? 'UPI' :
                   paymentMethod === 'cards' ? 'Card Payment' :
                   paymentMethod === 'netbanking' ? 'Net Banking' : paymentMethod}
                </Text>
              </View>
            </View>

            <View style={st.detailDivider} />

            <View style={st.detailRow}>
              <Text style={st.detailIcon}>💰</Text>
              <View style={st.detailBody}>
                <Text style={st.detailLabel}>Amount Paid</Text>
                <Text style={[st.detailValue, { color: C.blue, fontWeight: '800' }]}>₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            <View style={st.detailDivider} />

            <View style={st.detailRow}>
              <Text style={st.detailIcon}>⚡</Text>
              <View style={st.detailBody}>
                <Text style={st.detailLabel}>Estimated Delivery</Text>
                <Text style={[st.detailValue, { color: C.success }]}>By {estDelivery} · Express</Text>
              </View>
            </View>
          </View>

          {/* Delivery progress indicator */}
          <View style={st.progressCard}>
            <Text style={st.progressTitle}>Delivery Tracking</Text>
            <View style={st.progressSteps}>
              {['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'].map((step, idx) => (
                <View key={step} style={st.progressStep}>
                  <View style={[st.progressDot, idx === 0 && st.progressDotActive]} />
                  {idx < 3 && <View style={[st.progressLine, idx === 0 && st.progressLineActive]} />}
                  <Text style={[st.progressLabel, idx === 0 && st.progressLabelActive]}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTAs */}
          <View style={st.ctaSection}>
            {orderId ? (
              <TouchableOpacity
                style={st.primaryCta}
                onPress={() => router.push(`/ordertracking?orderId=${orderId}`)}
                activeOpacity={0.88}
              >
                <Text style={st.primaryCtaText}>📍  Track Order</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={st.secondaryCta}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.88}
            >
              <Text style={st.secondaryCtaText}>🛒  Continue Shopping</Text>
            </TouchableOpacity>
          </View>

          {/* Orders link */}
          <TouchableOpacity style={st.ordersLink} onPress={() => router.push('/orders')} activeOpacity={0.7}>
            <Text style={st.ordersLinkText}>View all my orders →</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  iconSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  iconRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: C.successBg, borderWidth: 3, borderColor: '#86EFAC',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    ...shadow('lg'),
  },
  iconInner: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.success, justifyContent: 'center', alignItems: 'center',
  },
  checkMark: { fontSize: 44, color: '#fff', fontWeight: '800' },
  successTitle: { fontSize: 26, fontWeight: '800', color: C.ink, textAlign: 'center', marginBottom: 8, letterSpacing: -0.3 },
  successSub: { fontSize: 14, color: C.inkSub, textAlign: 'center', lineHeight: 20 },

  orderIdCard: {
    backgroundColor: C.surface, borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
    ...shadow('sm'),
  },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderIdLabel: { fontSize: 10, fontWeight: '700', color: C.inkMuted, letterSpacing: 1 },
  orderIdPill: {
    backgroundColor: C.blueLight, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: C.blueMid,
  },
  orderIdText: { fontSize: 14, fontWeight: '800', color: C.blue, letterSpacing: 0.5 },

  detailsCard: {
    backgroundColor: C.surface, borderRadius: 20, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
    ...shadow('md'),
  },
  detailsTitle: { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  detailIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  detailBody: { flex: 1 },
  detailLabel: { fontSize: 11, color: C.inkMuted, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 14, fontWeight: '700', color: C.ink },
  detailDivider: { height: 1, backgroundColor: C.borderLight, marginVertical: 12 },

  progressCard: {
    backgroundColor: C.surface, borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
    ...shadow('sm'),
  },
  progressTitle: { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 16 },
  progressSteps: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  progressStep: { alignItems: 'center', flex: 1 },
  progressDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: C.border, marginBottom: 6, zIndex: 1 },
  progressDotActive: { backgroundColor: C.success, ...shadow('sm') },
  progressLine: { position: 'absolute', left: '50%', right: '-50%', top: 6, height: 2, backgroundColor: C.border, zIndex: 0 },
  progressLineActive: { backgroundColor: C.success },
  progressLabel: { fontSize: 9, color: C.inkMuted, fontWeight: '600', textAlign: 'center' },
  progressLabelActive: { color: C.success, fontWeight: '700' },

  ctaSection: { gap: 12, marginBottom: 16 },
  primaryCta: {
    backgroundColor: C.blue, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    ...shadow('blue'),
  },
  primaryCtaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryCta: {
    backgroundColor: C.surface, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: C.border,
  },
  secondaryCtaText: { color: C.ink, fontSize: 15, fontWeight: '600' },

  ordersLink: { alignItems: 'center', paddingVertical: 8 },
  ordersLinkText: { fontSize: 14, color: C.blue, fontWeight: '600' },
});
