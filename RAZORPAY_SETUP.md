# Razorpay Payment Integration - Deployment Guide

## Overview
This guide explains how to deploy the Razorpay payment integration for ONWAY.

## Components

### 1. **Cloud Functions** (Backend)
Located in `functions/` directory:
- `createRazorpayOrder` - Creates a Razorpay order
- `verifyPaymentSignature` - Verifies payment signature and creates Firestore order
- `logPaymentFailure` - Logs failed payment attempts

### 2. **Frontend Services** 
`services/razorpayService.ts` - Handles payment API calls

### 3. **Payment HTML Page**
`public/payment.html` - Razorpay checkout UI (served in WebView or browser)

## Setup Instructions

### Step 1: Install Dependencies

```bash
# In functions directory
cd functions
npm install
```

### Step 2: Set Environment Variables

Create `functions/.env` file:
```
RAZORPAY_KEY_ID=rzp_test_Shgq35vj7SGKmI
RAZORPAY_KEY_SECRET=1K42iFgK0cUiYdaTDYHDhosK
```

### Step 3: Deploy Cloud Functions

```bash
# Option 1: Using Firebase CLI
firebase deploy --only functions

# Option 2: Deploy specific function
firebase deploy --only functions:createRazorpayOrder
firebase deploy --only functions:verifyPaymentSignature
firebase deploy --only functions:logPaymentFailure
```

### Step 4: Update Payment URLs

After deployment, update `services/razorpayService.ts` with actual Cloud Function URLs:
```typescript
// Replace these URLs with your deployed function URLs
const PAYMENT_URL = 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/';
```

### Step 5: Deploy Payment HTML

```bash
# Option 1: Firebase Hosting
firebase deploy --only hosting

# Option 2: Manual deployment (update payment.html path)
```

## Payment Flow

### User Journey:

1. **Checkout Page** (`app/checkout.tsx`)
   - User selects address and payment method
   - Clicks "Place Order"

2. **Create Razorpay Order**
   - Frontend calls `createRazorpayOrder` Cloud Function
   - Backend creates order on Razorpay
   - Returns order ID and key

3. **Open Payment Page**
   - For testing: Opens payment.html in browser/WebView
   - For production: Direct Razorpay integration recommended

4. **Payment Processing**
   - User enters payment details (UPI/Card/Netbanking)
   - Razorpay processes the payment

5. **Payment Verification**
   - Payment page verifies signature with backend
   - Creates order in Firestore if signature is valid
   - Returns order ID to app

6. **Order Confirmation**
   - User sees order confirmation
   - Redirected to order tracking page

## Testing Credentials

### Test Cards:
- **VISA**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Test UPI:
- Use any test UPI ID like `test@okhdfcbank`

### Test OTP:
- Use any 6-digit OTP (Razorpay test mode accepts any)

## Firestore Structure

### Collections Created:
```
users/
├── {userId}/
│   └── orders/
│       └── {orderId}/
│           ├── items[]
│           ├── paymentMethod
│           ├── razorpayOrderId
│           ├── razorpayPaymentId
│           ├── paymentVerified: true/false
│           └── ...

razorpay_orders/
├── {razorpayOrderId}/
│   ├── userId
│   ├── amount
│   ├── status (created/verified/failed)
│   ├── razorpayPaymentId
│   ├── firestoreOrderId
│   └── ...

payment_failures/
├── {failureId}/
│   ├── userId
│   ├── razorpayOrderId
│   ├── errorCode
│   ├── errorDescription
│   └── ...
```

## Production Checklist

- [ ] Update to live Razorpay keys
- [ ] Remove CORS wildcard (*), specify allowed domains
- [ ] Add payment retry logic
- [ ] Implement order timeout handling
- [ ] Add refund mechanism
- [ ] Set up payment webhooks for real-time updates
- [ ] Implement deep linking for payment callback
- [ ] Add error monitoring and alerting
- [ ] Test complete payment flow end-to-end
- [ ] Set up payment receipt emails
- [ ] Configure refund policy

## Troubleshooting

### Issue: "Failed to create order"
- Check Razorpay API credentials in `.env`
- Verify Cloud Function logs in Firebase Console
- Ensure amount is in valid range (₹1 - ₹100000)

### Issue: "Verification failed"
- Check signature generation logic
- Verify order ID matches
- Ensure key_secret is correct

### Issue: Payment redirect not working
- For Expo: Use deep linking configuration
- For web: Update redirect URL in Razorpay dashboard
- Test in proper environment (test/live)

## Support

For Razorpay integration issues, refer to:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support)

For Cloud Functions issues:
- Check Firebase Console logs
- Verify function deployment status
- Check CORS headers
