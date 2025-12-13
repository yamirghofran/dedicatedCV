#!/bin/bash

# Setup script for FastAPI backend

set -e

echo "🚀 Setting up FastAPI Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
else
    echo "✓ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
uv sync

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running. Please start Docker to use PostgreSQL."
    echo "   You can start it with: make docker-up"
else
    echo "🐳 Starting PostgreSQL with Docker..."
    docker-compose up -d

    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5

    # Run migrations
    echo "🔄 Running database migrations..."
    uv run alembic upgrade head
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  make run"
echo "  or"
echo "  uv run uvicorn app.main:app --reload"
echo ""
echo "API Documentation will be available at:"
echo "  http://localhost:8000/docs"
