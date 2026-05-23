#!/bin/bash

# 🚀 Dokuzbes Startup Script
# Run this to start the entire platform

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎮 Dokuzbes - Digital Casino Platform"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Check if Docker is running
echo "✅ Step 1: Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi
echo "✅ Docker is running"

# Step 2: Setup environment files
echo ""
echo "✅ Step 2: Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file (Update with Agora & Stripe keys!)"
else
    echo "ℹ️  .env already exists"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env file"
else
    echo "ℹ️  backend/.env already exists"
fi

# Step 3: Start Docker containers
echo ""
echo "✅ Step 3: Starting Docker containers..."
docker-compose up -d
echo "⏳ Waiting for containers to be ready..."
sleep 5

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Docker containers are running:"
    docker-compose ps
else
    echo "❌ Failed to start containers"
    exit 1
fi

# Step 4: Check backend health
echo ""
echo "✅ Step 4: Checking backend health..."
sleep 2
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "OK"; then
    echo "✅ Backend is running on http://localhost:3000"
else
    echo "⏳ Backend starting up, please wait..."
fi

# Step 5: Backend dependencies
echo ""
echo "✅ Step 5: Installing backend dependencies..."
cd backend
if [ -d "node_modules" ]; then
    echo "ℹ️  node_modules already exists"
else
    npm install
fi
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup complete! Next steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 BEFORE RUNNING:"
echo "1. Update backend/.env with:"
echo "   - AGORA_APP_ID=your_app_id"
echo "   - AGORA_APP_CERTIFICATE=your_cert"
echo "   - STRIPE_SECRET_KEY=sk_test_..."
echo ""
echo "🖥️  Terminal 2 - Start Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "📱 Terminal 3 - Start Flutter:"
echo "   cd dokuzbes"
echo "   flutter pub get"
echo "   flutter run"
echo ""
echo "🧪 Test Health:"
echo "   curl http://localhost:3000/health"
echo ""
echo "📊 View Logs:"
echo "   docker-compose logs -f backend"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
