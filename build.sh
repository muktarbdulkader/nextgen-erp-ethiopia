#!/bin/bash
set -e

echo "🔨 Building frontend..."
npm install
npm run build

echo "🔨 Building backend..."
cd server
npm install
npx prisma db push
cd ..

echo "✅ Build complete!"
