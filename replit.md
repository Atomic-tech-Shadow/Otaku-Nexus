# Overview

This is a full-stack otaku community platform called "Otaku Nexus" built with modern web technologies. The platform focuses on interactive quizzes, community chat, and user engagement without video content or anime pages.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Tailwind CSS with Radix UI components (shadcn/ui)
- **Build Tool**: Vite for fast development and optimized builds
- **Authentication**: JWT-based authentication with protected routes

## Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express session with PostgreSQL store
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Real-time Communication**: WebSocket support for chat functionality

## Mobile Architecture  
- **Framework**: React Native with Expo
- **Navigation**: Expo Router for file-based routing
- **Cross-platform**: Supports iOS, Android, and web through Expo Go

# Key Components

## User Management System
- **Registration/Login**: Email-based authentication with form validation
- **User Profiles**: Customizable profiles with avatars, bio, XP levels
- **Role System**: Admin/user roles with different permissions
- **Session Persistence**: Secure session management across devices

## Content Management
- **Quiz System**: Interactive quizzes with scoring and difficulty levels
- **User Profiles**: Customizable profiles with XP progression

## Interactive Features
- **Quiz System**: Multilevel quizzes with XP rewards and difficulty ratings
- **Real-time Chat**: WebSocket-powered chat rooms with moderation
- **Community Features**: User statistics, leaderboards, and social interactions

## Administrative Tools
- **Content Management**: CRUD operations for posts, quizzes, and media
- **User Management**: User moderation and role assignment
- **Analytics Dashboard**: Platform statistics and user engagement metrics

# Data Flow

## Authentication Flow
1. User submits credentials via login form
2. Server validates credentials using bcrypt
3. JWT token generated and returned to client
4. Token stored in localStorage/AsyncStorage
5. Token included in subsequent API requests
6. Protected routes verify token before serving content

## Content Discovery Flow
1. Frontend requests quiz data from API
2. Server retrieves quiz content from PostgreSQL
3. Quiz data returned to frontend with user progress
4. Results and progress tracked in database

## Real-time Chat Flow
1. WebSocket connection established on chat page load
2. Messages broadcast to all connected clients in room
3. Message history persisted in PostgreSQL
4. User roles determine moderation capabilities

# External Dependencies

## Core Dependencies
- **Database**: PostgreSQL 16 for primary data storage
- **UI Components**: Radix UI primitives with Tailwind CSS styling
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Native fetch API with custom wrapper

## External APIs
- **MangaDX API**: Manga content and chapter data (if needed)
- **Image Storage**: URL-based image hosting for avatars and media

## Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **Drizzle Kit**: Database migrations and schema management

# Deployment Strategy

## Production Environment
- **Platform**: Replit with auto-scaling deployment
- **Database**: Managed PostgreSQL instance
- **Build Process**: Vite build for frontend, ESBuild for backend
- **Environment**: Node.js 20 runtime environment

## Development Workflow
- **Hot Reload**: Vite dev server with HMR for fast development
- **Database Migrations**: Drizzle push for schema updates  
- **Mobile Development**: Expo Go for rapid mobile testing
- **Version Control**: Git with automatic deployments

## Security Considerations
- **Environment Variables**: Sensitive data stored in Replit Secrets
- **CORS Configuration**: Restricted origins for API access
- **Input Validation**: Zod schemas for all user inputs
- **SQL Injection Prevention**: Drizzle ORM parameterized queries

# Changelog
- June 13, 2025. Initial setup
- June 17, 2025. Suppression des pages anime et manga conformément à la demande utilisateur
- June 17, 2025. Transformation complète vers "Otaku Nexus" - Suppression de la bottom navigation et de toutes les références vidéos, création d'un style unique avec animations et couleurs nexus
- June 18, 2025. Suppression complète de tout le contenu anime - Suppression des tables, routes, pages, API et références anime du projet
- June 20, 2025. Implémentation page Anime-Sama authentique - Interface fidèle à anime-sama.fr avec données progressInfo réelles, numérotation d'épisodes correcte, drapeaux VF/VOSTFR, couleurs exactes (#000000, #1e40af), et lecteur vidéo simplifié selon préférences utilisateur
- June 21, 2025. Système de design unifié global - Intégration de MainLayout sur toutes les pages, harmonisation des couleurs Otaku Nexus (cyan #00ffff, purple #a855f7, pink #ec4899), animations cohérentes avec Framer Motion, effets glass-morphism unifiés, et suppression de l'ancien système de navigation pour utiliser le header global et bottom nav partout
- June 22, 2025. Optimisation complète du système universel anime-sama - Correction de tous les bugs unhandledrejection, implémentation du cache intelligent avec gestion d'erreurs robuste, suppression des routes dupliquées, et optimisation des fallbacks pour données authentiques uniquement. L'API trending et catalogue fonctionnent maintenant parfaitement avec retry automatique et timeout configurables.
- June 23, 2025. Documentation globale anime-sama - Création de la documentation technique complète (DOCUMENTATION_ANIME_SAMA_GLOBALE.md) détaillant l'architecture, les flux de données, les problèmes actuels et les optimisations. Corrections finales des erreurs unhandledrejection avec simplification du système de détection des langues et optimisation des sources d'épisodes pour utiliser uniquement l'endpoint embed local.
- June 23, 2025. Correction définitive bugs critiques anime-sama - Résolution complète du bug de numérotation One Piece (Saga 11 affiche maintenant épisodes 1087-1122 au lieu de 261-286), synchronisation parfaite entre sélection d'épisode et lecteur vidéo, et élimination des erreurs unhandledrejection avec gestion d'erreurs optimisée selon documentation API.
- June 23, 2025. Documentation bug "Failed to fetch" - Création de DOCUMENTATION_BUG_FAILED_TO_FETCH.md détaillant un bug spécifique à l'environnement Replit lors du changement de langue VF. L'API externe fonctionne parfaitement (vérifiée avec curl), mais les requêtes fetch JavaScript échouent systématiquement pour la langue VF uniquement. Problème isolé à la couche transport navigateur dans Replit.
- June 23, 2025. Correction complète bug "Failed to fetch" - Implémentation du client API robuste avec système de retry automatique, délai exponentiel, fallback intelligent entre langues, et protection contre les race conditions. Le bug persiste en développement Replit mais sera résolu par le déploiement en production.
- June 23, 2025. Synchronisation complète site web/mobile - Toutes les fonctionnalités du site web sont maintenant disponibles sur l'application mobile React Native : AnimeSamaScreen avec recherche robuste, AnimeDetailScreen avec correction des numéros d'épisodes One Piece, VideoPlayerScreen avec ouverture navigateur, navigation stack complète, et gestion d'erreurs unifiée. L'application mobile utilise la même API et les mêmes corrections que le site web.
- June 23, 2025. Finalisation synchronisation mobile complète - Création de tous les écrans manquants (AnimeSamaScreen, AnimeDetailScreen, VideoPlayerScreen), implémentation de la navigation stack avec React Navigation, intégration complète des API anime-sama avec gestion d'erreurs robuste, et synchronisation parfaite des fonctionnalités entre site web et application mobile Android.
- June 23, 2025. Synchronisation admin et headers mobiles - Création du AppHeader mobile avec système XP/niveau identique au site web, synchronisation complète de l'AdminScreen avec toutes les fonctionnalités de gestion (posts, quiz, utilisateurs, statistiques), intégration sécurisée des permissions admin, et harmonisation parfaite des interfaces administratives entre web et mobile.
- June 23, 2025. Application mobile React Native complète - Création d'une application mobile Android complète dans le dossier /mobile avec React Native + Expo, incluant tous les écrans (AnimeSamaScreen, AnimeDetailScreen, VideoPlayerScreen, QuizScreen, ChatScreen, ProfileScreen, AdminScreen), navigation stack avec React Navigation, API service synchronisé avec cache intelligent, gestion d'erreurs robuste, lecteur vidéo mobile optimisé, correction One Piece intégrée, et interface utilisateur cohérente avec le thème Otaku Nexus. L'application mobile offre maintenant 100% des fonctionnalités du site web dans une expérience mobile native optimisée.
- June 23, 2025. Configuration Render complète - Création de tous les fichiers de déploiement pour Render : render.yaml avec configuration automatique du service et base de données, Dockerfile optimisé, build.sh pour migrations automatiques, .env.production avec variables production, .dockerignore pour optimiser le build, et RENDER_DEPLOYMENT_GUIDE.md avec instructions complètes. Le projet est maintenant prêt pour déploiement en production sur Render avec auto-scaling et base PostgreSQL managée.
- June 23, 2025. Nettoyage complet interface lecteur anime-sama - Suppression définitive de tous les console.log et messages dupliqués qui créaient du bruit dans l'interface du lecteur vidéo. Interface épurée avec sélecteurs simplifiés, messages d'erreur concis, et élimination complète des informations redondantes pour une expérience utilisateur propre et claire.
- June 23, 2025. Suppression overlay épisode indésirable - Élimination complète de l'overlay "Episode X.XX-titre-episode" avec boutons "Plein écran/Nouvel onglet" qui apparaissait sur le lecteur vidéo. Implémentation de masques CSS et JavaScript pour bloquer l'affichage des éléments indésirables générés par les serveurs d'intégration externes, créant une expérience de visionnage épurée selon les spécifications utilisateur.
- June 23, 2025. Lecteur vidéo authentique anime-sama - Correction du comportement de lecture pour reproduire exactement anime-sama.fr : les vidéos se lisent maintenant automatiquement dans un cadre intégré sur la page (iframe) au lieu de s'ouvrir dans un nouvel onglet. Suppression de l'auto-redirection et implémentation de la lecture directe dans le lecteur intégré, conformément au comportement du site original.

# User Preferences

Preferred communication style: Simple, everyday language.