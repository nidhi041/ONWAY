import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import * as WebBrowser from 'expo-web-browser';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder, ShippingAddress, PaymentMethod } from '@/services/ordersService';

/**
 * Payment Gateway Screen
 * Opens Razorpay checkout (or test mode payment UI)
 * 
 * Query params:
 * - orderId: Razorpay order ID
 * - amount: Payment amount
 * - keyId: Razorpay key ID
 * - email: Customer email
 * - phone: Customer phone
 * - userId: User ID
 * - paymentMethod: Payment method type
 * - subtotal, deliveryFee, tax, totalAmount: Price breakdown
 */

// TEST MODE - Set to false when Cloud Functions are deployed
const TEST_MODE = true;

export default function PaymentGatewayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(!TEST_MODE);
  const [testPaymentStep, setTestPaymentStep] = useState<'select' | 'enter' | 'processing' | 'success'>('select');
  const [selectedTestMethod, setSelectedTestMethod] = useState('card');

  const orderId = params.orderId as string;
  const amount = params.amount as string;
  const userId = params.userId as string;
  const paymentMethodType = params.paymentMethod as string;
  const subtotal = parseFloat((params.subtotal as string) || '0');
  const deliveryFee = parseFloat((params.deliveryFee as string) || '0');
  const tax = parseFloat((params.tax as string) || '0');
  const phone = params.phone as string;

  useEffect(() => {
    if (TEST_MODE) {
      // Test mode doesn't auto-open anything
      setLoading(false);
      return;
    }

    // Production mode: Open real Razorpay
    const openRazorpay = async () => {
      try {
        const checkoutUrl = `https://rzp.io/${orderId}`;
        console.log('Opening Razorpay checkout:', checkoutUrl);

        const result = await WebBrowser.openBrowserAsync(checkoutUrl);

        if (result.type === 'cancel' || result.type === 'dismiss') {
          Alert.alert(
            'Payment Cancelled',
            'You cancelled the payment. Would you like to try again?',
            [
              {
                text: 'Go Back',
                onPress: () => router.back(),
                style: 'destructive',
              },
              {
                text: 'Try Again',
                onPress: () => {
                  setLoading(true);
                  setTimeout(() => openRazorpay(), 500);
                },
              },
            ]
          );
        } else {
          // Payment completed
          setTimeout(() => {
            const newOrderId = `order_${Date.now()}`;
            router.push(`/ordertracking?orderId=${newOrderId}`);
          }, 2000);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error opening payment:', error);
        Alert.alert('Error', 'Failed to open payment. Please try again.');
        router.back();
        setLoading(false);
      }
    };

    openRazorpay();
  }, [orderId, router]);

  const handleTestPaymentComplete = async () => {
    setTestPaymentStep('processing');
    
    // Simulate payment processing
    setTimeout(async () => {
      setTestPaymentStep('success');
      
      // Create real order in Firestore after successful payment
      try {
        if (!user) {
          throw new Error('User not found');
        }

        // Get the first address as mock address (since we're in test mode)
        const mockShippingAddress: ShippingAddress = {
          id: '1',
          name: 'Alex Johnson',
          address: 'Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102',
          phone: phone || '+91 98765 43210',
          type: 'home',
        };

        // Create payment method object
        const paymentMethodObj: PaymentMethod = {
          id: paymentMethodType,
          type: paymentMethodType as any,
          label: paymentMethodType.charAt(0).toUpperCase() + paymentMethodType.slice(1),
        };

        // Create order in Firestore
        const orderId = await createOrder(
          user.id,
          cartItems,
          mockShippingAddress,
          paymentMethodObj,
          subtotal,
          deliveryFee,
          tax
        );

        // Clear cart after successful order
        await clearCart();

        // Simulate order creation and redirect
        setTimeout(() => {
          router.push(`/ordertracking?orderId=${orderId}`);
        }, 2000);
      } catch (error: any) {
        console.error('Error creating order:', error);
        Alert.alert('Error', 'Failed to create order. Please try again.');
        setTestPaymentStep('select');
      }
    }, 3000);
  };

  if (TEST_MODE) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
        {testPaymentStep === 'select' && (
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.headerBox}>
              <Text style={styles.headerTitle}>🧪 Test Payment Mode</Text>
              <Text style={styles.headerSubtitle}>
                Cloud Functions not deployed yet. Using test mode.
              </Text>
            </View>

            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amountValue}>₹{amount}</Text>
            </View>

            <Text style={styles.sectionTitle}>Select Test Payment Method</Text>

            <TouchableOpacity
              style={[styles.methodCard, selectedTestMethod === 'card' && styles.methodCardSelected]}
              onPress={() => setSelectedTestMethod('card')}
            >
              <Text style={styles.methodIcon}>💳</Text>
              <View style={styles.methodContent}>
                <Text style={[styles.methodName, { color: Colors.light.text }]}>Test Card</Text>
                <Text style={styles.methodHint}>4111 1111 1111 1111</Text>
              </View>
              <View style={[styles.radioButton, selectedTestMethod === 'card' && styles.radioButtonSelected]}>
                {selectedTestMethod === 'card' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodCard, selectedTestMethod === 'upi' && styles.methodCardSelected]}
              onPress={() => setSelectedTestMethod('upi')}
            >
              <Text style={styles.methodIcon}>📱</Text>
              <View style={styles.methodContent}>
                <Text style={[styles.methodName, { color: Colors.light.text }]}>Test UPI</Text>
                <Text style={styles.methodHint}>test@okhdfcbank</Text>
              </View>
              <View style={[styles.radioButton, selectedTestMethod === 'upi' && styles.radioButtonSelected]}>
                {selectedTestMethod === 'upi' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodCard, selectedTestMethod === 'netbanking' && styles.methodCardSelected]}
              onPress={() => setSelectedTestMethod('netbanking')}
            >
              <Text style={styles.methodIcon}>🏦</Text>
              <View style={styles.methodContent}>
                <Text style={[styles.methodName, { color: Colors.light.text }]}>Test Netbanking</Text>
                <Text style={styles.methodHint}>Any bank</Text>
              </View>
              <View style={[styles.radioButton, selectedTestMethod === 'netbanking' && styles.radioButtonSelected]}>
                {selectedTestMethod === 'netbanking' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => setTestPaymentStep('enter')}
            >
              <Text style={styles.buttonText}>Continue to Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {testPaymentStep === 'enter' && (
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.headerBox}>
              <Text style={styles.headerTitle}>Enter Payment Details</Text>
              <Text style={styles.headerSubtitle}>
                {selectedTestMethod === 'card' ? 'Card Details' : selectedTestMethod === 'upi' ? 'UPI Details' : 'Netbanking Details'}
              </Text>
            </View>

            {selectedTestMethod === 'card' && (
              <>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <Text style={styles.inputValue}>4111 1111 1111 1111</Text>
                </View>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputBox, { flex: 1, marginRight: 12 }]}>
                    <Text style={styles.inputLabel}>Expiry</Text>
                    <Text style={styles.inputValue}>12/25</Text>
                  </View>
                  <View style={[styles.inputBox, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <Text style={styles.inputValue}>123</Text>
                  </View>
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>OTP</Text>
                  <Text style={styles.inputValue}>123456 (any 6 digits)</Text>
                </View>
              </>
            )}

            {selectedTestMethod === 'upi' && (
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>UPI ID</Text>
                <Text style={styles.inputValue}>test@okhdfcbank</Text>
                <Text style={styles.inputHint}>Enter any UPI ID to test</Text>
              </View>
            )}

            {selectedTestMethod === 'netbanking' && (
              <>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Select Bank</Text>
                  <Text style={styles.inputValue}>HDFC Bank</Text>
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>OTP</Text>
                  <Text style={styles.inputValue}>123456 (any 6 digits)</Text>
                </View>
              </>
            )}

            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>ℹ️ Test Mode</Text>
              <Text style={styles.warningText}>
                This is a test payment. Use the test details above to simulate a payment.
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.button}
              onPress={handleTestPaymentComplete}
            >
              <Text style={styles.buttonText}>Complete Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => setTestPaymentStep('select')}
            >
              <Text style={styles.cancelButtonText}>Back</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {testPaymentStep === 'processing' && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0C63E4" />
            <Text style={styles.processingText}>Processing Payment...</Text>
            <Text style={styles.processingSubtext}>Please wait</Text>
          </View>
        )}

        {testPaymentStep === 'success' && (
          <View style={styles.centerContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtext}>Creating your order...</Text>
          </View>
        )}
      </View>
    );
  }

  // Production mode (non-test)
  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0C63E4" />
          <Text style={styles.loadingText}>Opening Razorpay Checkout...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>Payment Processing</Text>
            <Text style={styles.messageText}>
              Your payment is being processed. This window will close automatically once payment is complete.
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  headerBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0C63E4',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  amountBox: {
    backgroundColor: '#f0f8ff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0C63E4',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#22C55E',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  methodCardSelected: {
    borderColor: '#0C63E4',
    backgroundColor: '#f0f8ff',
  },
  methodIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  methodHint: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  radioButtonSelected: {
    borderColor: '#0C63E4',
  },
  radioButtonInner: {
    flex: 1,
    backgroundColor: '#0C63E4',
    borderRadius: 8,
    margin: 2,
  },
  inputBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontWeight: '500',
  },
  warningBox: {
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#0C63E4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '800',
  },
  messageBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#0C63E4',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontWeight: '500',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
    marginTop: 20,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#22C55E',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
