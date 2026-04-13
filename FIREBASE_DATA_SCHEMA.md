/*
  FIREBASE FIRESTORE DATA SCHEMA FOR ONWAY APP
  == ============================================
  
  This document outlines the complete collection structure for the Onway app.
*/

// ========================================
// 1. USERS COLLECTION
// ========================================
// Path: /users/{userId}
// Created during signup, updated on profile changes

{
  // Document ID: Same as Firebase Auth UID
  "id": "abc123def456",
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "phone": "+91 9876543210",
  "avatar": "👤",
  "createdAt": timestamp,
  "updatedAt": timestamp,
  "status": "active" // or "inactive", "suspended"
}


// ========================================
// 2. PRODUCTS COLLECTION
// ========================================
// Path: /products/{productId}
// Read-only collection for storefront

{
  "id": "1",
  "name": "Paracetamol",
  "brand": "GENERIC",
  "category": "medicines", // or "grocery", "beauty", "electronics", etc.
  "price": 25,
  "originalPrice": 25,
  "rating": 4.0,
  "reviews": 245,
  "deliveryTime": 12, // in minutes
  "description": "Effective pain reliever and fever reducer. Pack of 10 tablets.",
  "warranty": "1 Year", // or null
  "returnDays": 7,
  "imageUrl": "https://...image.jpg",
  "stock": 100,
  "createdAt": timestamp,
  "updatedAt": timestamp
}

// Example Products:
[
  {
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
    "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1234567/paracetamol.jpg",
    "stock": 100,
    "createdAt": timestamp,
    "updatedAt": timestamp
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
    "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1234567/saras_milk.jpg",
    "stock": 150,
    "createdAt": timestamp,
    "updatedAt": timestamp
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
    "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1234567/dettol_sanitizer.jpg",
    "stock": 200,
    "createdAt": timestamp,
    "updatedAt": timestamp
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
    "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1234567/bru_coffee.jpg",
    "stock": 180,
    "createdAt": timestamp,
    "updatedAt": timestamp
  },
  {
    "id": "5",
    "name": "CMF buds pro 2",
    "brand": "NOTHING",
    "category": "electronics",
    "price": 45.0,
    "originalPrice": 59.0,
    "rating": 4.6,
    "reviews": 430,
    "deliveryTime": 25,
    "description": "Wireless earbuds with active noise cancellation.",
    "warranty": "1 Year Warranty",
    "returnDays": 14,
    "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1234567/cmf_buds.jpg",
    "stock": 50,
    "createdAt": timestamp,
    "updatedAt": timestamp
  }
]


// ========================================
// 3. USER ADDRESSES COLLECTION
// ========================================
// Path: /users/{userId}/addresses/{addressId}
// Stored as subcollection under user

{
  "id": "addr_001",
  "type": "home", // or "work"
  "name": "Alex Johnson",
  "address": "Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102",
  "phone": "+91 9876543210",
  "isDefault": true,
  "createdAt": timestamp,
  "updatedAt": timestamp
}

// Example Dummy Data:
[
  {
    "id": "addr_001",
    "type": "home",
    "name": "Alex Johnson",
    "address": "Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102",
    "phone": "+91 9876543210",
    "isDefault": true,
    "createdAt": timestamp,
    "updatedAt": timestamp
  },
  {
    "id": "addr_002",
    "type": "work",
    "name": "Alex Johnson",
    "address": "Onway Tech Solutions, 2nd Floor, Delta Tower, Koramangala, Bangalore - 560034",
    "phone": "+91 9876543210",
    "isDefault": false,
    "createdAt": timestamp,
    "updatedAt": timestamp
  }
]


// ========================================
// 4. USER PAYMENT METHODS COLLECTION
// ========================================
// Path: /users/{userId}/paymentMethods/{paymentId}
// Stored as subcollection under user

{
  "id": "pay_001",
  "type": "upi", // or "cards", "netbanking"
  "label": "Google Pay",
  "details": "9876543210@okhdfcbank",
  "icon": "📱",
  "isDefault": true,
  "createdAt": timestamp,
  "updatedAt": timestamp
}

// Example Dummy Data:
[
  {
    "id": "pay_001",
    "type": "upi",
    "label": "Google Pay",
    "details": "9876543210@okhdfcbank",
    "icon": "📱",
    "isDefault": true,
    "createdAt": timestamp,
    "updatedAt": timestamp
  },
  {
    "id": "pay_002",
    "type": "cards",
    "label": "HDFC Debit Card",
    "details": "•••• •••• •••• 4532",
    "icon": "💳",
    "isDefault": false,
    "createdAt": timestamp,
    "updatedAt": timestamp
  },
  {
    "id": "pay_003",
    "type": "netbanking",
    "label": "ICICI Net Banking",
    "details": "account_details_encrypted",
    "icon": "🏦",
    "isDefault": false,
    "createdAt": timestamp,
    "updatedAt": timestamp
  }
]


// ========================================
// 5. ORDERS COLLECTION
// ========================================
// Path: /users/{userId}/orders/{orderId}
// Stored as subcollection under user

{
  "id": "order_001",
  "title": "Arrived in 10 minutes",
  "price": 297,
  "date": "19 Feb",
  "time": "8:30 pm",
  "status": "Arrived", // or "In Transit", "Processing", "Cancelled"
  "deliveryTime": 10, // in minutes from order time
  "items": [
    {
      "productId": "2",
      "name": "Saras Milk",
      "quantity": 1,
      "price": 26,
      "imageUrl": "https://..."
    }
  ],
  "shippingAddress": {
    "id": "addr_001",
    "address": "Apt 4B, Silver Oak Residency...",
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
  "supportContact": "1800-xxx-xxx",
  "createdAt": timestamp,
  "updatedAt": timestamp
}

// Example Dummy Data:
[
  {
    "id": "order_001",
    "title": "Arrived in 10 minutes",
    "price": 297,
    "date": "19 Feb",
    "time": "8:30 pm",
    "status": "Arrived",
    "deliveryTime": 10,
    "items": [
      {
        "productId": "2",
        "name": "Saras Milk",
        "quantity": 1,
        "price": 26,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1234567/saras_milk.jpg"
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
    "subtotal": 255,
    "deliveryFee": 0,
    "taxes": 42,
    "totalAmount": 297,
    "supportContact": "1800-xxx-xxx",
    "createdAt": timestamp,
    "updatedAt": timestamp
  },
  {
    "id": "order_002",
    "title": "On its way to you",
    "price": 520,
    "date": "18 Feb",
    "time": "2:15 pm",
    "status": "In Transit",
    "deliveryTime": 45,
    "items": [
      {
        "productId": "1",
        "name": "Paracetamol",
        "quantity": 2,
        "price": 25,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1234567/paracetamol.jpg"
      },
      {
        "productId": "3",
        "name": "Hand Sanitizer Dettol",
        "quantity": 1,
        "price": 30,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1234567/dettol_sanitizer.jpg"
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
    "supportContact": "1800-xxx-xxx",
    "createdAt": timestamp,
    "updatedAt": timestamp
  },
  {
    "id": "order_003",
    "title": "Your order is confirmed",
    "price": 186,
    "date": "17 Feb",
    "time": "6:45 pm",
    "status": "Processing",
    "deliveryTime": 20,
    "items": [
      {
        "productId": "4",
        "name": "Bru Coffee",
        "quantity": 1,
        "price": 18.5,
        "imageUrl": "https://res.cloudinary.com/dhjzybacp/image/upload/v1234567/bru_coffee.jpg"
      }
    ],
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
    "supportContact": "1800-xxx-xxx",
    "createdAt": timestamp,
    "updatedAt": timestamp
  }
]


// ========================================
// 6. CART COLLECTION (Optional)
// ========================================
// Path: /users/{userId}/cart
// Single document to store current cart
// OR store as subcollection: /users/{userId}/cart/{itemId}

// Option 1: Single Document
{
  "userId": "abc123def456",
  "items": [
    {
      "productId": "1",
      "name": "Paracetamol",
      "quantity": 2,
      "price": 25,
      "originalPrice": 25,
      "brand": "GENERIC",
      "description": "Effective pain reliever and fever reducer. Pack of 10 tablets.",
      "imageUrl": "https://..."
    },
    {
      "productId": "2",
      "name": "Saras Milk",
      "quantity": 1,
      "price": 26,
      "originalPrice": 27,
      "brand": "SARAS",
      "description": "Fresh and pure milk, 1 liter.",
      "imageUrl": "https://..."
    }
  ],
  "updatedAt": timestamp
}

// Option 2: Subcollection (Better for Firestore)
// Path: /users/{userId}/cart/{itemId}
{
  "itemId": "cart_item_001",
  "productId": "1",
  "name": "Paracetamol",
  "quantity": 2,
  "price": 25,
  "originalPrice": 25,
  "brand": "GENERIC",
  "description": "Effective pain reliever and fever reducer. Pack of 10 tablets.",
  "imageUrl": "https://...",
  "addedAt": timestamp
}


// ========================================
// 7. NOTIFICATIONS COLLECTION (Optional)
// ========================================
// Path: /users/{userId}/notifications/{notificationId}

{
  "id": "notif_001",
  "title": "Your order has arrived",
  "description": "Order #order_001 has been delivered. Thank you for shopping!",
  "type": "order_update", // or "promo", "system", "reminder"
  "icon": "📦",
  "read": false,
  "orderId": "order_001", // link to order if applicable
  "createdAt": timestamp
}

// Example Dummy Data:
[
  {
    "id": "notif_001",
    "title": "Your order has arrived",
    "description": "Order #order_001 has been delivered. Thank you for shopping!",
    "type": "order_update",
    "icon": "📦",
    "read": false,
    "orderId": "order_001",
    "createdAt": timestamp
  },
  {
    "id": "notif_002",
    "title": "Delivery in progress",
    "description": "Your order #order_002 is on its way and will arrive in 45 minutes",
    "type": "order_update",
    "icon": "🚗",
    "read": true,
    "orderId": "order_002",
    "createdAt": timestamp
  },
  {
    "id": "notif_003",
    "title": "Special offer on health products",
    "description": "Get 20% off on all medicines today only!",
    "type": "promo",
    "icon": "🎉",
    "read": false,
    "createdAt": timestamp
  }
]


// ========================================
// FIRESTORE RULES SETUP
// ========================================

{
  // Rules for user data (only users can access their data)
  "users": {
    "uid": {
      ".read": "request.auth.uid == $uid",
      ".write": "request.auth.uid == $uid"
    }
  }
}


// ========================================
// FIREBASE AUTHENTICATION
// ========================================

// Sample User Credentials for Testing:
[
  {
    "email": "alex@example.com",
    "password": "password123" // Use strong passwords!
  },
  {
    "email": "john@example.com",
    "password": "password456"
  },
  {
    "email": "sarah@example.com",
    "password": "password789"
  }
]


// ========================================
// FIRESTORE COLLECTION STRUCTURE SUMMARY
// ========================================

/products                          (Public collection - all products)
  └── {productId}

/users                             (Auth-protected collection)
  └── {userId}
      ├── /addresses              (Subcollection)
      │   └── {addressId}
      ├── /paymentMethods         (Subcollection)
      │   └── {paymentId}
      ├── /orders                 (Subcollection)
      │   └── {orderId}
      ├── /cart                   (Subcollection)
      │   └── {itemId}
      └── /notifications          (Subcollection)
          └── {notificationId}


// ========================================
// NOTES FOR DUMMY DATA CREATION
// ========================================

1. Use Firebase Console or Firestore Data Importer
2. Replace "timestamp" with actual server timestamp values
3. Image URLs should be valid HTTPS URLs (use Cloudinary or similar)
4. userId values must match Firebase Auth UID
5. productId values should be unique strings
6. Recommended: Create 3-5 test users with different addresses and orders
7. For testing: Use consistent user IDs across addresses, payments, and orders
8. Always use strong passwords for test accounts
9. Image URLs can be from any public source for testing

// ========================================
// SECURITY CONSIDERATIONS
// ========================================

- Never store sensitive card information directly (use tokenization)
- Implement Firestore Rules to restrict data access
- Use Firebase Authentication for user verification
- Encrypt sensitive fields if needed
- Always validate data on backend before saving
