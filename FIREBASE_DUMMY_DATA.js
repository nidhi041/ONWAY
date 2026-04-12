/*
  READY-TO-USE DUMMY DATA FOR FIRESTORE
  ====================================
  Use this data to quickly populate your Firebase collections
  
  Instructions:
  1. Go to Firebase Console → Firestore Database
  2. For products collection: Create it and add these documents
  3. For users: Create test users in Firebase Auth first
  4. Then add their subcollections using these structures
*/

// ============================================
// PRODUCTS COLLECTION - Ready to Import
// ============================================

PRODUCTS_DATA = [{
        "id": "1",
        "name": "Paracetamol",
        "brand": "GENERIC",
        "category": "medicines",
        "price": 25,
        "originalPrice": 25,
        "rating": 4.0,
        "reviews": 245,
        "deliveryTime": 12,
        "description": "Effective pain reliever and fever reducer. Pack of 10 tablets.",
        "warranty": "1 Year",
        "returnDays": 7,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/medicines/paracetamol.jpg",
        "stock": 100
    },
    {
        "id": "2",
        "name": "Saras Milk",
        "brand": "SARAS",
        "category": "grocery",
        "price": 26,
        "originalPrice": 27,
        "rating": 4.9,
        "reviews": 892,
        "deliveryTime": 15,
        "description": "Fresh and pure milk, 1 liter. Rich in calcium and vitamins.",
        "warranty": null,
        "returnDays": 3,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/grocery/saras_milk.avif",
        "stock": 150
    },
    {
        "id": "3",
        "name": "Hand Sanitizer Dettol",
        "brand": "DETTOL",
        "category": "beauty",
        "price": 30,
        "originalPrice": 30,
        "rating": 4.5,
        "reviews": 567,
        "deliveryTime": 10,
        "description": "99.9% germ protection. 500ml bottle.",
        "warranty": null,
        "returnDays": 14,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/beauty/dettol_hand_sanitizer.jpg",
        "stock": 200
    },
    {
        "id": "4",
        "name": "Bru Coffee",
        "brand": "BRU",
        "category": "grocery",
        "price": 18.5,
        "originalPrice": 22.0,
        "rating": 4.7,
        "reviews": 1203,
        "deliveryTime": 18,
        "description": "Instant premium coffee powder. 100g pack.",
        "warranty": null,
        "returnDays": 7,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/grocery/bru_coffee.jpg",
        "stock": 180
    },
    {
        "id": "5",
        "name": "CMF Buds Pro 2",
        "brand": "NOTHING",
        "category": "electronics",
        "price": 45.0,
        "originalPrice": 59.0,
        "rating": 4.6,
        "reviews": 430,
        "deliveryTime": 25,
        "description": "Wireless earbuds with active noise cancellation. 40-hour battery life.",
        "warranty": "1 Year Warranty",
        "returnDays": 14,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/electronics/cmf_buds_pro_2.jpg",
        "stock": 50
    },
    {
        "id": "6",
        "name": "Dot & Key 10% Vitamin C+E",
        "brand": "DOT & KEY",
        "category": "beauty",
        "price": 24.0,
        "originalPrice": 28.0,
        "rating": 4.4,
        "reviews": 789,
        "deliveryTime": 14,
        "description": "Brightening vitamin C serum. 30ml bottle.",
        "warranty": null,
        "returnDays": 30,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/beauty/dot_and_key_serum.jpg",
        "stock": 75
    },
    {
        "id": "7",
        "name": "Red Bull Energy Drink",
        "brand": "RED BULL",
        "category": "grocery",
        "price": 50.0,
        "originalPrice": 55.0,
        "rating": 4.3,
        "reviews": 456,
        "deliveryTime": 12,
        "description": "250ml energy drink. Gives you wings!",
        "warranty": null,
        "returnDays": 3,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/grocery/red_bull.avif",
        "stock": 120
    },
    {
        "id": "8",
        "name": "Aspirin 500mg",
        "brand": "CIPLA",
        "category": "medicines",
        "price": 20.0,
        "originalPrice": 20.0,
        "rating": 4.2,
        "reviews": 198,
        "deliveryTime": 12,
        "description": "Pain relief and fever reducer. Pack of 15 tablets.",
        "warranty": null,
        "returnDays": 7,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/medicines/aspirin.jpg",
        "stock": 110
    }
]


// ============================================
// USER DATA - Test Account
// ============================================

// Create this user in Firebase Auth first:
USER_AUTH_CREDENTIALS = {
    "email": "alex@example.com",
    "password": "SecurePass@123" // Use this to login
}

// Then create this document: /users/abc123def456
// (Replace abc123def456 with the actual Firebase UID after signup)

USER_PROFILE = {
    "id": "abc123def456",
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "phone": "+91 9876543210",
    "avatar": "👤"
}


// ============================================
// ADDRESSES - For above user
// ============================================

// Path: /users/abc123def456/addresses/addr_001
ADDRESS_1 = {
    "id": "addr_001",
    "type": "home",
    "name": "Alex Johnson",
    "address": "Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102",
    "phone": "+91 9876543210",
    "isDefault": true
}

// Path: /users/abc123def456/addresses/addr_002
ADDRESS_2 = {
    "id": "addr_002",
    "type": "work",
    "name": "Alex Johnson - Office",
    "address": "Onway Tech Solutions, 2nd Floor, Delta Tower, Koramangala, Bangalore - 560034",
    "phone": "+91 9876543210",
    "isDefault": false
}


// ============================================
// PAYMENT METHODS - For above user
// ============================================

// Path: /users/abc123def456/paymentMethods/pay_001
PAYMENT_1 = {
    "id": "pay_001",
    "type": "upi",
    "label": "Google Pay",
    "details": "9876543210@okhdfcbank",
    "icon": "📱",
    "isDefault": true
}

// Path: /users/abc123def456/paymentMethods/pay_002
PAYMENT_2 = {
    "id": "pay_002",
    "type": "cards",
    "label": "HDFC Debit Card",
    "details": "•••• •••• •••• 4532",
    "icon": "💳",
    "isDefault": false
}

// Path: /users/abc123def456/paymentMethods/pay_003
PAYMENT_3 = {
    "id": "pay_003",
    "type": "netbanking",
    "label": "ICICI Net Banking",
    "details": "ICICI_account_ending_in_789",
    "icon": "🏦",
    "isDefault": false
}


// ============================================
// ORDERS - For above user
// ============================================

// Path: /users/abc123def456/orders/order_001
ORDER_1 = {
    "id": "order_001",
    "title": "Arrived in 10 minutes",
    "price": 297,
    "date": "19 Feb 2025",
    "time": "8:30 pm",
    "status": "Arrived",
    "deliveryTime": 10,
    "items": [{
        "productId": "2",
        "name": "Saras Milk",
        "quantity": 1,
        "price": 26,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/grocery/saras_milk.avif"
    }],
    "shippingAddress": {
        "id": "addr_001",
        "address": "Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102",
        "phone": "+91 9876543210"
    },
    "paymentMethod": {
        "id": "pay_001",
        "type": "upi",
        "label": "Google Pay"
    },
    "subtotal": 255,
    "deliveryFee": 0,
    "taxes": 42,
    "totalAmount": 297,
    "supportContact": "1800-100-1234"
}

// Path: /users/abc123def456/orders/order_002
ORDER_2 = {
    "id": "order_002",
    "title": "On its way to you",
    "price": 520,
    "date": "18 Feb 2025",
    "time": "2:15 pm",
    "status": "In Transit",
    "deliveryTime": 45,
    "items": [{
            "productId": "1",
            "name": "Paracetamol",
            "quantity": 2,
            "price": 25,
            "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/medicines/paracetamol.jpg"
        },
        {
            "productId": "3",
            "name": "Hand Sanitizer Dettol",
            "quantity": 1,
            "price": 30,
            "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/beauty/dettol_hand_sanitizer.jpg"
        }
    ],
    "shippingAddress": {
        "id": "addr_001",
        "address": "Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102",
        "phone": "+91 9876543210"
    },
    "paymentMethod": {
        "id": "pay_001",
        "type": "upi",
        "label": "Google Pay"
    },
    "subtotal": 480,
    "deliveryFee": 0,
    "taxes": 40,
    "totalAmount": 520,
    "supportContact": "1800-100-1234"
}

// Path: /users/abc123def456/orders/order_003
ORDER_3 = {
    "id": "order_003",
    "title": "Your order is confirmed",
    "price": 186,
    "date": "17 Feb 2025",
    "time": "6:45 pm",
    "status": "Processing",
    "deliveryTime": 20,
    "items": [{
        "productId": "4",
        "name": "Bru Coffee",
        "quantity": 1,
        "price": 18.5,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/grocery/bru_coffee.jpg"
    }],
    "shippingAddress": {
        "id": "addr_002",
        "address": "Onway Tech Solutions, 2nd Floor, Delta Tower, Koramangala, Bangalore - 560034",
        "phone": "+91 9876543210"
    },
    "paymentMethod": {
        "id": "pay_002",
        "type": "cards",
        "label": "HDFC Debit Card"
    },
    "subtotal": 144,
    "deliveryFee": 0,
    "taxes": 42,
    "totalAmount": 186,
    "supportContact": "1800-100-1234"
}


// ============================================
// NOTIFICATIONS - For above user
// ============================================

// Path: /users/abc123def456/notifications/notif_001
NOTIFICATION_1 = {
    "id": "notif_001",
    "title": "Your order has arrived",
    "description": "Order #order_001 has been delivered. Thank you for shopping!",
    "type": "order_update",
    "icon": "📦",
    "read": false,
    "orderId": "order_001"
}

// Path: /users/abc123def456/notifications/notif_002
NOTIFICATION_2 = {
    "id": "notif_002",
    "title": "Delivery in progress",
    "description": "Your order #order_002 is on its way and will arrive in 45 minutes",
    "type": "order_update",
    "icon": "🚗",
    "read": true,
    "orderId": "order_002"
}

// Path: /users/abc123def456/notifications/notif_003
NOTIFICATION_3 = {
    "id": "notif_003",
    "title": "Special offer on health products",
    "description": "Get 20% off on all medicines this weekend only!",
    "type": "promo",
    "icon": "🎉",
    "read": false
}

// Path: /users/abc123def456/notifications/notif_004
NOTIFICATION_4 = {
    "id": "notif_004",
    "title": "Return accepted",
    "description": "Your return for order #order_003 has been accepted. Refund will be processed in 5-7 days.",
    "type": "order_update",
    "icon": "↩️",
    "read": true,
    "orderId": "order_003"
}


// ============================================
// SECOND USER (Optional)
// ============================================

// Create this user in Firebase Auth first:
USER_AUTH_CREDENTIALS_2 = {
    "email": "john@example.com",
    "password": "SecurePass@456"
}

// User Profile: /users/xyz789abc123
USER_PROFILE_2 = {
    "id": "xyz789abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543211",
    "avatar": "👤"
}

// Address for John: /users/xyz789abc123/addresses/addr_001
ADDRESS_JOHN_1 = {
    "id": "addr_001",
    "type": "home",
    "name": "John Doe",
    "address": "123 Main Street, Apartment 201, New York, NY 10001, USA",
    "phone": "+91 9876543211",
    "isDefault": true
}

// Payment for John: /users/xyz789abc123/paymentMethods/pay_001
PAYMENT_JOHN_1 = {
    "id": "pay_001",
    "type": "cards",
    "label": "American Express",
    "details": "•••• •••• •••• 8765",
    "icon": "💳",
    "isDefault": true
}

// Order for John: /users/xyz789abc123/orders/order_001
ORDER_JOHN_1 = {
    "id": "order_001",
    "title": "Delivery completed",
    "price": 125,
    "date": "16 Feb 2025",
    "time": "11:20 am",
    "status": "Arrived",
    "deliveryTime": 8,
    "items": [{
        "productId": "5",
        "name": "CMF Buds Pro 2",
        "quantity": 1,
        "price": 45.0,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/electronics/cmf_buds_pro_2.jpg"
    }],
    "shippingAddress": {
        "id": "addr_001",
        "address": "123 Main Street, Apartment 201, New York, NY 10001, USA",
        "phone": "+91 9876543211"
    },
    "paymentMethod": {
        "id": "pay_001",
        "type": "cards",
        "label": "American Express"
    },
    "subtotal": 100,
    "deliveryFee": 0,
    "taxes": 25,
    "totalAmount": 125,
    "supportContact": "1800-100-1234"
}


// ============================================
// HOW TO USE THIS DATA IN FIREBASE
// ============================================

/*
STEP 1: Create Products Collection
1. Go to Firebase Console → Firestore Database
2. Click "Start Collection" → Name it "products"
3. For each product in PRODUCTS_DATA:
   - Click "Add Document"
   - Set Document ID to the product's "id" (e.g., "1", "2")
   - Add all fields from the product object
   - Click Save

STEP 2: Create Users & Auth
1. Go to Firebase Console → Authentication
2. Click "Add user" for each test account
3. Note down the UID for each user (you'll need it for subcollections)

STEP 3: Create User Profile
1. Go to Firestore Database → "users" collection
2. Click "Add Document"
3. Set Document ID to the Firebase UID (from Step 2)
4. Add the user profile data
5. Click Save

STEP 4: Create Subcollections (Addresses, Orders, etc.)
1. In Firestore, navigate to /users/{userId}
2. Click "Start collection" → Name it "addresses"
3. Add documents with ADDRESS_1, ADDRESS_2 data
4. Repeat for "orders", "paymentMethods", "notifications"

STEP 5: Verify Data
1. Check each collection in Firebase Console
2. Ensure all document IDs match the "id" field
3. Verify images URLs are accessible
4. Test authentication with the credentials

QUICK TIP:
Use Firebase Import/Export for bulk operations:
- Export to JSON
- Import from JSON
(Available in Firebase Console under Settings)
*/


// ============================================
// FIRESTORE SECURITY RULES (Optional)
// ============================================

rules_version = '2';
service cloud.firestore {
    match / databases / { database }
    /documents {

    // Public products collection - anyone can read
    match / products / { productId } {
        allow read: if true;
        allow write: if false; // Admin only
    }

    // User data - only owners can access
    match / users / { userId } {
        allow read, write: if request.auth.uid == userId;

        // User subcollections
        match / { subcollection = ** } {
            allow read, write: if request.auth.uid == userId;
        }
    }
}
}