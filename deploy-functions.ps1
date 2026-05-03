# Quick Firebase Functions Deployment with Service Account
# Run this PowerShell script to deploy functions

$project = "onway-bd6e4"
$region = "us-central1"

Write-Host "🚀 Deploying Cloud Functions..." -ForegroundColor Cyan

# Set environment variables for Razorpay credentials
$env:RAZORPAY_KEY_ID = "rzp_test_Shgq35vj7SGKmI"
$env:RAZORPAY_KEY_SECRET = "1K42iFgK0cUiYdaTDYHDhosK"

# Deploy createRazorpayOrder
Write-Host "`n📦 Deploying createRazorpayOrder..." -ForegroundColor Yellow
gcloud functions deploy createRazorpayOrder `
  --runtime nodejs18 `
  --trigger-http `
  --allow-unauthenticated `
  --source=functions `
  --entry-point=createRazorpayOrder `
  --set-env-vars RAZORPAY_KEY_ID=$env:RAZORPAY_KEY_ID,RAZORPAY_KEY_SECRET=$env:RAZORPAY_KEY_SECRET `
  --project=$project `
  --region=$region

# Deploy verifyPaymentSignature
Write-Host "`n📦 Deploying verifyPaymentSignature..." -ForegroundColor Yellow
gcloud functions deploy verifyPaymentSignature `
  --runtime nodejs18 `
  --trigger-http `
  --allow-unauthenticated `
  --source=functions `
  --entry-point=verifyPaymentSignature `
  --set-env-vars RAZORPAY_KEY_SECRET=$env:RAZORPAY_KEY_SECRET `
  --project=$project `
  --region=$region

# Deploy logPaymentFailure
Write-Host "`n📦 Deploying logPaymentFailure..." -ForegroundColor Yellow
gcloud functions deploy logPaymentFailure `
  --runtime nodejs18 `
  --trigger-http `
  --allow-unauthenticated `
  --source=functions `
  --entry-point=logPaymentFailure `
  --project=$project `
  --region=$region

Write-Host "`n✅ All functions deployed successfully!" -ForegroundColor Green
Write-Host "`n📌 Function URLs:" -ForegroundColor Cyan
Write-Host "  createRazorpayOrder: https://${region}-${project}.cloudfunctions.net/createRazorpayOrder"
Write-Host "  verifyPaymentSignature: https://${region}-${project}.cloudfunctions.net/verifyPaymentSignature"
Write-Host "  logPaymentFailure: https://${region}-${project}.cloudfunctions.net/logPaymentFailure"
