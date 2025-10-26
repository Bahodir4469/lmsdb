#!/bin/bash

echo "🔧 Quick Fix: Running migrations in the existing container..."

# Stop the containers
docker compose down

# Start only the database
docker compose up -d db

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run migrations
echo "📦 Running Prisma migrations..."
docker compose run --rm api npx prisma migrate deploy

# Start all services
echo "🚀 Starting all services..."
docker compose up -d

# Show logs
echo "📋 Showing logs..."
docker compose logs -f api
