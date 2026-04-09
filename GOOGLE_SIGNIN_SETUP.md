# Google Sign-In Setup Guide

## Overview
Google OAuth authentication has been integrated into the login and signup pages. Follow these steps to complete the setup.

## Required Steps

### 1. Get Your Web Client ID from Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **onway-f5999**
3. Navigate to **APIs & Services** → **Credentials**
4. Find or create an **OAuth 2.0 Client ID** for your application type:
   - For Web: `onway-f5999`
   - For Android/iOS: Each platform may need separate client IDs
5. Copy the **Web Client ID** (format: `{number}-{hash}.apps.googleusercontent.com`)

### 2. Update AuthContext Configuration

In `context/AuthContext.tsx`, line ~52, update the webClientId:

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // Replace with your actual Web Client ID
});
```

### 3. Android-Specific Setup (if using Android)

1. Generate your app's SHA-1 fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```

2. Add the SHA-1 fingerprint to your Android OAuth 2.0 Client ID in Google Cloud Console

3. Add to `android/app/build.gradle`:
   ```gradle
   dependencies {
       implementation 'com.google.android.gms:play-services-auth:20.6.0'
   }
   ```

### 4. iOS-Specific Setup (if using iOS)

1. In Google Cloud Console, add your iOS app's Bundle ID to the OAuth client
2. Add the custom URL scheme to your app
3. Update `ios/Onway/Info.plist` with:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
       <dict>
           <key>CFBundleURLSchemes</key>
           <array>
               <string>com.googleusercontent.apps.{appid}.apps.googleusercontent.com</string>
           </array>
       </dict>
   </array>
   ```

### 5. Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **onway-f5999**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** provider

## Testing

After configuration:

1. Start your development server: `npm start`
2. Try the "Continue with Google" button on login/signup
3. You should see the Google Sign-In popup/dialog
4. Upon successful authentication, user data is automatically saved to Firestore

## Features Implemented

- ✅ Google OAuth 2.0 integration
- ✅ Automatic user profile creation in Firestore
- ✅ User avatar from Google account
- ✅ Error handling for common issues
- ✅ Loading states during authentication
- ✅ Redirect to profile page on successful login

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Google Play Services not available" | On Android, ensure Google Play Services is installed |
| "Sign in cancelled" | User cancelled the Google Sign-In dialog |
| "Invalid Web Client ID" | Verify the webClientId is correct in AuthContext |
| User not found in Firestore | Check that Firebase Firestore rules allow write access to `users/{uid}` |

## Important Notes

- Users signing in via Google do not need to enter phone number (optional for Google signin)
- Google profile picture is automatically saved as avatar
- If user already exists, their profile is updated with new avatar
- The app automatically handles both iOS and Android platforms

## Files Modified

- `context/AuthContext.tsx` - Added Google Sign-In logic
- `app/login.tsx` - Added Google login button handler
- `app/signup.tsx` - Added Google signup button handler
