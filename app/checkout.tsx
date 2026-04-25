import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { createOrder, PaymentMethod, ShippingAddress } from '@/services/ordersService';
import { createRazorpayOrder, verifyPaymentSignature, logPaymentFailure } from '@/services/razorpayService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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

const MOCK_ADDRESSES: Address[] = [
  {
    id: '1',
    type: 'home',
    name: 'Alex Johnson',
    address: 'Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102',
    phone: '+91 98765 43210',
  },
  {
    id: '2',
    type: 'work',
    name: 'Alex Johnson',
    address: 'Onway Tech Solutions, 2nd Floor, Delta Tower, Koramangala, Bangalore - 560034',
    phone: '+91 98765 43210',
  },
];

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
  >
    <View style={styles.addressIconContainer}>
      <Text style={styles.addressIcon}>📍</Text>
    </View>
    <View style={styles.addressContent}>
      <View style={styles.addressHeader}>
        <Text style={[styles.addressName, { color: Colors.light.text }]}>
          {address.name}
        </Text>
        {address.type === 'home' && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>Home</Text>
          </View>
        )}
        {address.type === 'work' && (
          <Text style={styles.workLabel}>Work</Text>
        )}
      </View>
      <Text style={styles.addressText}>{address.address}</Text>
      <Text style={styles.phoneText}>{address.phone}</Text>
    </View>
    <View style={[styles.selectIcon, isSelected && styles.selectIconActive]}>
      <Text style={styles.selectIconText}>{isSelected ? '✓' : ''}</Text>
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
  >
    <View style={styles.paymentContent}>
      <Text style={styles.paymentIcon}>{option.icon}</Text>
      <View style={styles.paymentTextContainer}>
        <Text style={[styles.paymentTitle, { color: Colors.light.text }]}>
          {option.title}
        </Text>
        <Text style={styles.paymentDescription}>{option.description}</Text>
      </View>
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
  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [selectedAddress, setSelectedAddress] = useState<string>('1');
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
      const selectedAddressData = MOCK_ADDRESSES.find((a) => a.id === selectedAddress);
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
      <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <Text style={{ color: Colors.light.text, textAlign: 'center', marginTop: 50 }}>
          Please login to checkout
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors.light.text }]}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            {/* Step 1: Address */}
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  currentStep >= 1 && styles.progressCircleActive,
                ]}
              >
                <Text style={styles.progressText}>1</Text>
              </View>
              <Text style={styles.progressLabel}>ADDRESS</Text>
            </View>

            {/* Connector Line 1 */}
            <View
              style={[
                styles.progressLine,
                currentStep >= 2 && styles.progressLineActive,
              ]}
            />

            {/* Step 2: Payment */}
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  currentStep >= 2 && styles.progressCircleActive,
                ]}
              >
                <Text style={styles.progressText}>2</Text>
              </View>
              <Text style={styles.progressLabel}>PAYMENT</Text>
            </View>

            {/* Connector Line 2 */}
            <View
              style={[
                styles.progressLine,
                currentStep >= 3 && styles.progressLineActive,
              ]}
            />

            {/* Step 3: Review */}
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  currentStep >= 3 && styles.progressCircleActive,
                ]}
              >
                <Text style={styles.progressText}>3</Text>
              </View>
              <Text style={styles.progressLabel}>REVIEW</Text>
            </View>
          </View>
        </View>

        {/* Content based on current step */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            {/* Delivery Address */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                  Delivery Address
                </Text>
                <TouchableOpacity>
                  <Text style={styles.addNewButton}>+ Add New</Text>
                </TouchableOpacity>
              </View>

              {MOCK_ADDRESSES.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  isSelected={selectedAddress === address.id}
                  onSelect={() => setSelectedAddress(address.id)}
                />
              ))}
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContent}>
            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                Payment Method
              </Text>

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
            {/* Review content */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                Order Review
              </Text>
              <View style={styles.reviewBox}>
                <Text style={styles.reviewLabel}>Items in Cart:</Text>
                <Text style={[styles.reviewValue, { color: Colors.light.text }]}>
                  {cartItems.length} items
                </Text>
                <Text style={styles.reviewLabel} style={{ marginTop: 12 }}>
                  Delivery Address:
                </Text>
                <Text style={[styles.reviewValue, { color: Colors.light.text }]}>
                  {MOCK_ADDRESSES.find((a) => a.id === selectedAddress)?.address}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
            Order Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors.light.text }]}>
              Items Total ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </Text>
            <Text style={[styles.summaryValue, { color: Colors.light.text }]}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors.light.text }]}>
              Delivery Fee
            </Text>
            <View style={styles.deliveryFeeContainer}>
              <Text style={styles.deliveryFeeStrike}>₹40.00</Text>
              <Text style={styles.deliveryFeeFree}>FREE</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors.light.text }]}>
              Taxes & Charges
            </Text>
            <Text style={[styles.summaryValue, { color: Colors.light.text }]}>
              ₹{tax.toFixed(2)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabelBold, { color: Colors.light.text }]}>
              To Pay
            </Text>
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
            <Text style={styles.deliveryTimeIcon}>⏱️</Text>
            <View>
              <Text style={styles.deliveryTimeLabel}>EXPRESS DELIVERY</Text>
              <Text style={[styles.deliveryTimeText, { color: Colors.light.text }]}>
                Arriving in 10-15 mins
              </Text>
            </View>
          </View>
          <View style={styles.deliveryTimeRight}>
            <Text style={styles.deliveryTimeRightLabel}>TOTAL PAYABLE</Text>
            <Text style={styles.deliveryTimeAmount}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Container */}
      <View style={styles.actionContainer}>
        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {currentStep < 3 ? (
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                currentStep > 1 && { flex: 1, marginLeft: 8 },
              ]}
              onPress={() => setCurrentStep(currentStep + 1)}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                styles.placeOrderButton,
                { flex: currentStep > 1 ? 1 : undefined, marginLeft: currentStep > 1 ? 8 : 0 },
              ]}
              onPress={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.placeOrderText}>Place Order</Text>
                  <Text style={styles.placeOrderArrow}> →</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCircleActive: {
    backgroundColor: '#0C63E4',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#999',
    textAlign: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
    marginTop: 22,
  },
  progressLineActive: {
    backgroundColor: '#0C63E4',
  },
  stepContent: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    color: '#1a1a2e',
  },
  addNewButton: {
    fontSize: 12,
    color: '#0C63E4',
    fontWeight: '800',
  },
  addressCard: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: 'white',
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  addressCardSelected: {
    borderColor: '#0C63E4',
    backgroundColor: '#f0f8ff',
  },
  addressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0C63E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  addressIcon: {
    fontSize: 20,
    color: 'white',
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  addressName: {
    fontSize: 13,
    fontWeight: '700',
  },
  typeBadge: {
    backgroundColor: '#0C63E4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    color: 'white',
    fontWeight: '800',
  },
  workLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  phoneText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  selectIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  selectIconActive: {
    borderColor: '#0C63E4',
    backgroundColor: '#0C63E4',
  },
  selectIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  paymentCard: {
    width: '48%',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'white',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  paymentCardSelected: {
    borderColor: '#0C63E4',
    backgroundColor: '#f0f8ff',
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  paymentIcon: {
    fontSize: 28,
  },
  paymentTextContainer: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 9,
    color: '#999',
    fontWeight: '500',
  },
  paymentBadge: {
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e0e8ff',
  },
  paymentBadgeText: {
    fontSize: 10,
    color: '#0C63E4',
    fontWeight: '800',
  },
  reviewBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '700',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 12,
    color: '#999',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryLabelBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValueBold: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  deliveryFeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliveryFeeStrike: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  deliveryFeeFree: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  securityBox: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  securityIcon: {
    fontSize: 20,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 2,
  },
  securityText: {
    fontSize: 10,
    color: '#2196F3',
    lineHeight: 14,
  },
  deliveryTimeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deliveryTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryTimeIcon: {
    fontSize: 20,
  },
  deliveryTimeLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '700',
    marginBottom: 2,
  },
  deliveryTimeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deliveryTimeRight: {
    alignItems: 'flex-end',
  },
  deliveryTimeRightLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '700',
    marginBottom: 2,
  },
  deliveryTimeAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2196F3',
  },
  bottomSpacing: {
    height: 100,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    flex: 1,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '700',
  },
  placeOrderButton: {
    backgroundColor: '#2196F3',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  placeOrderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  placeOrderArrow: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});
