# Firebase Firestore Data Schema — OnWay Medical

> This app is a **medical products delivery platform**. Only medicines, health supplements, first-aid, and medical supplies are sold. No grocery, electronics, beauty, or other categories.

---

## 1. PRODUCTS COLLECTION
**Path:** `/products/{productId}`

All products belong to the `"Medicines"` category.

```json
{
  "id": "1",
  "name": "Paracetamol 500mg",
  "brand": "GENERIC",
  "category": "Medicines",
  "price": 25,
  "originalPrice": 30,
  "rating": 4.8,
  "reviews": 245,
  "deliveryTime": 12,
  "description": "Effective pain reliever and fever reducer. Pack of 10 tablets.",
  "warranty": null,
  "returnDays": 7,
  "imageUrl": "https://...image.jpg",
  "stock": 100,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### All Products

| id | name | brand | price | originalPrice |
|----|------|-------|-------|---------------|
| 1  | Paracetamol 500mg | GENERIC | 25 | 30 |
| 2  | Dettol Hand Sanitizer 500ml | DETTOL | 50 | 60 |
| 3  | Ibuprofen 400mg | BRUFEN | 40 | 48 |
| 4  | Cough Syrup 150ml | BENADRYL | 120 | 135 |
| 5  | Vitamin C 500mg Tablets | LIMCEE | 35 | 42 |
| 6  | Aspirin 75mg | CIPLA | 20 | 25 |
| 7  | Antacid Liquid 200ml | GELUSIL | 110 | 125 |
| 8  | First Aid Bandages (Pack of 20) | BAND-AID | 55 | 65 |
| 9  | Vicks VapoRub 50g | VICKS | 85 | 95 |
| 10 | ORS Electrolyte Sachets | ELECTRAL | 45 | 50 |
| 11 | Cetirizine 10mg | ZYRTEC | 30 | 35 |
| 12 | Multivitamin Tablets | SUPRADYN | 180 | 210 |

---

## 2. USERS COLLECTION
**Path:** `/users/{userId}`

```json
{
  "id": "abc123def456",
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "phone": "+91 9876543210",
  "avatar": "👤",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "status": "active"
}
```

---

## 3. USER ADDRESSES
**Path:** `/users/{userId}/addresses/{addressId}`

```json
{
  "id": "addr_001",
  "type": "home",
  "name": "Alex Johnson",
  "address": "Apt 4B, Silver Oak Residency, HSR Layout, Bangalore - 560102",
  "phone": "+91 9876543210",
  "isDefault": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 4. USER PAYMENT METHODS
**Path:** `/users/{userId}/paymentMethods/{paymentId}`

```json
{
  "id": "pay_001",
  "type": "upi",
  "label": "Google Pay",
  "details": "9876543210@okhdfcbank",
  "icon": "📱",
  "isDefault": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 5. ORDERS
**Path:** `/users/{userId}/orders/{orderId}`

```json
{
  "id": "order_001",
  "title": "Arrived in 10 minutes",
  "price": 100,
  "date": "19 Feb 2025",
  "time": "8:30 pm",
  "status": "Arrived",
  "deliveryTime": 10,
  "items": [
    {
      "productId": "1",
      "name": "Paracetamol 500mg",
      "quantity": 2,
      "price": 25,
      "imageUrl": "https://..."
    }
  ],
  "shippingAddress": {
    "address": "Apt 4B, HSR Layout, Bangalore - 560102",
    "phone": "+91 9876543210"
  },
  "paymentMethod": {
    "type": "upi",
    "label": "Google Pay"
  },
  "subtotal": 100,
  "deliveryFee": 0,
  "taxes": 0,
  "totalAmount": 100,
  "supportContact": "1800-xxx-xxx",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 6. CART
**Path:** `/users/{userId}/cart/{itemId}`

```json
{
  "id": "cart_item_001",
  "productId": "1",
  "name": "Paracetamol 500mg",
  "brand": "GENERIC",
  "description": "Effective pain reliever and fever reducer.",
  "quantity": 2,
  "price": 25,
  "originalPrice": 30,
  "imageUrl": "https://...",
  "addedAt": "timestamp"
}
```

---

## 7. NOTIFICATIONS
**Path:** `/users/{userId}/notifications/{notificationId}`

```json
{
  "id": "notif_001",
  "title": "Your order has arrived",
  "description": "Order #order_001 has been delivered. Stay healthy!",
  "type": "order_update",
  "icon": "📦",
  "read": false,
  "orderId": "order_001",
  "createdAt": "timestamp"
}
```

---

## Collection Structure Summary

```
/products                          (Public — medical products only)
  └── {productId}

/users                             (Auth-protected)
  └── {userId}
      ├── /addresses
      │   └── {addressId}
      ├── /paymentMethods
      │   └── {paymentId}
      ├── /orders
      │   └── {orderId}
      ├── /cart
      │   └── {itemId}
      └── /notifications
          └── {notificationId}
```

---

## Notes

- All products must have `category: "Medicines"` — no other categories are used
- `deliveryTime` is in minutes
- `warranty: null` for most medicines (set a value only for medical devices)
- `returnDays` is typically 7 for medicines, 14 for medical supplies
- Never store raw card numbers — use masked strings like `"•••• •••• •••• 4532"`
- Image URLs should be valid HTTPS (Cloudinary recommended)
- Run `npm run populate-firebase` to upload all products to Firestore
