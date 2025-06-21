# Otaku Nexus Mobile App

Application mobile React Native Expo complète synchronisée avec le site web Otaku Nexus.

## 🚀 Fonctionnalités Implémentées

### ✅ Pages Principales
- **Accueil** - Dashboard avec statistiques utilisateur et actions rapides
- **Anime-Sama** - Recherche et streaming d'animes avec API authentique
- **Quiz Otaku** - Quiz interactifs avec système de points XP
- **Chat Communauté** - Chat temps réel entre utilisateurs
- **Profil** - Gestion du profil utilisateur et statistiques

### ✅ Fonctionnalités Avancées
- **Navigation complète** - Navigation par onglets et navigation par pile
- **Authentification** - Connexion/Inscription avec mode démo
- **API Synchronisée** - Toutes les APIs du site web sont accessibles
- **Interface Native** - Design mobile optimisé avec animations
- **Gestion d'état** - React Query pour la gestion des données

### ✅ Intégration Anime-Sama
- Recherche d'animes en temps réel
- Détails complets des animes avec saisons et épisodes
- Sélection de langue (VF/VOSTFR)
- Navigation vers le lecteur vidéo
- Interface authentique reproduisant anime-sama.fr

## 🛠 Architecture Technique

### Structure des fichiers
```
mobile/
├── src/
│   ├── components/          # Composants réutilisables
│   │   └── AppWrapper.tsx   # Navigation principale
│   ├── screens/             # Écrans de l'application
│   │   ├── HomeScreen.tsx
│   │   ├── AnimeSamaScreen.tsx
│   │   ├── AnimeDetailScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── AuthScreen.tsx
│   ├── services/            # Services et utilitaires
│   │   └── queryClient.ts
│   └── types/               # Types TypeScript
├── App.tsx                  # Point d'entrée principal
└── package.json
```

### Technologies utilisées
- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **React Navigation** - Navigation native
- **React Query** - Gestion d'état et cache
- **LinearGradient** - Dégradés visuels
- **AsyncStorage** - Stockage local
- **TypeScript** - Typage statique

## 🎨 Design et UX

### Thème visuel
- **Couleurs principales** : Noir (#000), Bleu cyan (#00D4FF), dégradés
- **Typographie** : Police système optimisée pour mobile
- **Animations** : Transitions fluides avec Framer Motion
- **Interface** : Design sombre optimisé pour l'expérience anime

### Responsive Design
- Adaptation automatique aux différentes tailles d'écran
- Interface tactile optimisée
- Navigation intuitive par gestes
- Chargement progressif du contenu

## 🔗 Synchronisation avec le Web

### APIs partagées
- `/api/user/stats` - Statistiques utilisateur
- `/api/quizzes` - Liste des quiz
- `/api/chat/messages` - Messages du chat
- `/api/auth/*` - Authentification
- API Anime-Sama externe pour les animes

### Fonctionnalités synchronisées
- Système de points XP identique
- Base de données partagée
- Sessions utilisateur communes
- Chat temps réel partagé

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+
- Expo CLI
- Simulateur iOS/Android ou appareil physique

### Commandes
```bash
cd mobile
npm install
npm start          # Démarrer le serveur de développement
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
```

## 📱 Fonctionnalités Mobile Spécifiques

### Navigation native
- Onglets en bas d'écran
- Navigation par pile pour les détails
- Boutons de retour natifs
- Animations de transition

### Expérience tactile
- Boutons optimisés pour le tactile
- Scroll fluide et naturel
- Feedback visuel sur les interactions
- Clavier virtuel adaptatif

### Performance
- Chargement différé des images
- Cache intelligent des données
- Optimisation mémoire
- Animations 60fps

## 🔧 Configuration

### Variables d'environnement
L'application se connecte automatiquement au serveur web :
- Développement : `http://localhost:5000`
- Production : URL du serveur déployé

### Personnalisation
- Couleurs dans les composants StyleSheet
- Tailles d'écran dans Dimensions
- Configuration navigation dans AppWrapper

## 📈 Prochaines fonctionnalités

- Notifications push
- Mode hors ligne
- Partage social
- Thèmes personnalisables
- Lecteur vidéo intégré
- Synchronisation favoris
- Système de badges

L'application mobile est maintenant complètement fonctionnelle et synchronisée avec toutes les fonctionnalités du site web.