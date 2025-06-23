#!/bin/bash

# Script de build pour Render
set -o errexit

echo "🚀 Starting Render build process..."

# Installer les dépendances
echo "📦 Installing dependencies..."
npm ci

# Build de l'application frontend
echo "🔨 Building frontend..."
npm run build

# Exécuter les migrations de base de données
echo "🗃️ Running database migrations..."
npm run db:push

echo "✅ Build completed successfully!"