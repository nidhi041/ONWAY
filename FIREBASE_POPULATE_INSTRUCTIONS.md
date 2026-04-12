# 🚀 Populate Firebase - Quick Instructions

Your app is now ready to fetch data from Firestore! Here's how to populate the database with dummy data:

## ✅ Option 1: Manual Setup (Easiest - No Code Required)

### Step 1: Create Products
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project **"onway-f5999"**
3. Go to **Firestore Database**
4. Click **"Start Collection"** → Name it **`products`**
5. Click **"Add Document"** and add each product manually from `FIREBASE_DUMMY_DATA.js`

**Products to add (8 items):**
- Paracetamol (ID: 1)
- Saras Milk (ID: 2)
- Hand Sanitizer Dettol (ID: 3)
- Bru Coffee (ID: 4)
- CMF Buds Pro 2 (ID: 5)
- Dot & Key Vitamin C (ID: 6)
- Red Bull Energy Drink (ID: 7)
- Aspirin 500mg (ID: 8)

**Quick Tip:** Copy all fields from the dummy data file, then paste into Firebase Console for each product.

---

## 🚀 Option 2: Automated Script (Faster - Requires Setup)

If you want to automate the process:

### Prerequisites
1. Install firebase-admin:
   ```bash
   npm install firebase-admin
   ```

2. Download your Firebase Service Account Key:
   - Go to Firebase Console → Project Settings ⚙️
   - Go to **Service Accounts** tab
   - Click **Generate new private key**
   - Save as: `scripts/serviceAccountKey.json`

3. Uncomment the service account initialization in `scripts/populate-firebase.js`:
   ```javascript
   const serviceAccount = require('./serviceAccountKey.json');
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
     databaseURL: "https://onway-f5999.firebaseapp.com"
   });
   ```

### Run the Script
```bash
npm run populate-firebase
```

✅ All 8 products will be added automatically!

---

## 🎯 After Populating Products

### Test the App
1. Stop the app (`Ctrl+C` in terminal)
2. Restart: `npm expo start`
3. Navigate to Home screen → You should see products from Firestore!

### Add Test User (Optional)
To test user features like addresses and payments:

1. In Firebase Console → Authentication
2. Click **"Add user"**
3. Email: `alex@example.com`
4. Password: `SecurePass@123`
5. Click **Create**
6. Copy the **User UID** that appears
7. Go to Firestore → Users → Paste UID as Document ID
8. Add fields:
   - `name`: "Alex Johnson"
   - `email`: "alex@example.com"
   - `phone`: "+91 9876543210"
   - `avatar`: "👤"

Now you can login with this account and see addresses/payments data!

---

## 📊 Verify Your Data

To check if products were added:
1. Firebase Console → Firestore Database
2. Click **"products"** collection
3. You should see 8 documents

---

## ✨ You're All Set!

Your Onway app is now fully integrated with Firestore and ready to:
- ✅ Display products on Home screen
- ✅ Filter by category
- ✅ Show product details
- ✅ Save addresses
- ✅ Save payment methods
- ✅ Track orders
- ✅ Show notifications

**Next**: Start the app and explore! 🎉
