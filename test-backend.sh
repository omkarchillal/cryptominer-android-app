#!/bin/bash

echo "🧪 Testing Backend Server..."
echo ""

# Test health endpoint
echo "1️⃣ Testing health endpoint..."
curl -s https://cryptominer-android-app.onrender.com/health
echo ""
echo ""

# Test ad-rewards status endpoint
echo "2️⃣ Testing ad-rewards status endpoint..."
curl -s https://cryptominer-android-app.onrender.com/api/ad-rewards/status/test-wallet
echo ""
echo ""

# Test ad-rewards claim endpoint
echo "3️⃣ Testing ad-rewards claim endpoint..."
curl -s -X POST https://cryptominer-android-app.onrender.com/api/ad-rewards/claim \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"test-wallet"}'
echo ""
echo ""

echo "✅ Backend tests complete!"
