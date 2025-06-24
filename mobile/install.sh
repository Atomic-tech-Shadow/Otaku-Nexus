#!/bin/bash

echo "🚀 Installation de l'application mobile Otaku App"
echo "================================================"

# Vérification de Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérification de npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Node.js et npm détectés"

# Installation d'Expo CLI globalement
echo "📦 Installation d'Expo CLI..."
npm install -g @expo/cli

# Installation des dépendances du projet
echo "📦 Installation des dépendances du projet..."
npm install --force

# Création du fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier de configuration .env..."
    cat > .env << EOL
# Configuration de l'API
API_BASE_URL=http://localhost:5000/api

# Autres configurations
APP_NAME=Otaku App
APP_VERSION=1.0.0
EOL
    echo "✅ Fichier .env créé avec la configuration par défaut"
fi

echo ""
echo "🎉 Installation terminée!"
echo ""
echo "Pour lancer l'application:"
echo "  npm start"
echo ""
echo "Pour scanner le QR code:"
echo "  1. Installez 'Expo Go' sur votre téléphone"
echo "  2. Scannez le QR code qui apparaîtra"
echo "  3. L'app s'ouvrira automatiquement"
echo ""
echo "Configuration:"
echo "  - Modifiez l'URL de l'API dans .env si nécessaire"
echo "  - Assurez-vous que votre serveur web fonctionne"
echo ""