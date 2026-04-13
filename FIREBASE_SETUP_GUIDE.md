# Firebase Setup Guide for Onway App

## Quick Start: Adding Dummy Data to Firebase

### ✅ Prerequisites
- Firebase Project created
- Firestore Database initialized
- Firebase Authentication enabled

---

## 📋 Step-by-Step Instructions

### **Step 1: Create Products Collection**

1. Go to **Firebase Console** → **Firestore Database**
2. Click **"Start Collection"** button
3. Name the collection: `products`
4. Click **"Next"**
5. Click **"Add Document"** and add the first product:

```
Document ID: 1 (auto-generated or type manually)
Fields:
  name: "Paracetamol"
  brand: "GENERIC"
  category: "medicines"
  price: 25
  originalPrice: 25
  rating: 4.0
  reviews: 245
  deliveryTime: 12
  description: "Effective pain reliever and fever reducer. Pack of 10 tablets."
  warranty: "1 Year"
  returnDays: 7
  imageUrl: "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/medicines/paracetamol.jpg"
  stock: 100
```

6. Copy-paste all products from `FIREBASE_DUMMY_DATA.js` → `PRODUCTS_DATA` array
7. Click **Save** for each product

**Quick Tip:** Use [Firestore Data Importer](https://firebase.google.com/docs/firestore/solutions/build-large-scale-data-import) for faster import

---

### **Step 2: Create User Authentication**

1. Go to **Firebase Console** → **Authentication**
2. Click **"Add user"** button
3. Enter email and password:

```
Email: alex@example.com
Password: SecurePass@123
```

4. Click **Create**
5. **Important:** Copy the **User UID** that appears (you'll need it!)
   - Example: `abc123def456`
6. Repeat for second user:
   ```
   Email: john@example.com
   Password: SecurePass@456
   ```

---

### **Step 3: Create User Profiles**

1. Go back to **Firestore Database**
2. Click **"Start Collection"** → name it `users`
3. For Document ID, paste the UID from Step 2 (e.g., `abc123def456`)
4. Add these fields:

```
id: "abc123def456"
name: "Alex Johnson"
email: "alex@example.com"
phone: "+91 9876543210"
avatar: "👤"
```

5. Click **Save**
6. Repeat for John's profile with his UID

---

### **Step 4: Create Subcollections (Addresses)**

1. In Firestore, find **users** → **abc123def456**
2. Click **"Start Collection"** → name it `addresses`
3. Set Document ID to: `addr_001`
4. Add fields from `ADDRESS_1` in dummy data:

```
id: "addr_001"
type: "home"
name: "Alex Johnson"
address: "Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102"
phone: "+91 9876543210"
isDefault: true
```

5. Click **Save**
6. Click **"Add document"** again → `addr_002`
7. Add fields from `ADDRESS_2`

---

### **Step 5: Create Payment Methods Subcollection**

1. In Firestore, find **users** → **abc123def456**
2. Click **"Start Collection"** → name it `paymentMethods`
3. Add three payment documents:

**Document 1: `pay_001`**
```
id: "pay_001"
type: "upi"
label: "Google Pay"
details: "9876543210@okhdfcbank"
icon: "📱"
isDefault: true
```

**Document 2: `pay_002`**
```
id: "pay_002"
type: "cards"
label: "HDFC Debit Card"
details: "•••• •••• •••• 4532"
icon: "💳"
isDefault: false
```

**Document 3: `pay_003`**
```
id: "pay_003"
type: "netbanking"
label: "ICICI Net Banking"
details: "ICICI_account_ending_in_789"
icon: "🏦"
isDefault: false
```

---

### **Step 6: Create Orders Subcollection**

1. In Firestore, find **users** → **abc123def456**
2. Click **"Start Collection"** → name it `orders`
3. Add first order with Document ID: `order_001`

```
id: "order_001"
title: "Arrived in 10 minutes"
price: 297
date: "19 Feb 2025"
time: "8:30 pm"
status: "Arrived"
deliveryTime: 10
supportContact: "1800-100-1234"

items: [
  {
    productId: "2",
    name: "Saras Milk",
    quantity: 1,
    price: 26,
    imageUrl: "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/grocery/saras_milk.avif"
  }
]

shippingAddress: {
  id: "addr_001",
  address: "Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102",
  phone: "+91 9876543210"
}

paymentMethod: {
  id: "pay_001",
  type: "upi",
  label: "Google Pay"
}

subtotal: 255
deliveryFee: 0
taxes: 42
totalAmount: 297
```

4. Add `order_002` and `order_003` similarly (see `FIREBASE_DUMMY_DATA.js`)

---

### **Step 7: Create Notifications Subcollection**

1. In Firestore, find **users** → **abc123def456**
2. Click **"Start Collection"** → name it `notifications`
3. Add documents: `notif_001`, `notif_002`, `notif_003`, `notif_004`

Example for `notif_001`:
```
id: "notif_001"
title: "Your order has arrived"
description: "Order #order_001 has been delivered. Thank you for shopping!"
type: "order_update"
icon: "📦"
read: false
orderId: "order_001"
```

---

### **Step 8: (Optional) Create Cart Subcollection**

1. In Firestore, find **users** → **abc123def456**
2. Click **"Start Collection"** → name it `cart`
3. Add cart items as documents

```
Document ID: cart_item_001
productId: "1"
name: "Paracetamol"
quantity: 2
price: 25
originalPrice: 25
brand: "GENERIC"
description: "Effective pain reliever..."
imageUrl: "https://..."
```

---

## 🔒 Firestore Security Rules

After adding dummy data, implement these rules to secure your database:

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public products collection - anyone can read
    match /products/{productId} {
      allow read: if true;
      allow write: if false;
    }
    
    // User data - only owners can access
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // All subcollections
      match /{subcollection=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **Publish**

---

## 🧪 Testing Your Setup

### Test 1: Verify Products Load
1. Open the app and navigate to **Explore/Category**
2. Check if products from Firebase appear
3. Verify images load correctly

### Test 2: Test Authentication
1. Go to **Login** page
2. Use credentials: `alex@example.com` / `SecurePass@123`
3. Verify login works and user profile appears

### Test 3: View User Data
1. After login, go to **Profile**
2. Verify name, email, phone display correctly

### Test 4: Check Orders
1. Go to **My Orders**
2. Verify orders from Firebase appear
3. Check order status displays correctly

### Test 5: View Addresses
1. Go to **Saved Addresses**
2. Verify both home and work addresses appear

### Test 6: Check Payment Methods
1. Go to **Payment Methods**
2. Verify all three payment methods display
3. Check default badge shows on Google Pay

---

## 📊 Collection Structure Summary

```
/products
├── 1 (Paracetamol)
├── 2 (Saras Milk)
├── 3 (Hand Sanitizer)
└── ... (more products)

/users
├── abc123def456 (Alex Johnson)
│   ├── /addresses
│   │   ├── addr_001 (Home)
│   │   └── addr_002 (Work)
│   ├── /paymentMethods
│   │   ├── pay_001 (Google Pay - UPI)
│   │   ├── pay_002 (HDFC Card)
│   │   └── pay_003 (ICICI Net Banking)
│   ├── /orders
│   │   ├── order_001 (Arrived)
│   │   ├── order_002 (In Transit)
│   │   └── order_003 (Processing)
│   ├── /notifications
│   │   ├── notif_001
│   │   ├── notif_002
│   │   ├── notif_003
│   │   └── notif_004
│   └── /cart (optional)
│       └── cart_item_001
│
└── xyz789abc123 (John Doe - Optional)
    ├── /addresses
    ├── /paymentMethods
    ├── /orders
    └── /notifications
```

---

## ⚠️ Common Issues & Solutions

### Issue: Images not loading
**Solution:** 
- Ensure image URLs are HTTPS
- Check Cloudinary permissions
- Use different image URLs if needed

### Issue: Can't login after adding user
**Solution:**
- Verify email and password in Auth match
- Check Firebase Authentication is enabled
- Try resetting password

### Issue: Orders not showing
**Solution:**
- Verify orders are under correct user UID
- Check order documents have all required fields
- Verify productId references exist in products collection

### Issue: App can't find Firebase
**Solution:**
- Verify `config/firebase.ts` is properly configured
- Check Firebase credentials in `.env` or config
- Ensure Firestore is initialized in your code

---

## 📱 Code Integration Notes

Your app already has Firebase integration. The following files handle Firebase queries:

- **`context/AuthContext.tsx`** - User authentication
- **`config/firebase.ts`** - Firebase configuration
- **Products** - Currently reading from local constants (update to Firestore)
- **Orders** - Currently using mock data (integrate with Firestore)
- **Addresses & Payments** - Currently using mock data (integrate with Firestore)

You'll need to update these files to read from Firestore instead of mock data.

---

## 🚀 Next Steps

1. ✅ Add all dummy data using this guide
2. ✅ Test login with Alex's account
3. ✅ Verify all collections appear in app
4. ✅ Update code to fetch from Firestore (not mock data)
5. ✅ Test all features end-to-end
6. ✅ Add more test users as needed

---

## 📞 Need Help?

If data isn't showing:
1. Check Firebase Console → Firestore Database
2. Verify collection names match exactly
3. Check document IDs and field names
4. Verify Authentication is enabled
5. Check browser console for errors in your app

Good luck! 🎉
