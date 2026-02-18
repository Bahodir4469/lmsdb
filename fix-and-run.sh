#!/bin/bash
set -e

echo "Quick Fix: Running migrations in the existing container..."

SELECTED_COMPOSE_FILE="${COMPOSE_FILE:-docker-compose-secure.yml}"
if [ ! -f "$SELECTED_COMPOSE_FILE" ]; then
  SELECTED_COMPOSE_FILE="docker-compose.yml"
fi

compose() {
  docker compose -f "$SELECTED_COMPOSE_FILE" "$@"
}

# Stop the containers
compose down

# Start only the database
compose up -d db

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run migrations
echo "Running Prisma migrations..."
compose run --rm api npx prisma migrate deploy

# Start all services
echo "Starting all services..."
compose up -d

# Show logs
echo "Showing logs..."
compose logs -f api
