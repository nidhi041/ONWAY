# Google OAuth Setup Guide - Expo Auth Session

## Overview
Google OAuth has been integrated using **expo-auth-session**, which is compatible with Expo Go and doesn't require native compilation.

## Quick Setup Steps

### 1. Get Your Google OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select the **onway-f5999** project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**

### 2. Configure OAuth Consent Screen (if not done)

1. Go to **OAuth consent screen** tab
2. Fill in:
   - **App name**: OnWay
   - **User support email**: Your email
   - **Developer contact**: Your email
3. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
4. Click Save

### 3. Create Web Application Credentials

1. Click **Create Credentials** → **OAuth 2.0 Client ID**
2. Choose **Web application**
3. Add Authorized redirect URIs:
   ```
   http://localhost:8081
   http://localhost:8082
   exp://localhost:8081
   exp://localhost:8082
   ```
   (Add for all ports your app uses)
4. Click **Create**
5. Copy the **Client ID** (format: `xxx-xxx.apps.googleusercontent.com`)

### 4. Update Your App Configuration

In `context/AuthContext.tsx`, find this line (around line 60):

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // ← Update this
  redirectUrl: Google.getRedirectUrl(),
});
```

Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID.

### 5. Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **onway-f5999** project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** provider
5. Add your OAuth Client ID if prompted

## Testing

### On Web
```bash
npm start
# Press 'w' to open web
```

### On Mobile (Expo Go)
```bash
npm start
# Scan QR code with Expo Go (Android or iOS)
```

## Files Modified

- ✅ `config/firebase.ts` - Added AsyncStorage persistence
- ✅ `context/AuthContext.tsx` - Replaced with expo-auth-session
- ✅ `app/login.tsx` - Already configured
- ✅ `app/signup.tsx` - Already configured
- ✅ `app.json` - Added OAuth schemes

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Sign-In cancelled" | User tapped cancel in Google Sign-In dialog - try again |
| "No HTTP client available error" | Make sure `expo-web-browser` is installed |
| Client ID not found | Verify the Client ID format and update in AuthContext |
| "Redirect URI mismatch" | Add all localhost/exp:// URIs to Google Console |
| App crashes on sign-in | Check browser console for detailed error messages |

## Advantages of Expo Auth Session

✅ Works with Expo Go (no build required)  
✅ No native module compilation  
✅ Web browser-based OAuth flow  
✅ Cross-platform support (iOS, Android, Web)  
✅ Automatic token management  

## Next Steps

1. Update Client ID in `context/AuthContext.tsx`
2. Test the "Continue with Google" button
3. Verify user is created in Firestore
4. Check Firebase Auth shows new user
