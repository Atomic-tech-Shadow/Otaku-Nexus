# Otaku App Mobile

Application mobile React Native avec Expo Go basée sur votre plateforme web Otaku.

## Configuration rapide

### 1. Installation d'Expo CLI
```bash
npm install -g @expo/cli
```

### 2. Installation des dépendances
```bash
cd mobile
npm install
```

### 3. Configuration de l'API
Modifiez l'URL de l'API dans `src/services/api.ts` :
```typescript
const API_BASE_URL = 'VOTRE_URL_SERVEUR/api';
```

### 4. Lancement de l'application
```bash
npm start
```

## Installation sur téléphone

### Android
1. Installez l'application "Expo Go" depuis le Google Play Store
2. Scannez le QR code affiché dans votre terminal
3. L'application se lancera automatiquement

### iOS
1. Installez l'application "Expo Go" depuis l'App Store
2. Scannez le QR code avec l'appareil photo de votre iPhone
3. Ouvrez le lien dans Expo Go

## Fonctionnalités

### ✅ Écrans disponibles
- **Authentification** : Connexion et inscription
- **Accueil** : Tableau de bord avec navigation rapide
- **Anime** : Liste des anime avec recherche et favoris
- **Quiz** : Système de quiz interactif avec timer
- **Profil** : Gestion du profil utilisateur et statistiques

### 📱 Fonctionnalités clés
- Authentification sécurisée avec JWT
- Gestion des favoris anime
- Système de quiz avec scoring XP
- Profil utilisateur avec niveaux
- Interface adaptative et moderne
- Navigation fluide entre écrans

## Structure du projet

```
mobile/
├── src/
│   ├── screens/          # Écrans de l'application
│   ├── services/         # Services API
│   ├── hooks/           # Hooks personnalisés
│   ├── types/           # Types TypeScript
│   └── components/      # Composants réutilisables
├── assets/              # Images et ressources
├── App.tsx             # Point d'entrée
└── package.json        # Dépendances
```

## Configuration avancée

### Variables d'environnement
Créez un fichier `.env` dans le dossier mobile :
```
API_BASE_URL=http://votre-serveur.com/api
```

### Icônes et splash screen
Remplacez les fichiers dans le dossier `assets/` :
- `icon.png` (1024x1024)
- `splash.png` (1284x2778)
- `adaptive-icon.png` (1024x1024)

## Déploiement

### Build de développement
```bash
expo build:android
expo build:ios
```

### Publication sur les stores
1. Configurez `app.json` avec vos informations
2. Utilisez `expo build` pour générer les APK/IPA
3. Soumettez aux stores respectifs

## Dépendances principales

- **React Native** : Framework mobile
- **Expo** : Plateforme de développement
- **React Navigation** : Navigation entre écrans
- **Expo Linear Gradient** : Dégradés visuels
- **AsyncStorage** : Stockage local
- **React Hook Form** : Gestion des formulaires

## Support

L'application est optimisée pour :
- Android 5.0+ (API niveau 21+)
- iOS 11.0+
- Expo SDK 49+

## Troubleshooting

### Erreurs de connexion API
- Vérifiez que votre serveur web fonctionne
- Assurez-vous que l'URL de l'API est correcte
- Testez les endpoints avec curl

### Problèmes d'installation
- Supprimez `node_modules` et relancez `npm install`
- Vérifiez que vous avez la dernière version d'Expo CLI
- Redémarrez le serveur Metro avec `npm start --clear`