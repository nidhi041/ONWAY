# 🔐 Fix Firebase Deployment Permission Issue

## Problem
Your account `arunprajapat629@gmail.com` doesn't have permission to deploy to Firebase project `onway-bd6e4`.

## Solution: Add Your Account to Firebase Project

### Step-by-Step Guide:

#### 1. Go to Firebase Console
🔗 https://console.firebase.google.com/

#### 2. Select Project
- Click on **onway-bd6e4** in the projects list

#### 3. Go to Project Settings
- Click ⚙️ **Settings icon** (gear icon) in top-right
- Click **Project settings**

#### 4. Go to Members Tab
- Click on **Members** tab at the top

#### 5. Add Your Email
- Click **+ Add member** button
- Enter: `arunprajapat629@gmail.com`
- Select role: **Owner** or **Editor**
- Click **Add member**

#### 6. Wait for Approval
- Wait ~5 minutes for permissions to propagate
- You might need to log out and log back in to Firebase CLI

#### 7. Try Deployment Again
```powershell
firebase deploy --only functions
```

---

## Alternative: Invite as Viewer First

If "Owner" role is restricted, try:
1. Invite as **Editor** first
2. Then upgrade to **Owner** after

---

## After Adding Permissions:

Once your account is added, run:

```bash
# Log out and log back in
firebase logout
firebase login

# Deploy functions
firebase deploy --only functions
```

---

## Verify Permissions

Check if you have access:

```bash
firebase projects:list
```

You should see `onway-bd6e4` in the list.

---

## For Project Owner

If you're not the project owner, contact the person who created the Firebase project `onway-bd6e4` and ask them to:
1. Go to Project Settings → Members
2. Add your email with Owner or Editor role
3. Then you can deploy

---

## Once Permissions Are Fixed

Run this to deploy:

```bash
cd C:\Users\Arun kumar\Desktop\velzo\onway\ONWAY
firebase deploy --only functions
```

Functions will be deployed to:
- ✅ createRazorpayOrder
- ✅ verifyPaymentSignature
- ✅ logPaymentFailure

---

**Need help?** The Firebase Console UI is self-explanatory. Just look for the Settings gear icon in the top-right of https://console.firebase.google.com/project/onway-bd6e4
