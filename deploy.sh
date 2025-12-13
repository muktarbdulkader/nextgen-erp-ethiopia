#!/bin/bash

# MuktiAP Deployment Script
# This script helps deploy MuktiAP to production

echo "🚀 MuktiAP Deployment Script"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "❌ Error: server/.env file not found!"
    echo "Please create server/.env with your production configuration"
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd server && npm install && cd ..
echo "✅ Dependencies installed"
echo ""

# Build frontend
echo "🏗️  Building frontend..."
npm run build
echo "✅ Frontend built"
echo ""

# Push database schema
echo "🗄️  Pushing database schema..."
cd server
npx prisma db push --accept-data-loss
echo "✅ Database schema updated"
cd ..
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
echo "✅ Tests passed"
echo ""

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to your hosting service"
echo "2. Deploy frontend (dist folder) to your hosting service"
echo "3. Update CORS settings with your production domain"
echo "4. Test all features"
echo "5. Monitor for errors"
echo ""
echo "🎉 Good luck with your launch!"
