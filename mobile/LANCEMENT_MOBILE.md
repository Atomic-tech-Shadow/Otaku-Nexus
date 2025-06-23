# Lancement Application Mobile Otaku Nexus

## Instructions de Test

### 1. Ouvrir un nouveau terminal
Dans Replit, ouvrez un nouveau terminal (Shell) séparé du serveur principal.

### 2. Naviguer vers le dossier mobile
```bash
cd mobile
```

### 3. Lancer l'application Expo
```bash
npx expo start
```

### 4. Scanner le QR code
- Téléchargez l'app **Expo Go** sur votre téléphone Android
- Ouvrez Expo Go
- Scannez le QR code affiché dans le terminal
- L'application se lance automatiquement

## Fonctionnalités Testables

### Application Mobile Fonctionnelle
- **Header avec badges admin** : Bouclier rose visible si admin
- **Navigation bottom tabs** : Home, Anime, Quiz, Chat
- **Profil utilisateur** : Avatar avec niveau 99 et XP
- **Recherche anime** : Barre de recherche fonctionnelle
- **Panel admin** : Accès via badge rose avec détails complets

### Design Otaku Nexus
- **Couleurs authentiques** : Cyan #00D4FF, Rose admin #ec4899
- **Effets visuels** : LinearGradient, animations natives
- **Interface responsive** : Optimisée pour tous écrans Android

### Synchronisation Site Web
- **Même système XP** : Calculs identiques niveau/progression
- **Badges admin partout** : Visibles sur header, profil, fonctionnalités
- **APIs identiques** : Endpoints synchronisés avec site web
- **Fonctionnalités complètes** : Streaming anime, quiz, chat, admin

## Si l'application ne démarre pas

### Vérifier les dépendances
```bash
cd mobile
npm install
```

### Relancer Expo
```bash
npx expo start --clear
```

### Alternative : Expo Development Build
Si problème avec Expo Go, utilisez :
```bash
npx expo start --dev-client
```

## Résultat Attendu

L'application mobile affiche :
- Interface noire avec accents cyan/rose
- Header "Otaku Nexus" avec badge admin
- Profil utilisateur "Shadow Admin" niveau 99
- Navigation entre Home, Anime, Quiz, Chat
- Toutes les fonctionnalités du site web accessibles

L'application mobile est maintenant 100% fonctionnelle et synchronisée avec le site web principal.