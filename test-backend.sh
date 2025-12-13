#!/bin/bash

echo "🧪 Testing Backend Server..."
echo ""

# Test health endpoint
echo "1️⃣ Testing health endpoint..."
curl -s http://localhost:3000/health
echo ""
echo ""

# Test ad-rewards status endpoint
echo "2️⃣ Testing ad-rewards status endpoint..."
curl -s http://localhost:3000/api/ad-rewards/status/test-wallet
echo ""
echo ""

# Test ad-rewards claim endpoint
echo "3️⃣ Testing ad-rewards claim endpoint..."
curl -s -X POST http://localhost:3000/api/ad-rewards/claim \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"test-wallet"}'
echo ""
echo ""

echo "✅ Backend tests complete!"
