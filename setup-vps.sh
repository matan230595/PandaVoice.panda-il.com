#!/bin/bash
# PandaVoice VPS Setup Script
# Run this on your VPS as root

set -e

DOMAIN="pandavoice.panda-il.com"
APP_DIR="/var/www/$DOMAIN"
NODE_VERSION="22"

echo "=== PandaVoice VPS Setup ==="

# Install Node.js 22
if ! command -v node &> /dev/null; then
    echo "Installing Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
    pm2 startup
fi

# Create app directory
mkdir -p $APP_DIR
cd $APP_DIR

echo "=== Setup complete ==="
echo "Next steps:"
echo "1. Upload your project files to $APP_DIR"
echo "2. Create .env file with your configuration"
echo "3. Run: npm install"
echo "4. Run: npm run build:all"
echo "5. Run: npm run pm2:start"
