# OnWay Architecture & Data Flow

## 1. How Frontend and Backend are Connected

In OnWay, the architecture primarily follows a **Serverless / BaaS (Backend-as-a-Service)** model rather than a traditional REST API monolith.

- **Direct Database Connection (Firebase SDK):** The frontend (React Native / Expo) connects directly to the database (Firestore) using the Firebase Client SDK (`firebase.ts`). This is used for product listings, cart updates, and user profiles. You bypass writing standard backend APIs for typical CRUD (Create, Read, Update, Delete) operations.
- **Cloud Functions for Sensitive Logic:** For operations that cannot be trusted to the client—specifically **Razorpay payment processing**—the frontend calls Firebase Cloud Functions via HTTP requests (`fetch`). In `razorpayService.ts`, the frontend makes `POST` requests to endpoints like `.../createRazorpayOrder` to generate a secure payment token.
- **Authentication State:** User connection is handled by Firebase Auth. The frontend listens to auth state changes (`onAuthStateChanged` in `AuthContext`), and when a session is verified, it uses the generated `uid` to secure database reads/writes.

---

## 2. API Flow and Database Usage

### API Flow (Example: Checkout & Payment)
1. The user selects items and proceeds to checkout.
2. If Cash on Delivery (COD) is chosen, the frontend acts directly: it writes the order to Firestore (`setDoc` in `ordersService.ts`) and clears the cart. 
3. If an online payment is chosen, `razorpayService.ts` makes an HTTP call to the Cloud Function `createRazorpayOrder`. The Function securely talks to Razorpay's servers, generates an `orderId`, and returns it to the app. 
4. The frontend opens the Razorpay gateway. Upon success, it calls another function (`verifyPaymentSignature`) to confirm the hash before finally writing the confirmed order to Firestore. *(Note: Currently, `TEST_MODE = true` is enabled in `razorpayService.ts`, returning fake tokens locally to bypass this flow).*

### Database Usage (NoSQL Structure)
According to the `FIREBASE_DATA_SCHEMA.md`, the database relies heavily on **Subcollections** to chunk data securely:
- **Global Data**: The `/products` collection is kept public (read-only) for the storefront.
- **User-scoping**: Everything else lives under `/users/{uid}/...`. For instance, `/users/{uid}/orders`, `/users/{uid}/addresses`, and `/users/{uid}/cart`. 
- **Real-time Sync**: The app heavily uses Firestore's `onSnapshot()` listeners (e.g., in `CartContext.tsx` and `OrdersContext.tsx`). This means the moment an order status changes on the backend (or cart items update), the new data is automatically pushed to the app without needing to conventionally "refresh" or "poll" an API.

---

## 3. Identified Performance Issues

1. **Unoptimized Images:** In `app/(tabs)/index.tsx`, standard React Native `Image` (`RNImage`) is used instead of the advanced `Image` component from `expo-image`. Given that an e-commerce app is highly visual, `RNImage` will struggle with caching and memory management on large lists.
2. **FlatList Bottlenecks:** The trending and best-seller lists use horizontal `FlatList` components. However, they lack performance props like `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, and `removeClippedSubviews`. Without these, long lists will cause heavy memory overhead and frame drops.
3. **Context Re-render Traps:** You are using React Context (`CartContext`, `OrdersContext`) to manage complex, deeply nested state. In React, whenever a Context value updates (e.g. quantity changes), *every single component* consuming that context completely re-renders. As the app scales, this will cause significant UI lag.
4. **Full Page Loading Spinners:** When `allProducts` are loading, `index.tsx` blocks the entire screen with an `ActivityIndicator`. This is perceived by users as slow compared to modern Skeleton loading screens.

---

## 4. Suggested Improvements (Modern Best Practices)

1. **State Management Migration:** Consider shifting from Context API to **Zustand** or **Redux Toolkit**. Zustand is exceptionally lightweight, doesn't require `<Provider>` wrapping, and allows components to subscribe to *slices* of state (e.g., only updating the checkout button when total price changes, rather than the whole screen).
2. **Implement Data Fetching & Caching (React Query):** Right now, custom hooks and context (`useProducts`, `CartContext`) manage loading states manually. Wrapping your Firebase fetches in **TanStack React Query** will instantly give you automated background caching, optimistic UI updates, and retry logic without boilerplate.
3. **Upgrade Image Rendering:** Immediately replace all `import { Image } from 'react-native'` with `import { Image } from 'expo-image'`. Expo Image utilizes Glide on Android and SDWebImage on iOS, providing massive speed boosts, memory efficiency, and blur-hash placeholders.
4. **Optimize Firestore Reads:** Your app sets up real-time `onSnapshot` listeners for almost everything. Since Firebase bills per read, if 1,000 users open the app and listen to their carts, that's thousands of reads. You should only use real-time listeners for data that *must* update instantly (like Active Order Tracking) and use standard asynchronous fetching (`getDocs`) for static data like past orders.
5. **Address the Mock Data Tech-Debt:** Move `MOCK_ADDRESSES` and `MOCK_CATEGORIES` into the Firebase database to ensure you can update delivery regions and app categories from a database without submitting an application update to Apple/Google.
