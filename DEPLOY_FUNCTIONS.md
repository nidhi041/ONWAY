# 🚀 Deploy Cloud Functions NOW

The app is ready but needs **Cloud Functions deployed** to process payments.

## Quick Deploy (Copy & Paste)

Open PowerShell/Terminal in the project directory and run:

```powershell
cd functions
npm install
cd ..
firebase deploy --only functions
```

That's it! Then your payment integration will work.

---

## What Gets Deployed

Three functions that handle payment processing:

1. **createRazorpayOrder** - Creates order in Razorpay
2. **verifyPaymentSignature** - Verifies payment is real
3. **logPaymentFailure** - Logs failed payments

---

## After Deployment

✅ You can now:
- Select payment method in checkout
- Click "Place Order"
- Complete payment in browser
- See order in Firestore

---

## If Deployment Fails

**Error: "firebase is not recognized"**
- Make sure Firebase CLI is installed: `npm install -g firebase-tools`
- Then try deployment again

**Error: "Permission denied"**
- Run terminal as Administrator (right-click → Run as administrator)
- Then try deployment again

**Other errors**
- Check logs: `firebase functions:log`
- Make sure you're logged in: `firebase login`

---

## Test Payment

After deployment, test with:
- **Card**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: Any 6 digits

---

## Check Deployment Status

Visit Firebase Console:
https://console.firebase.google.com/project/onway-bd6e4/functions/list

You should see 3 functions:
- ✅ createRazorpayOrder
- ✅ verifyPaymentSignature
- ✅ logPaymentFailure

---

**Deploy now, then test payment flow!** 🎉
