#!/bin/bash
# Quick Firebase Functions Deployment with Service Account

# Set the project
export GOOGLE_CLOUD_PROJECT=onway-bd6e4

# Deploy using gcloud with service account
gcloud functions deploy createRazorpayOrder \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source=functions \
  --entry-point=createRazorpayOrder \
  --set-env-vars RAZORPAY_KEY_ID=rzp_test_Shgq35vj7SGKmI,RAZORPAY_KEY_SECRET=1K42iFgK0cUiYdaTDYHDhosK \
  --project=onway-bd6e4

gcloud functions deploy verifyPaymentSignature \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source=functions \
  --entry-point=verifyPaymentSignature \
  --set-env-vars RAZORPAY_KEY_SECRET=1K42iFgK0cUiYdaTDYHDhosK \
  --project=onway-bd6e4

gcloud functions deploy logPaymentFailure \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --source=functions \
  --entry-point=logPaymentFailure \
  --project=onway-bd6e4

echo "✅ All functions deployed!"
