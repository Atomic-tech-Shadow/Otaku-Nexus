# Guide d'Utilisation - Application Mobile Otaku Nexus

## 🚀 Démarrage de l'Application

### Installation et Lancement
```bash
# Installation des dépendances
cd mobile
npm install

# Lancement avec Expo Go
npx expo start
```

### Scan du QR Code
1. Ouvrir Expo Go sur votre téléphone Android
2. Scanner le QR code affiché dans le terminal
3. L'application se lance automatiquement

## 📱 Navigation et Interface

### Header Principal (AppHeader)
- **Avatar utilisateur** : Initiales avec niveau affiché
- **Barre XP** : Progression vers le niveau suivant
- **Badge Admin** : Bouclier rose pour accès panel admin (si admin)
- **Notifications** : Cloche avec indicateur rouge
- **Bouton retour** : Contextuel selon la page

### Navigation Bottom Tabs
- **Home** : Dashboard avec statistiques personnelles
- **Quiz** : Liste des quiz disponibles et leaderboard
- **Chat** : Messages communauté en temps réel
- **Profile** : Profil utilisateur et paramètres

### Navigation Stack (Anime)
- **AnimeSama** : Catalogue complet d'animes
- **Détails Anime** : Saisons et épisodes disponibles
- **Lecteur Vidéo** : Ouverture dans navigateur externe

## 🎯 Fonctionnalités Principales

### 1. Système Authentification
- **Inscription** : Email, nom, prénom, mot de passe
- **Connexion** : Email et mot de passe persistants
- **Déconnexion** : Bouton dans header ou profil

### 2. Dashboard Home
- **Statistiques personnelles** : XP total, niveau, rang
- **Quiz récents** : Derniers quiz complétés
- **Accès rapide** : Liens vers fonctionnalités principales
- **Badge admin** : Section dédiée si administrateur

### 3. Streaming AnimeSama
- **Catalogue complet** : Liste tous les animes disponibles
- **Recherche avancée** : Par titre, genre, année
- **Détails anime** : Synopsis, genres, statut
- **Sélection épisodes** : Saisons organisées avec langues VF/VOSTFR
- **Correction One Piece** : Numérotation exacte (Saga 11 = épisodes 1087-1122)
- **Lecteur intégré** : Ouverture automatique dans navigateur

### 4. Système Quiz
- **Liste quiz** : Triés par difficulté et catégorie
- **Quiz interactif** : Questions à choix multiples
- **Système XP** : Récompenses basées sur performance
- **Leaderboard** : Classement global des utilisateurs
- **Historique** : Quiz complétés avec scores

### 5. Chat Communauté
- **Messages temps réel** : WebSocket pour instantané
- **Badges administrateur** : Identification claire des admins
- **Historique** : Messages persistants
- **Modération** : Outils admin intégrés

### 6. Profil Utilisateur
- **Informations personnelles** : Nom, email, avatar
- **Statistiques** : Niveau, XP, quiz complétés
- **Modification profil** : Mise à jour des données
- **Paramètres** : Préférences application

## 🛡️ Panel Administrateur

### Accès Admin
- **Badge header** : Bouclier rose cliquable
- **Vérification permissions** : Contrôle automatique isAdmin
- **Interface dédiée** : Page admin complète

### Fonctionnalités Admin
1. **Dashboard Statistiques**
   - Utilisateurs totaux et actifs
   - Quiz créés et complétés
   - Messages échangés
   - XP total distribué

2. **Gestion Posts**
   - Création nouveaux posts
   - Édition posts existants
   - Publication/brouillon
   - Restriction admin only

3. **Gestion Quiz**
   - Création quiz complets
   - Questions multiples avec explications
   - Configuration difficulté et XP
   - Catégories (anime, manga, gaming)

4. **Gestion Utilisateurs**
   - Liste tous les utilisateurs
   - Modification rôles (admin/user)
   - Bannissement temporaire
   - Statistiques individuelles

## 🎨 Design et Couleurs

### Palette Otaku Nexus
- **Cyan** (#00D4FF) : Couleur principale
- **Purple** (#a855f7) : Couleur secondaire
- **Rose** (#ec4899) : Badge admin
- **Noir** (#000000) : Arrière-plan
- **Bleu** (#1e40af) : Surfaces

### Effets Visuels
- **LinearGradient** : Dégradés fluides
- **Animations** : Transitions natives
- **Feedback tactile** : TouchableOpacity optimisé
- **Glass-morphism** : Effets transparence

## 🔧 APIs et Synchronisation

### Endpoints Utilisés
```
Base URL: https://[your-app].replit.app

Authentification:
POST /api/auth/login
POST /api/auth/register
GET /api/auth/user

AnimeSama:
GET /api/anime-sama/trending
GET /api/anime-sama/search?q={query}
GET /api/anime-sama/anime/{id}
GET /api/anime-sama/episodes/{animeId}/{season}

Quiz & Community:
GET /api/quizzes/featured
GET /api/chat/messages
POST /api/chat/messages

Administration:
GET /api/admin/stats
GET /api/admin/posts
POST /api/admin/posts
GET /api/admin/users
PUT /api/admin/users/{id}
```

### Gestion Erreurs
- **Retry automatique** : 3 tentatives avec délai croissant
- **Fallbacks intelligents** : Basculement VF/VOSTFR
- **Cache optimisé** : Données authentiques uniquement
- **Messages d'erreur** : Informatifs pour l'utilisateur

## 💡 Conseils d'Utilisation

### Performance
- **Cache intelligent** : Réduction des requêtes réseau
- **Images optimisées** : Chargement progressif
- **Navigation fluide** : Transitions natives

### Sécurité
- **JWT persistant** : Session maintenue
- **Permissions vérifiées** : Contrôles côté serveur
- **Données chiffrées** : Communication sécurisée

### Expérience Utilisateur
- **Interface responsive** : Adaptation tous écrans
- **Feedback immédiat** : Réactions tactiles
- **États de chargement** : Skeletons et indicateurs

## 🔄 Synchronisation Site Web

L'application mobile est **100% synchronisée** avec le site web :
- Mêmes APIs et types TypeScript
- Fonctionnalités identiques adaptées mobile
- Design cohérent avec optimisations tactiles
- Panel admin complet
- Badges administrateur omniprésents

L'expérience utilisateur reste cohérente entre web et mobile tout en profitant des avantages natifs de chaque plateforme.