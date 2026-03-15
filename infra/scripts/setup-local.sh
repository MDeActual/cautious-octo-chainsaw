#!/usr/bin/env bash
# CloudMatrix MSSP Platform - Local Development Setup Script
set -e

echo "============================================"
echo " CloudMatrix Local Development Setup"
echo "============================================"

# Check prerequisites
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "ERROR: $1 is required but not installed."
    exit 1
  fi
  echo "✓ $1 found"
}

echo ""
echo "Checking prerequisites..."
check_command node
check_command pnpm
check_command psql

# Check Node version
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "ERROR: Node.js 20+ is required. Current version: $(node --version)"
  exit 1
fi
echo "✓ Node.js $(node --version)"

# Check pnpm version
PNPM_VERSION=$(pnpm --version | cut -d. -f1)
if [ "$PNPM_VERSION" -lt 8 ]; then
  echo "ERROR: pnpm 8+ is required. Current version: $(pnpm --version)"
  exit 1
fi
echo "✓ pnpm $(pnpm --version)"

echo ""
echo "Installing dependencies..."
pnpm install

# Set up .env if it doesn't exist
if [ ! -f .env ]; then
  echo ""
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "✓ .env created - please edit it with your configuration"
else
  echo "✓ .env already exists"
fi

# Load .env
if [ -f .env ]; then
  set -a
  # shellcheck source=.env
  source .env
  set +a
fi

# Create local database if DATABASE_URL is set to localhost
if [[ "${DATABASE_URL:-}" == *"localhost"* ]]; then
  DB_NAME=$(echo "$DATABASE_URL" | sed 's/.*\///')
  echo ""
  echo "Setting up local PostgreSQL database: $DB_NAME..."
  
  if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✓ Database '$DB_NAME' already exists"
  else
    createdb "$DB_NAME" && echo "✓ Database '$DB_NAME' created"
  fi
fi

echo ""
echo "Running database migrations..."
pnpm migrate:up

echo ""
echo "============================================"
echo " Setup complete!"
echo "============================================"
echo ""
echo "Start development servers with:"
echo "  pnpm dev"
echo ""
echo "Access the application at:"
echo "  Frontend:         http://localhost:5173"
echo "  Identity Service: http://localhost:3001"
echo "  Graph Proxy:      http://localhost:3002"
echo "  Core Backend:     http://localhost:3003"
echo "  Automation:       http://localhost:3004"
echo "  AI Service:       http://localhost:3005"
echo ""
