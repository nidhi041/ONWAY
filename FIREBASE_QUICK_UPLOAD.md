# 🚀 Upload Dummy Data to Firebase - Quick Start

## ⚡ One-Command Setup

### Step 1: Install Required Package
```bash
npm install firebase-admin
```

### Step 2: Set Up Authentication
You have two options:

#### Option A: Using Environment Variable (Easiest)
```bash
# Windows (PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
npm run populate-firebase

# Windows (Command Prompt)
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json
npm run populate-firebase

# Mac/Linux
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
npm run populate-firebase
```

#### Option B: Direct Configuration
1. Download `serviceAccountKey.json` from Firebase Console:
   - Go to **Firebase Console** → **Project Settings** ⚙️
   - Go to **Service Accounts** tab
   - Click **Generate new private key**
   
2. Edit `scripts/populate-firebase.js` and uncomment:
   ```javascript
   const serviceAccount = require('./serviceAccountKey.json');
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
   });
   ```

### Step 3: Run the Population Script
```bash
npm run populate-firebase
```

---

## ✅ What Gets Uploaded

✨ **8 Products**
- Paracetamol, Saras Milk, Dettol, Bru Coffee
- CMF Buds Pro 2, Dot & Key Serum, Red Bull, Aspirin

👤 **2 Test Users** (with Firebase Auth)
- `alex@example.com` / `SecurePass@123`
- `john@example.com` / `SecurePass@456`

📍 **User Data** (for the first user)
- 2 Addresses (Home & Office)
- 2 Payment Methods (UPI & Card)
- 1 Sample Order
- 2 Notifications

---

## 🎯 After Upload

### Test the App
```bash
npm expo start
```

### Login with Test User
- Email: `alex@example.com`
- Password: `SecurePass@123`

### What You Can Do
✅ Browse products with real Firebase data
✅ View sample orders
✅ See addresses and payment methods
✅ Check notifications
✅ Add to cart and checkout

---

## 🐛 Troubleshooting

### "Cannot find module firebase-admin"
```bash
npm install firebase-admin
```

### "Error: Invalid service account"
- Make sure your `serviceAccountKey.json` is valid
- Download fresh copy from Firebase Console

### "Auth users already exist"
- Script automatically skips existing users
- Continue with the setup

### "Connection timeout"
- Check internet connection
- Verify Firebase project is active
- Make sure Firestore is initialized

---

## 📊 Verify in Firebase Console

After running the script:

1. Go to **Firebase Console** → **Firestore Database**
2. Check these collections:
   - ✅ `products` (8 documents)
   - ✅ `users` (2 documents)
3. Expand `/users/` → Check subcollections

---

## 🔒 Security Note

The `serviceAccountKey.json` contains sensitive credentials. **Never commit it to Git!**

Add to `.gitignore`:
```
scripts/serviceAccountKey.json
*.json  # If storing keys locally
```

---

**That's it! Your Firebase is now populated with all dummy data! 🎉**
