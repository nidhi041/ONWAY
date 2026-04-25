import { ShippingAddress, PaymentMethod } from './ordersService';

/**
 * Razorpay Service for Payment Integration
 * Handles order creation, payment processing, and verification
 */

export interface RazorpayOrderRequest {
  amount: number; // in paise (smallest unit)
  userId: string;
  cartItems: any[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export interface RazorpayOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: string;
  cartItems: any[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  tax: number;
}

/**
 * Create Razorpay order and get order ID
 * This calls backend Cloud Function
 * 
 * IMPORTANT: Cloud Functions must be deployed first:
 * Run: firebase deploy --only functions
 * 
 * For testing without deployed functions, use TEST_MODE
 */

// Set to true to test without backend functions deployed
const TEST_MODE = true;

export const createRazorpayOrder = async (
  request: RazorpayOrderRequest
): Promise<RazorpayOrderResponse> => {
  try {
    // TEST MODE: Return mock order for testing UI without backend
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: Returning mock Razorpay order');
      return {
        orderId: `order_${Date.now()}`,
        razorpayOrderId: `order_${Math.random().toString(36).substr(2, 9)}`,
        amount: request.amount,
        currency: 'INR',
        keyId: 'rzp_test_Shgq35vj7SGKmI', // Test key
      };
    }

    const url = 'https://us-central1-onway-bd6e4.cloudfunctions.net/createRazorpayOrder';
    
    console.log('Creating Razorpay order with request:', {
      amount: request.amount,
      userId: request.userId,
      cartItems: request.cartItems.length,
      paymentMethod: request.paymentMethod.type,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = response.statusText;
      }
      
      console.error('Server error response:', errorText);
      
      if (response.status === 404) {
        throw new Error(
          'Cloud Functions not deployed. Please run: firebase deploy --only functions'
        );
      } else if (response.status === 500) {
        throw new Error('Server error. Check Cloud Function logs: firebase functions:log');
      } else {
        throw new Error(`Failed to create order: ${errorText || response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Razorpay order created:', data.razorpayOrderId);
    return data;
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error.message);
    throw new Error(error.message || 'Failed to create payment order. Please try again.');
  }
};

/**
 * Verify payment signature and create order in Firestore
 */
export const verifyPaymentSignature = async (
  request: PaymentVerificationRequest
): Promise<{ orderId: string; success: boolean }> => {
  try {
    const response = await fetch(
      'https://us-central1-onway-bd6e4.cloudfunctions.net/verifyPaymentSignature',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Handle payment failure and log it
 */
export const logPaymentFailure = async (
  userId: string,
  razorpayOrderId: string,
  errorCode: string,
  errorDescription: string
): Promise<void> => {
  try {
    await fetch(
      'https://us-central1-onway-bd6e4.cloudfunctions.net/logPaymentFailure',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          razorpayOrderId,
          errorCode,
          errorDescription,
          timestamp: new Date().toISOString(),
        }),
      }
    );
  } catch (error) {
    console.error('Error logging payment failure:', error);
  }
};
