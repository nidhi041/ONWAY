import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Razorpay with credentials from environment
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * Cloud Function: Create Razorpay Order
 * Called from frontend checkout to create a Razorpay order
 */
export const createRazorpayOrder = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const {
      amount,
      userId,
      cartItems,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // Validate inputs
    if (!amount || !userId || !cartItems || !shippingAddress || !paymentMethod) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Create order with Razorpay
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId,
        paymentMethod: paymentMethod.type,
      },
    });

    // Store order details in Firestore for verification later
    await db.collection('razorpay_orders').doc(razorpayOrder.id).set({
      razorpayOrderId: razorpayOrder.id,
      userId,
      amount,
      cartItems,
      shippingAddress,
      paymentMethod,
      status: 'created',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      orderId: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * Cloud Function: Verify Payment Signature
 * Called after successful Razorpay payment to verify signature and create order
 */
export const verifyPaymentSignature = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
      cartItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
    } = req.body;

    // Validate inputs
    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !userId
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.warn('Invalid signature:', {
        expected: expectedSignature,
        received: razorpaySignature,
      });
      res.status(400).json({ error: 'Invalid payment signature' });
      return;
    }

    // Signature is valid, create order in Firestore
    const ordersRef = db.collection('users').doc(userId).collection('orders');
    const newOrderRef = ordersRef.doc();

    const orderData = {
      userId,
      items: cartItems.map((item: any) => ({
        productId: item.id,
        name: item.name,
        brand: item.brand,
        quantity: item.quantity,
        price: item.price,
        imageUrl: typeof item.image === 'string' ? item.image : undefined,
      })),
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
      totalAmount: subtotal + deliveryFee + tax,
      status: 'confirmed',
      deliveryTime: 10,
      estimatedDelivery: new Date(Date.now() + 10 * 60000).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      razorpayOrderId,
      razorpayPaymentId,
      paymentVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await newOrderRef.set(orderData);

    // Update Razorpay order record
    await db.collection('razorpay_orders').doc(razorpayOrderId).update({
      status: 'verified',
      paymentId: razorpayPaymentId,
      firestoreOrderId: newOrderRef.id,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      orderId: newOrderRef.id,
      message: 'Payment verified and order created',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

/**
 * Cloud Function: Log Payment Failure
 * Called when payment fails to maintain audit trail
 */
export const logPaymentFailure = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const {
      userId,
      razorpayOrderId,
      errorCode,
      errorDescription,
      timestamp,
    } = req.body;

    if (!userId || !razorpayOrderId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Log failure in Firestore
    await db.collection('payment_failures').add({
      userId,
      razorpayOrderId,
      errorCode,
      errorDescription,
      timestamp: new Date(timestamp),
      loggedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update Razorpay order record
    await db.collection('razorpay_orders').doc(razorpayOrderId).update({
      status: 'failed',
      errorCode,
      errorDescription,
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Payment failure logged',
    });
  } catch (error) {
    console.error('Error logging payment failure:', error);
    res.status(500).json({ error: 'Failed to log payment failure' });
  }
});
