import { C, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { createOrder, PaymentMethod, ShippingAddress } from '@/services/ordersService';
import { createRazorpayOrder, logPaymentFailure } from '@/services/razorpayService';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAddresses } from '@/hooks/useFirestore';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AddressType = 'home' | 'work';
type PaymentMethodType = 'upi' | 'cards' | 'cod' | 'netbanking';

interface Address {
  id: string;
  type: AddressType;
  name: string;
  address: string;
  phone: string;
}

interface PaymentOption {
  id: string;
  type: PaymentMethodType;
  title: string;
  description: string;
  badge?: string;
  icon: string;
}



const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'upi',
    type: 'upi',
    title: 'UPI',
    description: 'Google Pay, PhonePe',
    badge: 'Fastest',
    icon: '📱',
  },
  {
    id: 'cards',
    type: 'cards',
    title: 'Cards',
    description: 'Credit / Debit Cards',
    badge: 'Secure',
    icon: '💳',
  },
  {
    id: 'cod',
    type: 'cod',
    title: 'COD',
    description: 'Cash on Delivery',
    icon: '💵',
  },
  {
    id: 'netbanking',
    type: 'netbanking',
    title: 'Net Banking',
    description: 'All major banks',
    icon: '🏦',
  },
];

const AddressCard = ({
  address,
  isSelected,
  onSelect,
}: {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <TouchableOpacity
    style={[styles.addressCard, isSelected && styles.addressCardSelected]}
    onPress={onSelect}
    activeOpacity={0.8}
  >
    <View style={styles.addressContent}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{address.name}</Text>
        <View style={[styles.typeBadge, address.type === 'work' && styles.typeBadgeWork]}>
          <Text style={styles.typeBadgeText}>{address.type === 'home' ? 'Home' : 'Work'}</Text>
        </View>
      </View>
      <Text style={styles.addressText}>{address.address}</Text>
      <Text style={styles.phoneText}>{address.phone}</Text>
    </View>
    <View style={[styles.selectIcon, isSelected && styles.selectIconActive]}>
      {isSelected && <Text style={styles.selectIconText}>✓</Text>}
    </View>
  </TouchableOpacity>
);

const PaymentOptionCard = ({
  option,
  isSelected,
  onSelect,
}: {
  option: PaymentOption;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <TouchableOpacity
    style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
    onPress={onSelect}
    activeOpacity={0.8}
  >
    <Text style={styles.paymentIcon}>{option.icon}</Text>
    <View style={styles.paymentTextContainer}>
      <Text style={styles.paymentTitle}>{option.title}</Text>
      <Text style={styles.paymentDescription}>{option.description}</Text>
    </View>
    {option.badge && (
      <View style={styles.paymentBadge}>
        <Text style={styles.paymentBadgeText}>{option.badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { addresses, loading: addressesLoading } = useAddresses();
  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  // Automatically select default address or first address when loaded
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      if (!selectedAddress || !addresses.some((a) => a.id === selectedAddress)) {
        const defaultAddr = addresses.find((a) => a.isDefault);
        setSelectedAddress(defaultAddr ? defaultAddr.id : addresses[0].id);
      }
    } else {
      setSelectedAddress('');
    }
  }, [addresses, selectedAddress]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Calculate totals from cart items
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0; // Free delivery
  const tax = Math.round(subtotal * 0.165 * 100) / 100; // 16.5% tax
  const totalAmount = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to place an order');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Get selected address
      const selectedAddressData = addresses.find((a) => a.id === selectedAddress);
      if (!selectedAddressData) {
        throw new Error('Please select a valid address');
      }

      // Format shipping address
      const shippingAddress: ShippingAddress = {
        id: selectedAddressData.id,
        name: selectedAddressData.name,
        address: selectedAddressData.address,
        phone: selectedAddressData.phone,
        type: selectedAddressData.type,
      };

      // Format payment method
      const paymentMethod: PaymentMethod = {
        id: selectedPayment,
        type: selectedPayment,
        label: PAYMENT_OPTIONS.find((p) => p.type === selectedPayment)?.title || selectedPayment,
      };

      // For COD, create order directly without Razorpay
      if (selectedPayment === 'cod') {
        const orderId = await createOrder(
          user.id,
          cartItems,
          shippingAddress,
          paymentMethod,
          subtotal,
          deliveryFee,
          tax
        );

        await clearCart();

        Alert.alert('Success', 'Order placed successfully! COD payment selected.', [
          {
            text: 'Track Order',
            onPress: () => router.push(`/ordertracking?orderId=${orderId}`),
          },
        ]);
        setIsPlacingOrder(false);
        return;
      }

      // For online payments (UPI, Cards, Netbanking), use Razorpay
      // Step 1: Create Razorpay order on backend
      const razorpayOrderResponse = await createRazorpayOrder({
        amount: totalAmount,
        userId: user.id,
        cartItems,
        shippingAddress,
        paymentMethod,
      });

      // Step 2: Navigate to WebView payment gateway
      router.push({
        pathname: '/payment-gateway',
        params: {
          orderId: razorpayOrderResponse.razorpayOrderId,
          amount: totalAmount,
          keyId: razorpayOrderResponse.keyId,
          email: user.email,
          phone: selectedAddressData.phone,
          itemCount: cartItems.length,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          tax: tax,
          totalAmount: totalAmount,
          userId: user.id,
          paymentMethod: selectedPayment,
        },
      });

    } catch (error: any) {
      console.error('Error placing order:', error);
      
      const errorMessage = error.message || 'Failed to process payment. Please try again.';
      
      // Check if it's a Cloud Functions deployment issue
      if (errorMessage.includes('Cloud Functions not deployed') || 
          errorMessage.includes('404') ||
          errorMessage.includes('Cannot reach')) {
        Alert.alert(
          'Setup Required',
          'Cloud Functions need to be deployed first.\n\nRun in terminal:\nfirebase deploy --only functions\n\nThen try again.',
          [
            { text: 'OK' },
            { text: 'Try Again', onPress: () => handlePlaceOrder() }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
      
      // Log payment failure if Razorpay order was created
      if (error.razorpayOrderId) {
        await logPaymentFailure(
          user.id,
          error.razorpayOrderId,
          error.code || 'UNKNOWN_ERROR',
          error.message
        );
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>Please login to checkout</Text>
          <TouchableOpacity style={styles.loginPromptBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginPromptBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            {[
              { step: 1, label: 'ADDRESS' },
              { step: 2, label: 'PAYMENT' },
              { step: 3, label: 'REVIEW' },
            ].map((item, index) => (
              <View key={item.step} style={styles.progressItem}>
                <View style={styles.progressStepWrapper}>
                  {index > 0 && (
                    <View style={[styles.progressLine, currentStep >= item.step && styles.progressLineActive]} />
                  )}
                  <View style={[styles.progressCircle, currentStep >= item.step && styles.progressCircleActive]}>
                    {currentStep > item.step ? (
                      <Text style={styles.progressCheckText}>✓</Text>
                    ) : (
                      <Text style={styles.progressText}>{item.step}</Text>
                    )}
                  </View>
                  {index < 2 && (
                    <View style={[styles.progressLine, currentStep > item.step && styles.progressLineActive]} />
                  )}
                </View>
                <Text style={[styles.progressLabel, currentStep >= item.step && styles.progressLabelActive]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Content based on current step */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            {/* Delivery Address */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <TouchableOpacity style={styles.addNewBtn} onPress={() => router.push('/saved-addresses')}>
                  <Text style={styles.addNewBtnText}>+ Add New</Text>
                </TouchableOpacity>
              </View>

              {addressesLoading ? (
                <ActivityIndicator size="small" color={C.blue} style={{ marginVertical: 20 }} />
              ) : addresses.length > 0 ? (
                addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    isSelected={selectedAddress === address.id}
                    onSelect={() => setSelectedAddress(address.id)}
                  />
                ))
              ) : (
                <View style={styles.emptyAddressContainer}>
                  <Text style={styles.emptyAddressText}>No saved addresses found.</Text>
                  <TouchableOpacity
                    style={styles.emptyAddressBtn}
                    onPress={() => router.push('/saved-addresses')}
                  >
                    <Text style={styles.emptyAddressBtnText}>Add Address</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContent}>
            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>

              <View style={styles.paymentGrid}>
                {PAYMENT_OPTIONS.map((option) => (
                  <PaymentOptionCard
                    key={option.id}
                    option={option}
                    isSelected={selectedPayment === option.type}
                    onSelect={() => setSelectedPayment(option.type)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Review</Text>
              <View style={styles.reviewBox}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Items in Cart</Text>
                  <Text style={styles.reviewValue}>{cartItems.length} items</Text>
                </View>
                <View style={styles.reviewDivider} />
                <Text style={styles.reviewLabel}>Delivery Address</Text>
                <Text style={styles.reviewAddressText}>
                  {addresses.find((a) => a.id === selectedAddress)?.address || 'No address selected'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Items Total ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <View style={styles.deliveryFeeRow}>
              <Text style={styles.deliveryFeeStrike}>₹40.00</Text>
              <View style={styles.freePill}>
                <Text style={styles.freePillText}>FREE</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes & Charges</Text>
            <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>Total Payable</Text>
            <Text style={styles.summaryValueBold}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Security Message */}
        <View style={styles.securityBox}>
          <Text style={styles.securityIcon}>🛡️</Text>
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>Onway Secure Checkout</Text>
            <Text style={styles.securityText}>
              Your payment details are encrypted and 100% secure.
            </Text>
          </View>
        </View>

        {/* Delivery Time */}
        <View style={styles.deliveryTimeBox}>
          <View style={styles.deliveryTimeLeft}>
            <Text style={styles.deliveryTimeIcon}>⚡</Text>
            <View>
              <Text style={styles.deliveryTimeLabel}>EXPRESS DELIVERY</Text>
              <Text style={styles.deliveryTimeText}>Arriving in 10–15 mins</Text>
            </View>
          </View>
          <View style={styles.deliveryTimeRight}>
            <Text style={styles.deliveryTimeRightLabel}>TOTAL PAYABLE</Text>
            <Text style={styles.deliveryTimeAmount}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backStepBtn}
              onPress={() => setCurrentStep(currentStep - 1)}
              activeOpacity={0.85}
            >
              <Text style={styles.backStepBtnText}>← Back</Text>
            </TouchableOpacity>
          )}
          {currentStep < 3 ? (
            <TouchableOpacity
              style={[styles.nextBtn, currentStep > 1 && { flex: 1 }]}
              onPress={() => {
                if (currentStep === 1 && !selectedAddress) {
                  Alert.alert('Error', 'Please select or add a delivery address to continue.');
                  return;
                }
                setCurrentStep(currentStep + 1);
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.nextBtnText}>Continue →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.placeOrderBtn, currentStep > 1 && { flex: 1 }]}
              onPress={handlePlaceOrder}
              disabled={isPlacingOrder}
              activeOpacity={0.88}
            >
              {isPlacingOrder ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.placeOrderBtnText}>Place Order →</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1 },

  emptyAddressContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  emptyAddressText: {
    fontSize: 14,
    color: C.inkSub,
    marginBottom: 12,
  },
  emptyAddressBtn: {
    backgroundColor: C.blue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyAddressBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  loginPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loginPromptText: { fontSize: 15, color: C.inkSub, marginBottom: 20, textAlign: 'center' },
  loginPromptBtn: { backgroundColor: C.blue, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, ...shadow('blue') },
  loginPromptBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.bg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnText: { fontSize: 18, color: C.ink },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.ink },

  progressContainer: {
    paddingHorizontal: 32, paddingVertical: 20,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  progressItem: { alignItems: 'center', flex: 1 },
  progressStepWrapper: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  progressCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.surfaceAlt, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: C.border },
  progressCircleActive: { backgroundColor: C.blue, borderColor: C.blue },
  progressText: { fontSize: 13, fontWeight: '700', color: C.inkMuted },
  progressCheckText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  progressLabel: { fontSize: 9, fontWeight: '700', color: C.inkMuted, marginTop: 6, letterSpacing: 0.6, textTransform: 'uppercase' },
  progressLabelActive: { color: C.blue },
  progressLine: { flex: 1, height: 2, backgroundColor: C.border, marginHorizontal: 4 },
  progressLineActive: { backgroundColor: C.blue },

  stepContent: { paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 14 },
  addNewBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: C.blueLight, borderWidth: 1, borderColor: C.blueMid,
  },
  addNewBtnText: { fontSize: 12, color: C.blue, fontWeight: '700' },

  addressCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1.5, borderColor: C.border, borderRadius: 16,
    padding: 14, marginBottom: 10, backgroundColor: C.surface,
    ...shadow('sm'),
  },
  addressCardSelected: { borderColor: C.blue, backgroundColor: C.blueLight },
  addressContent: { flex: 1 },
  addressHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  addressName: { fontSize: 13, fontWeight: '700', color: C.ink },
  typeBadge: { backgroundColor: C.surfaceAlt, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeBadgeWork: { backgroundColor: C.tealLight },
  typeBadgeText: { fontSize: 9, color: C.inkSub, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  addressText: { fontSize: 12, color: C.inkSub, marginBottom: 4, lineHeight: 17 },
  phoneText: { fontSize: 11, color: C.inkMuted },
  selectIcon: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.border, justifyContent: 'center', alignItems: 'center', marginLeft: 10, marginTop: 2 },
  selectIconActive: { borderColor: C.blue, backgroundColor: C.blue },
  selectIconText: { fontSize: 11, fontWeight: '800', color: '#fff' },

  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  paymentCard: {
    width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: C.border, borderRadius: 14,
    padding: 14, backgroundColor: C.surface,
    ...shadow('sm'),
  },
  paymentCardSelected: { borderColor: C.blue, backgroundColor: C.blueLight },
  paymentIcon: { fontSize: 24 },
  paymentTextContainer: { flex: 1 },
  paymentTitle: { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 2 },
  paymentDescription: { fontSize: 10, color: C.inkMuted },
  paymentBadge: { backgroundColor: C.successBg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  paymentBadgeText: { fontSize: 9, color: C.success, fontWeight: '800' },

  reviewBox: { backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, ...shadow('sm') },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reviewLabel: { fontSize: 12, color: C.inkMuted, marginBottom: 4 },
  reviewValue: { fontSize: 13, fontWeight: '700', color: C.ink },
  reviewDivider: { height: 1, backgroundColor: C.borderLight, marginBottom: 10 },
  reviewAddressText: { fontSize: 13, color: C.inkSub, lineHeight: 20 },

  summaryCard: {
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: C.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border,
    ...shadow('sm'),
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryLabel: { fontSize: 13, color: C.inkSub },
  summaryLabelBold: { fontSize: 15, fontWeight: '700', color: C.ink },
  summaryValue: { fontSize: 13, color: C.ink, fontWeight: '500' },
  summaryValueBold: { fontSize: 22, fontWeight: '800', color: C.blue },
  deliveryFeeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deliveryFeeStrike: { fontSize: 12, color: C.inkMuted, textDecorationLine: 'line-through' },
  freePill: { backgroundColor: C.successBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  freePillText: { fontSize: 10, color: C.success, fontWeight: '800' },
  summaryDivider: { height: 1, backgroundColor: C.borderLight, marginBottom: 12 },

  securityBox: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 12,
    backgroundColor: C.blueLight, borderRadius: 14, padding: 14, gap: 12,
    alignItems: 'flex-start', borderWidth: 1, borderColor: C.blueMid,
  },
  securityIcon: { fontSize: 20 },
  securityContent: { flex: 1 },
  securityTitle: { fontSize: 13, fontWeight: '700', color: C.blue, marginBottom: 3 },
  securityText: { fontSize: 11, color: C.inkSub, lineHeight: 16 },

  deliveryTimeBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: C.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  deliveryTimeLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deliveryTimeIcon: { fontSize: 22 },
  deliveryTimeLabel: { fontSize: 9, color: C.inkMuted, fontWeight: '700', marginBottom: 3, letterSpacing: 0.5, textTransform: 'uppercase' },
  deliveryTimeText: { fontSize: 13, fontWeight: '700', color: C.ink },
  deliveryTimeRight: { alignItems: 'flex-end' },
  deliveryTimeRightLabel: { fontSize: 9, color: C.inkMuted, fontWeight: '700', marginBottom: 3, letterSpacing: 0.5, textTransform: 'uppercase' },
  deliveryTimeAmount: { fontSize: 17, fontWeight: '800', color: C.blue },

  actionBar: {
    paddingHorizontal: 20, paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#64748B', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12 }
      : { elevation: 8 }),
  },
  buttonRow: { flexDirection: 'row', gap: 10 },
  backStepBtn: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  backStepBtnText: { color: C.ink, fontSize: 14, fontWeight: '600' },
  nextBtn: {
    flex: 1, backgroundColor: C.blue, borderRadius: 14,
    paddingVertical: 14, justifyContent: 'center', alignItems: 'center',
    ...shadow('blue'),
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  placeOrderBtn: {
    flex: 1, backgroundColor: C.success, borderRadius: 14,
    paddingVertical: 14, justifyContent: 'center', alignItems: 'center',
    ...(Platform.OS === 'ios'
      ? { shadowColor: C.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 }
      : { elevation: 6 }),
  },
  placeOrderBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
