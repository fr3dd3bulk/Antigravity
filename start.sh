#!/bin/bash

# Antigravity Quick Start Script
# This script sets up and runs the entire Antigravity platform

set -e

echo "🚀 Antigravity - Quick Start"
echo "=============================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 LTS first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Start Docker services
echo "📦 Starting MongoDB and Redis..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 5

# Setup server
echo ""
echo "🔧 Setting up server..."
cd server

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
fi

echo "✅ Server setup complete"

# Setup client in background
echo ""
echo "🔧 Setting up client..."
cd ../client

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing client dependencies..."
    npm install
fi

echo "✅ Client setup complete"
echo ""

# Start servers
echo "🚀 Starting services..."
echo ""
echo "Starting server on http://localhost:3000"
echo "Starting client on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

cd ..

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $SERVER_PID $CLIENT_PID 2>/dev/null || true
    echo "✅ Services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start server
cd server
npm run dev &
SERVER_PID=$!

# Start client
cd ../client
npm run dev &
CLIENT_PID=$!

# Wait for both processes
wait
