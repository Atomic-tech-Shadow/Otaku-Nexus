#!/bin/bash

# Script de build pour Render
set -e

echo "📦 Installation des dépendances..."
npm ci

echo "🏗️ Build de l'application..."
npm run build

echo "🗄️ Migration de la base de données..."
if [ "$DATABASE_URL" ]; then
    npm run db:push || echo "⚠️ Migration échouée, continuons..."
else
    echo "⚠️ DATABASE_URL non définie, migration ignorée"
fi

echo "✅ Build terminé avec succès!"