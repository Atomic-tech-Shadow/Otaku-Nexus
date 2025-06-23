#!/bin/bash

# Build script for Render deployment
echo "Starting build process for Otaku Nexus..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Build the application
echo "Building application..."
npm run build

echo "Build completed successfully!"