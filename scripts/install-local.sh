#!/bin/bash
# Local installation script for n8n-nodes-shipstation
# Copyright (c) Velocity BPA, LLC

set -e

echo "📦 Installing n8n-nodes-shipstation locally..."

# Determine n8n custom nodes directory
N8N_CUSTOM_DIR="${N8N_CUSTOM_EXTENSIONS:-$HOME/.n8n/custom}"

# Check if build exists
if [ ! -d "dist" ]; then
  echo "❌ Build not found. Running build first..."
  ./scripts/build.sh
fi

# Create custom nodes directory if it doesn't exist
mkdir -p "$N8N_CUSTOM_DIR"

# Create symbolic link or copy
if [ "$1" == "--link" ]; then
  echo "🔗 Creating symbolic link..."
  ln -sf "$(pwd)" "$N8N_CUSTOM_DIR/n8n-nodes-shipstation"
else
  echo "📁 Copying to n8n custom directory..."
  cp -r . "$N8N_CUSTOM_DIR/n8n-nodes-shipstation"
fi

echo "✅ Installation complete!"
echo ""
echo "📍 Installed to: $N8N_CUSTOM_DIR/n8n-nodes-shipstation"
echo ""
echo "🔄 Restart n8n to load the new node."
echo ""
echo "Options:"
echo "  --link  Create symbolic link instead of copying (useful for development)"
