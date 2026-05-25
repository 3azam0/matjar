#!/bin/bash

# Exit immediately if any command fails
set -e

# Function to display usage
usage() {
  echo "Usage: $0 [preview|production]"
  echo "  preview     - Build and deploy to the preview branch (main)"
  echo "  production  - Build and deploy to the production branch (production)"
  exit 1
}

# Check argument
ENV=${1:-production}

if [ "$ENV" != "preview" ] && [ "$ENV" != "production" ]; then
  usage
fi

# Determine target branch
BRANCH="production"
if [ "$ENV" == "preview" ]; then
  BRANCH="main"
fi

echo "🚀 Starting deployment to environment: $ENV (Branch: $BRANCH)..."

# 1. Build the project
echo "📦 Building the project..."
npm run build

# 2. Deploy to Cloudflare Pages
echo "☁️ Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name al-bayt-al-khaliji --branch "$BRANCH"

echo "✨ Deployment successfully completed!"
