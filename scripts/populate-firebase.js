#!/usr/bin/env node

/**
 * Complete Firestore Database Populator Script
 * =============================================
 * Uploads all dummy data to Firebase:
 * - Products (Medical only)
 * - Test Users (with Auth)
 * - User Profiles
 * - Addresses
 * - Payment Methods
 * - Orders
 * - Notifications
 *
 * Usage: npm run populate-firebase
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'onway-f5999',
    });
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('\n📖 Setup Instructions:');
  console.log('1. Download service account key from Firebase Console');
  console.log('2. Run: export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"');
  console.log('3. Then run: npm run populate-firebase');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

// ============================================
// MEDICAL PRODUCTS DATA
// ============================================

const PRODUCTS = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    brand: 'GENERIC',
    category: 'Medicines',
    price: 25,
    originalPrice: 30,
    rating: 4.8,
    reviews: 245,
    deliveryTime: 12,
    description: 'Effective pain reliever and fever reducer. Pack of 10 tablets.',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1776356502/paracetamol_oxdkym.jpg',
    stock: 100,
  },
  {
    id: '2',
    name: 'Dettol Hand Sanitizer 500ml',
    brand: 'DETTOL',
    category: 'Medicines',
    price: 50,
    originalPrice: 60,
    rating: 4.5,
    reviews: 567,
    deliveryTime: 10,
    description: 'Kills 99.9% of germs without water. 500ml bottle.',
    warranty: null,
    returnDays: 14,
    imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1776356501/Hand_senitizer_aljpnf.jpg',
    stock: 200,
  },
  {
    id: '3',
    name: 'Ibuprofen 400mg',
    brand: 'BRUFEN',
    category: 'Medicines',
    price: 40,
    originalPrice: 48,
    rating: 4.6,
    reviews: 312,
    deliveryTime: 12,
    description: 'Anti-inflammatory pain relief. Pack of 10 tablets.',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=500&q=60',
    stock: 200,
  },
  {
    id: '4',
    name: 'Cough Syrup 150ml',
    brand: 'BENADRYL',
    category: 'Medicines',
    price: 120,
    originalPrice: 135,
    rating: 4.3,
    reviews: 189,
    deliveryTime: 15,
    description: 'Effective relief from dry and wet cough. 150ml bottle.',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=500&q=60',
    stock: 80,
  },
  {
    id: '5',
    name: 'Vitamin C 500mg Tablets',
    brand: 'LIMCEE',
    category: 'Medicines',
    price: 35,
    originalPrice: 42,
    rating: 4.9,
    reviews: 634,
    deliveryTime: 12,
    description: 'Chewable Vitamin C tablets for daily immunity support. Pack of 15.',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&q=60',
    stock: 150,
  },
  {
    id: '6',
    name: 'Aspirin 75mg',
    brand: 'CIPLA',
    category: 'Medicines',
    price: 20,
    originalPrice: 25,
    rating: 4.2,
    reviews: 198,
    deliveryTime: 12,
    description: 'Low-dose aspirin for pain relief and fever. Pack of 14 tablets.',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1550572017-094e9f743ceb?auto=format&fit=crop&w=500&q=60',
    stock: 110,
  },
  {
    id: '7',
    name: 'Antacid Liquid 200ml',
    brand: 'GELUSIL',
    category: 'Medicines',
    price: 110,
    originalPrice: 125,
    rating: 4.2,
    reviews: 143,
    deliveryTime: 14,
    description: 'Fast relief from acidity, heartburn and indigestion. 200ml.',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5e4b7b25e?auto=format&fit=crop&w=500&q=60',
    stock: 45,
  },
  {
    id: '8',
    name: 'First Aid Bandages (Pack of 20)',
    brand: 'BAND-AID',
    category: 'Medicines',
    price: 55,
    originalPrice: 65,
    rating: 4.5,
    reviews: 421,
    deliveryTime: 10,
    description: 'Waterproof adhesive bandages for minor cuts and scrapes. Pack of 20.',
    warranty: null,
    returnDays: 14,
    imageUrl: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=500&q=60',
    stock: 300,
  },
  {
    id: '9',
    name: 'Vicks VapoRub 50g',
    brand: 'VICKS',
    category: 'Medicines',
    price: 85,
    originalPrice: 95,
    rating: 4.7,
    reviews: 876,
    deliveryTime: 12,
    description: 'Topical relief from cold, cough and blocked nose. 50g jar.',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5e4b7b25e?auto=format&fit=crop&w=500&q=60',
    stock: 30,
  },
  {
    id: '10',
    name: 'ORS Electrolyte Sachets',
    brand: 'ELECTRAL',
    category: 'Medicines',
    price: 45,
    originalPrice: 50,
    rating: 4.6,
    reviews: 302,
    deliveryTime: 10,
    description: 'Oral rehydration salts for dehydration. Pack of 10 sachets.',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=500&q=60',
    stock: 200,
  },
  {
    id: '11',
    name: 'Cetirizine 10mg',
    brand: 'ZYRTEC',
    category: 'Medicines',
    price: 30,
    originalPrice: 35,
    rating: 4.4,
    reviews: 267,
    deliveryTime: 12,
    description: 'Antihistamine for allergy relief. Pack of 10 tablets.',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1550572017-094e9f743ceb?auto=format&fit=crop&w=500&q=60',
    stock: 120,
  },
  {
    id: '12',
    name: 'Multivitamin Tablets',
    brand: 'SUPRADYN',
    category: 'Medicines',
    price: 180,
    originalPrice: 210,
    rating: 4.7,
    reviews: 512,
    deliveryTime: 12,
    description: 'Complete daily multivitamin and mineral supplement. Pack of 30 tablets.',
    warranty: null,
    returnDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&q=60',
    stock: 90,
  },
];

const TEST_USERS = [
  {
    email: 'alex@example.com',
    password: 'SecurePass@123',
    displayName: 'Alex Johnson',
    phone: '+91 9876543210',
  },
  {
    email: 'john@example.com',
    password: 'SecurePass@456',
    displayName: 'John Doe',
    phone: '+91 9876543211',
  },
];

// ============================================
// FUNCTIONS
// ============================================

async function populateProducts() {
  console.log('\n💊 Adding Medical Products...');
  try {
    for (const product of PRODUCTS) {
      await db.collection('products').doc(product.id).set({
        ...product,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✅ ${product.name}`);
    }
    console.log(`✨ Added ${PRODUCTS.length} medical products\n`);
  } catch (error) {
    console.error('❌ Error adding products:', error.message);
    throw error;
  }
}

async function populateUsers() {
  console.log('👤 Creating Test Users...');
  const userIds = [];

  try {
    for (const testUser of TEST_USERS) {
      try {
        const userRecord = await auth.createUser({
          email: testUser.email,
          password: testUser.password,
          displayName: testUser.displayName,
        });

        userIds.push(userRecord.uid);

        await db.collection('users').doc(userRecord.uid).set({
          id: userRecord.uid,
          name: testUser.displayName,
          email: testUser.email,
          phone: testUser.phone,
          avatar: '👤',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`  ✅ User: ${testUser.email} (UID: ${userRecord.uid})`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`  ⚠️  User ${testUser.email} already exists`);
          userIds.push('demo-' + testUser.email.split('@')[0]);
        } else {
          throw error;
        }
      }
    }
    console.log(`✨ Users ready\n`);
    return userIds;
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    throw error;
  }
}

async function populateUserData(userId, userData) {
  try {
    for (const addr of userData.addresses || []) {
      await db.collection('users').doc(userId).collection('addresses').doc(addr.id).set(addr);
    }
    for (const payment of userData.payments || []) {
      await db
        .collection('users')
        .doc(userId)
        .collection('paymentMethods')
        .doc(payment.id)
        .set(payment);
    }
    for (const order of userData.orders || []) {
      await db.collection('users').doc(userId).collection('orders').doc(order.id).set(order);
    }
    for (const notif of userData.notifications || []) {
      await db
        .collection('users')
        .doc(userId)
        .collection('notifications')
        .doc(notif.id)
        .set(notif);
    }
  } catch (error) {
    console.error('❌ Error populating user data:', error.message);
    throw error;
  }
}

async function populateUserSpecificData() {
  console.log('📍 Adding User Data (Addresses, Orders, Notifications)...');

  const alexData = {
    addresses: [
      {
        id: 'addr_001',
        type: 'home',
        name: 'Alex Johnson',
        address: 'Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102',
        phone: '+91 9876543210',
        isDefault: true,
      },
      {
        id: 'addr_002',
        type: 'work',
        name: 'Alex Johnson - Office',
        address: 'OnWay Health, 2nd Floor, Delta Tower, Koramangala, Bangalore - 560034',
        phone: '+91 9876543210',
        isDefault: false,
      },
    ],
    payments: [
      {
        id: 'pay_001',
        type: 'upi',
        label: 'Google Pay',
        details: '9876543210@okhdfcbank',
        icon: '📱',
        isDefault: true,
      },
      {
        id: 'pay_002',
        type: 'cards',
        label: 'HDFC Debit Card',
        details: '•••• •••• •••• 4532',
        icon: '💳',
        isDefault: false,
      },
    ],
    orders: [
      {
        id: 'order_001',
        title: 'Arrived in 10 minutes',
        price: 75,
        date: '19 Feb 2025',
        time: '8:30 pm',
        status: 'Arrived',
        deliveryTime: 10,
        items: [
          {
            productId: '1',
            name: 'Paracetamol 500mg',
            quantity: 2,
            price: 25,
            imageUrl:
              'https://res.cloudinary.com/dhjzybacp/image/upload/v1776356502/paracetamol_oxdkym.jpg',
          },
          {
            productId: '2',
            name: 'Dettol Hand Sanitizer 500ml',
            quantity: 1,
            price: 50,
            imageUrl:
              'https://res.cloudinary.com/dhjzybacp/image/upload/v1776356501/Hand_senitizer_aljpnf.jpg',
          },
        ],
        shippingAddress: {
          address: 'Apt 4B, HSR Layout, Bangalore - 560102',
          phone: '+91 9876543210',
        },
        paymentMethod: { type: 'upi', label: 'Google Pay' },
        subtotal: 100,
        deliveryFee: 0,
        taxes: 0,
        totalAmount: 100,
        supportContact: '1800-xxx-xxx',
      },
      {
        id: 'order_002',
        title: 'On its way to you',
        price: 155,
        date: '18 Feb 2025',
        time: '2:15 pm',
        status: 'In Transit',
        deliveryTime: 15,
        items: [
          {
            productId: '5',
            name: 'Vitamin C 500mg Tablets',
            quantity: 1,
            price: 35,
            imageUrl:
              'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&q=60',
          },
          {
            productId: '4',
            name: 'Cough Syrup 150ml',
            quantity: 1,
            price: 120,
            imageUrl:
              'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=500&q=60',
          },
        ],
        shippingAddress: {
          address: 'Apt 4B, HSR Layout, Bangalore - 560102',
          phone: '+91 9876543210',
        },
        paymentMethod: { type: 'cards', label: 'HDFC Debit Card' },
        subtotal: 155,
        deliveryFee: 0,
        taxes: 0,
        totalAmount: 155,
        supportContact: '1800-xxx-xxx',
      },
    ],
    notifications: [
      {
        id: 'notif_001',
        title: 'Your order has arrived',
        description: 'Order #order_001 has been delivered. Stay healthy!',
        type: 'order_update',
        icon: '📦',
        read: false,
        orderId: 'order_001',
      },
      {
        id: 'notif_002',
        title: 'Special offer on medicines',
        description: 'Get 20% off on all medicines today only!',
        type: 'promo',
        icon: '🎉',
        read: false,
      },
    ],
  };

  try {
    const users = await auth.listUsers(1);
    if (users.users.length > 0) {
      await populateUserData(users.users[0].uid, alexData);
      console.log(`  ✅ Added sample data for ${users.users[0].email}`);
    } else {
      console.log(`  ⚠️  No auth users found. Skipping user data.`);
    }
    console.log(`✨ User data added\n`);
  } catch (error) {
    console.error('❌ Error populating user data:', error.message);
  }
}

async function main() {
  console.log('\n🚀 ==========================================');
  console.log('   OnWay Medical — Firestore Populator');
  console.log('   ==========================================\n');

  try {
    console.log('🔗 Connecting to Firebase...\n');
    await db.collection('products').limit(1).get();
    console.log('✅ Firebase connection successful!\n');

    await populateProducts();
    await populateUsers();
    await populateUserSpecificData();

    console.log('✅ ==========================================');
    console.log('   Database Population Complete! 🎉');
    console.log('   ==========================================\n');
    console.log('📊 Summary:');
    console.log(`  • Medical Products: ${PRODUCTS.length} items`);
    console.log(`  • Test Users: ${TEST_USERS.length} created`);
    console.log('  • Addresses, Payments, Orders, Notifications: added\n');

    console.log('🔐 Test Credentials:');
    TEST_USERS.forEach((u) => {
      console.log(`  📧 ${u.email} / 🔑 ${u.password}`);
    });

    console.log('\n💡 Next Steps:');
    console.log('  1. Stop the current app (Ctrl+C)');
    console.log('  2. Start the app: npx expo start');
    console.log('  3. Login with test account and explore!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Population failed:', error.message);
    process.exit(1);
  }
}

main();
