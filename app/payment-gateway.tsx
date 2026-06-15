import { useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { WebView } from 'react-native-webview';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder, ShippingAddress, PaymentMethod } from '@/services/ordersService';

/**
 * Payment Gateway Screen
 * Opens Razorpay checkout UI using WebView
 */

export default function PaymentGatewayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  
  const [processing, setProcessing] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const orderId = params.orderId as string;
  const amount = params.amount as string;
  const keyId = params.keyId as string;
  const email = params.email as string;
  const phone = params.phone as string;
  const paymentMethodType = params.paymentMethod as string;
  const subtotal = parseFloat((params.subtotal as string) || '0');
  const deliveryFee = parseFloat((params.deliveryFee as string) || '0');
  const tax = parseFloat((params.tax as string) || '0');
  const shippingAddressStr = params.shippingAddress as string;

  // Convert amount to paise for Razorpay options if needed, but wait, the backend or service
  // already sets the amount on the order. We just need to pass the amount to Razorpay option.
  const amountInPaise = Math.round(parseFloat(amount) * 100);

  // Razorpay requires a REAL order_id from its API.
  // If this is a mock/test order (starts with 'order_mock_'), don't pass order_id.
  const isRealRazorpayOrder = orderId && !orderId.startsWith('order_mock_') && !orderId.startsWith('order_local');

  // Safely encode values to prevent XSS in WebView HTML
  const safeJson = (val: any) => JSON.stringify(val || '').replace(/</g, '\\u003c');

  const razorpayHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
    <body style="background-color: #f5f5f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="text-align: center;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #0C63E4; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <h3 style="color: #333;">Loading Secure Payment...</h3>
        <p style="color: #666; font-size: 14px;">Please wait while we redirect you to Razorpay.</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <script>
        // Catch any JS errors and report them
        window.onerror = function(msg, src, line, col, err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'jserror', data: { message: msg, source: src, line: line } }));
          return true;
        };

        window.onload = function() {
          try {
            var options = {
              key: ${safeJson(keyId)},
              amount: ${amountInPaise},
              currency: "INR",
              name: "MedBix",
              description: "Healthcare Order Payment",
              ${isRealRazorpayOrder ? `order_id: ${safeJson(orderId)},` : '// No order_id in test/mock mode'}
              prefill: {
                email: ${safeJson(email)},
                contact: ${safeJson(phone)}
              },
              theme: {
                color: "#2563EB"
              },
              handler: function (response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'success', data: response }));
              },
              modal: {
                ondismiss: function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'dismissed' }));
                },
                escape: false,
                backdropclose: false
              }
            };
            var rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response){
              window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'failed', data: response.error }));
            });
            setTimeout(function() {
              rzp.open();
            }, 800);
          } catch(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'jserror', data: { message: e.message || 'Unknown error' } }));
          }
        };
      </script>
    </body>
    </html>
  `;

  const handleMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('WebView Message:', message);

      if (message.event === 'jserror') {
        // JS error inside WebView - log it
        console.error('WebView JS Error:', message.data);
        // Don't show to user unless it's unrecoverable
        return;
      } else if (message.event === 'success') {
        setProcessing(true);
        // Handle successful payment
        if (!user) throw new Error('User not found');

        const actualShippingAddress: ShippingAddress = shippingAddressStr
          ? JSON.parse(shippingAddressStr)
          : {
              id: '1',
              name: 'Alex Johnson',
              address: 'Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102',
              phone: phone || '+91 98765 43210',
              type: 'home',
            };

        const paymentMethodObj: PaymentMethod = {
          id: paymentMethodType,
          type: paymentMethodType as any,
          label: paymentMethodType.charAt(0).toUpperCase() + paymentMethodType.slice(1),
        };

        const newOrderId = await createOrder(
          user.id,
          cartItems,
          actualShippingAddress,
          paymentMethodObj,
          subtotal,
          deliveryFee,
          tax
        );

        await clearCart();
        router.replace({
          pathname: '/order-confirmation',
          params: {
            orderId: newOrderId,
            totalAmount: (subtotal + deliveryFee + tax).toFixed(2),
            paymentMethod: paymentMethodType,
            itemCount: cartItems.length,
          },
        });

      } else if (message.event === 'failed') {
        Alert.alert('Payment Failed', message.data?.description || 'The payment could not be processed.', [
          { text: 'Try Again', onPress: () => webViewRef.current?.reload() },
          { text: 'Cancel', onPress: () => router.back(), style: 'cancel' }
        ]);
      } else if (message.event === 'dismissed') {
        Alert.alert('Payment Cancelled', 'You cancelled the payment.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error handling webview message:', error);
      Alert.alert('Error', 'Something went wrong while processing the payment.');
      setProcessing(false);
      router.back();
    }
  };

  if (processing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0C63E4" />
        <Text style={styles.processingText}>Confirming Payment...</Text>
        <Text style={styles.processingSubtext}>Please do not close this screen</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: razorpayHtml }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          Alert.alert(
            'Connection Error',
            'Could not load the payment page. Please check your internet connection and try again.',
            [
              { text: 'Try Again', onPress: () => webViewRef.current?.reload() },
              { text: 'Cancel', onPress: () => router.back(), style: 'cancel' },
            ]
          );
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error:', nativeEvent.statusCode);
        }}
        renderLoading={() => (
          <View style={[StyleSheet.absoluteFill, styles.centerContainer]}>
            <ActivityIndicator size="large" color="#0C63E4" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
});
