#!/usr/bin/env node

/**
 * Complete Firestore Database Populator Script
 * =============================================
 * Uploads all dummy data to Firebase:
 * - Products
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
const path = require('path');

// Initialize Firebase Admin SDK
try {
    if (!admin.apps.length) {
        // Using environment variable (Recommended)
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
// ALL DATA
// ============================================

const PRODUCTS = [
    { id: '1', name: 'Paracetamol', brand: 'GENERIC', category: 'medicines', price: 25, originalPrice: 25, rating: 4.0, reviews: 245, deliveryTime: 12, description: 'Effective pain reliever and fever reducer. Pack of 10 tablets.', warranty: '1 Year', returnDays: 7, imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/medicines/paracetamol.jpg', stock: 100 },
    { id: '2', name: 'Saras Milk', brand: 'SARAS', category: 'grocery', price: 26, originalPrice: 27, rating: 4.9, reviews: 892, deliveryTime: 15, description: 'Fresh and pure milk, 1 liter. Rich in calcium and vitamins.', warranty: null, returnDays: 3, imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/grocery/saras_milk.avif', stock: 150 },
    { id: '3', name: 'Hand Sanitizer Dettol', brand: 'DETTOL', category: 'beauty', price: 30, originalPrice: 30, rating: 4.5, reviews: 567, deliveryTime: 10, description: '99.9% germ protection. 500ml bottle.', warranty: null, returnDays: 14, imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/beauty/dettol_hand_sanitizer.jpg', stock: 200 },
    { id: '4', name: 'Bru Coffee', brand: 'BRU', category: 'grocery', price: 18.5, originalPrice: 22.0, rating: 4.7, reviews: 1203, deliveryTime: 18, description: 'Instant premium coffee powder. 100g pack.', warranty: null, returnDays: 7, imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/grocery/bru_coffee.jpg', stock: 180 },
    { id: '5', name: 'CMF Buds Pro 2', brand: 'NOTHING', category: 'electronics', price: 45.0, originalPrice: 59.0, rating: 4.6, reviews: 430, deliveryTime: 25, description: 'Wireless earbuds with active noise cancellation. 40-hour battery life.', warranty: '1 Year Warranty', returnDays: 14, imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/electronics/cmf_buds_pro_2.jpg', stock: 50 },
    { id: '6', name: 'Dot & Key 10% Vitamin C+E', brand: 'DOT & KEY', category: 'beauty', price: 24.0, originalPrice: 28.0, rating: 4.4, reviews: 789, deliveryTime: 14, description: 'Brightening vitamin C serum. 30ml bottle.', warranty: null, returnDays: 30, imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/beauty/dot_and_key_serum.jpg', stock: 75 },
    { id: '7', name: 'Red Bull Energy Drink', brand: 'RED BULL', category: 'grocery', price: 50.0, originalPrice: 55.0, rating: 4.3, reviews: 456, deliveryTime: 12, description: '250ml energy drink. Gives you wings!', warranty: null, returnDays: 3, imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/grocery/red_bull.avif', stock: 120 },
    { id: '8', name: 'Aspirin 500mg', brand: 'CIPLA', category: 'medicines', price: 20.0, originalPrice: 20.0, rating: 4.2, reviews: 198, deliveryTime: 12, description: 'Pain relief and fever reducer. Pack of 15 tablets.', warranty: null, returnDays: 7, imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/medicines/aspirin.jpg', stock: 110 },
];

const TEST_USERS = [
    { email: 'alex@example.com', password: 'SecurePass@123', displayName: 'Alex Johnson', phone: '+91 9876543210' },
    { email: 'john@example.com', password: 'SecurePass@456', displayName: 'John Doe', phone: '+91 9876543211' },
];

// ============================================
// FUNCTIONS
// ============================================

async function populateProducts() {
    console.log('\n📦 Adding Products...');
    try {
        for (const product of PRODUCTS) {
            await db.collection('products').doc(product.id).set(product);
            console.log(`  ✅ ${product.name}`);
        }
        console.log(`✨ Added ${PRODUCTS.length} products\n`);
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

                // Create user profile in Firestore
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
                    // Find and get the UID - we'll use placeholder for demo
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
        // Add addresses
        for (const addr of userData.addresses || []) {
            await db.collection('users').doc(userId).collection('addresses').doc(addr.id).set(addr);
        }

        // Add payment methods
        for (const payment of userData.payments || []) {
            await db.collection('users').doc(userId).collection('paymentMethods').doc(payment.id).set(payment);
        }

        // Add orders
        for (const order of userData.orders || []) {
            await db.collection('users').doc(userId).collection('orders').doc(order.id).set(order);
        }

        // Add notifications
        for (const notif of userData.notifications || []) {
            await db.collection('users').doc(userId).collection('notifications').doc(notif.id).set(notif);
        }
    } catch (error) {
        console.error('❌ Error populating user data:', error.message);
        throw error;
    }
}

async function populateUserSpecificData() {
    console.log('📍 Adding User Data (Addresses, Orders, Notifications)...');

    // Sample data for first user
    const alexData = {
        addresses: [
            { id: 'addr_001', type: 'home', name: 'Alex Johnson', address: 'Apt 4B, Silver Oak Residency, 5th Main, Sector 4, HSR Layout, Bangalore - 560102', phone: '+91 9876543210', isDefault: true },
            { id: 'addr_002', type: 'work', name: 'Alex Johnson - Office', address: 'Onway Tech Solutions, 2nd Floor, Delta Tower, Koramangala, Bangalore - 560034', phone: '+91 9876543210', isDefault: false },
        ],
        payments: [
            { id: 'pay_001', type: 'upi', label: 'Google Pay', details: '9876543210@okhdfcbank', icon: '📱', isDefault: true },
            { id: 'pay_002', type: 'cards', label: 'HDFC Debit Card', details: '•••• •••• •••• 4532', icon: '💳', isDefault: false },
        ],
        orders: [
            { id: 'order_001', title: 'Arrived in 10 minutes', price: 297, date: '19 Feb 2025', time: '8:30 pm', status: 'Arrived', deliveryTime: 10, items: [{ productId: '2', name: 'Saras Milk', quantity: 1, price: 26, imageUrl: 'https://res.cloudinary.com/dhjzybacp/image/upload/v1775672043/grocery/saras_milk.avif' }], shippingAddress: { address: 'Apt 4B, HSR Layout', phone: '+91 9876543210' }, paymentMethod: { type: 'upi', label: 'Google Pay' }, subtotal: 255, deliveryFee: 0, taxes: 42, totalAmount: 297 },
        ],
        notifications: [
            { id: 'notif_001', title: 'Your order has arrived', description: 'Order #order_001 has been delivered. Thank you!', type: 'order_update', icon: '📦', read: false, orderId: 'order_001' },
            { id: 'notif_002', title: 'Special offer', description: 'Get 20% off on medicines this weekend!', type: 'promo', icon: '🎉', read: false },
        ],
    };

    try {
        // Get the first auth user's UID or use a demo value
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
    console.log('   Firestore Database Complete Populator');
    console.log('   ==========================================\n');

    try {
        console.log('🔗 Connecting to Firebase...\n');
        await db.collection('products').limit(1).get();
        console.log('✅ Firebase connection successful!\n');

        // Populate everything
        await populateProducts();
        await populateUsers();
        await populateUserSpecificData();

        console.log('✅ ==========================================');
        console.log('   Database Population Complete! 🎉');
        console.log('   ==========================================\n');
        console.log('📊 Summary:');
        console.log(`  • Products: ${PRODUCTS.length} items`);
        console.log(`  • Test Users: ${TEST_USERS.length} created`);
        console.log('  • Addresses: Sample data added');
        console.log('  • Payments: Sample payment methods added');
        console.log('  • Orders: Sample orders added');
        console.log('  • Notifications: Sample notifications added\n');

        console.log('🔐 Test Credentials:');
        TEST_USERS.forEach(u => {
            console.log(`  📧 ${u.email} / 🔑 ${u.password}`);
        });

        console.log('\n💡 Next Steps:');
        console.log('  1. Stop the current app (Ctrl+C)');
        console.log('  2. Start the app: npm expo start');
        console.log('  3. Login with test account and explore!');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Population failed:', error.message);
        process.exit(1);
    }
}

main();