#!/bin/bash
# Build script for n8n-nodes-shipstation
# Copyright (c) Velocity BPA, LLC

set -e

echo "🔨 Building n8n-nodes-shipstation..."

# Clean previous build
echo "📦 Cleaning previous build..."
rm -rf dist

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📥 Installing dependencies..."
  npm install
fi

# Run linting
echo "🔍 Running linter..."
npm run lint || echo "⚠️ Lint warnings found (continuing build)"

# Build TypeScript
echo "⚙️ Compiling TypeScript..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

echo "✅ Build complete!"
echo ""
echo "To install locally, run: ./scripts/install-local.sh"
