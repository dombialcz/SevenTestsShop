#!/bin/bash

# Docker-based Playwright Visual Test Runner
# Ensures consistent screenshot generation across all environments

# Extract Playwright version from installed package
PW_VERSION=$(cd frontend && npx playwright -V | awk '{print $NF}')

# Ubuntu version - use 'noble' for Ubuntu 24.04, 'jammy' for 22.04
UBUNTU_VERSION='noble'

echo "🎭 Running Playwright Visual Tests in Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Playwright version: $PW_VERSION"
echo "🐧 Ubuntu version: $UBUNTU_VERSION"
echo "🌐 Mock server: http://localhost:9999"
echo "⚛️  React app: http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Navigate to frontend directory
cd frontend

# Run Playwright tests in official Docker container
docker run \
  -v "$PWD":/workspace \
  --network=host \
  -w /workspace \
  -it \
  --rm \
  --ipc=host \
  mcr.microsoft.com/playwright:v${PW_VERSION}-${UBUNTU_VERSION} \
  /bin/bash -c "npm install && npx playwright install chromium && npx playwright test --config=playwright.visual.config.ts $*"

echo ""
echo "✅ Visual tests complete!"
echo "📊 View report: npm run test:visual:report"
