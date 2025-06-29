# Quiz & Chat Application

## Project Overview
This is a quiz, chat and anime streaming application providing:
- Quiz system with user progression and XP
- User authentication and profiles
- Admin functionality for content management
- Real-time chat system
- Leaderboards and achievements
- Anime streaming with search and playback functionality

## User Preferences
- Language: French (primary interface)
- Focus: Clean quiz and manga platform
- Priority: User experience and content management

## Project Architecture

### Core Components
- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon)

### Recent Changes (Latest First)
- **2025-06-29 07:44**: Tests API finaux réussis - Tous les endpoints API externes fonctionnels (trending, search, anime details, seasons, episodes). Configuration corrigée selon réponses réelles de l'API.
- **2025-06-29 07:36**: Migration Replit Agent terminée - Suppression complète et définitive de toute l'API interne anime, routes serveur proxy, et fichiers documentation. Application utilise exclusivement API externe https://anime-sama-scraper.vercel.app
- **2025-06-29 00:10**: Suppression complète API interne et retour exclusif API externe - Configuration finale avec https://anime-sama-scraper.vercel.app, suppression routes serveur proxy, appels directs frontend vers API externe
- **2025-06-28 00:13**: Suppression système correction saison universel à la demande utilisateur - Retour au comportement API original sans modifications URL côté serveur
- **2025-06-28 00:05**: Correction bug sélection saison critique - Configuration API_BASE_URL manquante dans server/routes.ts ajoutée, saison 7 My Hero Academia charge maintenant épisodes 139-159 correctement
- **2025-06-27 23:50**: Migration complète finalisée avec corrections critiques API Anime-Sama - Configuration API_BASE_URL (était vide), timeout optimisé (60s), système universel numérotation épisodes fonctionnel
- **2025-06-27 22:46**: Migration complète réussie de Replit Agent vers environnement Replit standard - Corrections appliquées pour bug sélection saison avec nouveaux endpoints API
- **2025-06-27 22:08**: Documentation bug saisons identifié - système charge toujours épisodes saison 1 au lieu de la saison sélectionnée
- **2025-06-27 22:00**: Correction finale - sélecteur langue remis (style anime-sama), auto-lecture VOSTFR fonctionnelle avec possibilité changement langue
- **2025-06-27 21:56**: Correction auto-lecture immédiate - premier épisode VOSTFR se lance automatiquement sans attendre sélection langue
- **2025-06-27 21:53**: Implémentation auto-lecture premier épisode VOSTFR lors clic saison - navigation avec paramètres URL automatiques
- **2025-06-27 21:50**: Modification affichage saisons en deux colonnes (style anime-sama.fr) et suppression bouton play overlay lecteur vidéo
- **2025-06-27 21:40**: Migration complète réussie de Replit Agent vers environnement Replit standard - Toutes fonctionnalités opérationnelles
- **2025-06-27 15:26**: Migration complète réussie de Replit Agent vers environnement Replit standard - Configuration API anime player corrigée
- **2025-06-27 15:03**: Correction endpoint `/api/embed/` - gestion spécifique URLs anime-sama.fr avec message explicatif (lecteurs externes indépendants)
- **2025-06-27 14:05**: Implémentation endpoint `/api/embed/` pour lecteur vidéo sécurisé dans pages anime avec page HTML intégrée
- **2025-06-27 13:38**: Migration complète terminée - Page anime-sama redesignée pour navigation vers pages dédiées
- **2025-06-27 13:25**: Correction API Anime-Sama (URLs relatives, paramètre query→q, erreurs TypeScript)
- **2025-06-27 12:21**: Interface anime-detail redesignée avec sélecteurs exacts anime-sama.fr (épisodes, lecteurs, navigation)
- **2025-06-27 12:17**: Migration complète réussie de Replit Agent vers environnement Replit standard - Application fonctionnelle
- **2025-06-27 12:02**: Création interface anime inspirée d'anime-sama.fr avec navigation par saisons et épisodes
- **2025-06-27 11:49**: Implémentation nouveau format ID épisode: {nom-anime}-{numéro-épisode}-{langue} (ex: naruto-1-vf)
- **2025-06-27 11:40**: Migration complète réussie de Replit Agent vers environnement Replit standard
- **2025-06-26 19:28**: Correction erreur API Anime-Sama - suppression appel /api/seasons, utilisation directe saisons depuis /api/anime/{id}
- **2025-06-26 19:22**: Migration complète réussie de Replit Agent vers environnement Replit standard
- **2025-06-26 02:53**: Configuration API production Anime-Sama (https://api-anime-sama.onrender.com)
- **2025-06-26 02:52**: Ajout routes proxy serveur pour API Anime-Sama avec gestion d'erreurs
- **2025-06-26 02:44**: Migration complète terminée de Replit Agent vers environnement Replit standard
- **2025-06-26 02:44**: Configuration des endpoints API Anime-Sama pour récupérer saisons et épisodes
- **2025-06-26 02:30**: Configuration API Anime-Sama avec endpoints corrects selon documentation fournie
- **2025-06-26 02:30**: Correction des erreurs de clés dupliquées React dans les listes d'animes
- **2025-06-26 02:30**: Migration complète de Replit Agent vers environnement Replit standard
- **2025-06-26 01:30**: Added anime streaming functionality with full search and playback features
- **2025-06-26 01:30**: Migrated successfully from Replit Agent to standard Replit environment
- **2025-06-26 01:30**: Added anime-sama page with navigation integration
- **2025-06-25 20:55**: Completely removed all manga functionality per user request
- **2025-06-25 20:55**: Removed manga database tables, API routes, and frontend components
- **2025-06-25 20:50**: Successfully migrated from Replit Agent to standard Replit environment
- **2025-06-25 20:50**: Completely removed all Anime-Sama functionality per user request
- **2025-06-25 20:50**: Fixed TypeScript errors and removed mobile app components
- **2025-06-25 20:50**: Ensured proper client/server separation and security practices

### Critical Features
1. **Quiz System**: Complete quiz management with XP progression and leaderboards
2. **User Management**: Authentication, profiles, and achievement system
3. **Chat System**: Real-time messaging between users
4. **Admin Panel**: Complete content and user management
5. **Achievements**: User progression tracking and rewards system
6. **Anime Streaming**: Full anime search, episode browsing, and video playback with server selection

### Technical Decisions
- **Database**: PostgreSQL (Neon) for data persistence
- **Authentication**: JWT-based session management with Replit Auth integration
- **Frontend**: React with TypeScript, Tailwind CSS for styling
- **Backend**: Express.js with TypeScript for API endpoints
- **Security**: Proper client/server separation with authentication middleware
- **Architecture**: Modern full-stack approach with RESTful API design

## Current Status
- Application running successfully on port 5000
- Image URLs corrected to match original site
- API routes properly configured
- Database connected and functional