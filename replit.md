# Otaku Nexus - Plateforme Anime/Manga

## Overview
Plateforme complète pour les fans d'anime et manga avec streaming, quiz, chat et gestion de favoris. Le projet utilise React/TypeScript en frontend, Express/Node.js en backend, PostgreSQL comme base de données, et une API externe pour le contenu anime.

## Recent Changes
- **Optimisation post-déploiement Render** (24 juin 2025)
  - Suppression des restrictions de timeout dans anime-sama
  - Augmentation des délais API (60s) pour environnement de production
  - Optimisation du cache (15 minutes) pour Render
  - Suppression des blocages iframe et restrictions vidéo
  - Configuration finale pour déploiement externe
- **Préparation pour déploiement** (24 juin 2025)
  - Suppression des dépendances Replit spécifiques
  - Configuration database Neon PostgreSQL permanente
  - Désactivation Replit Auth pour déploiement
  - Nettoyage des références Replit dans le code
  - Optimisation pour environnement de production
- **Migration Replit Agent vers Replit Environment** (24 juin 2025)
  - Configuration de la base de données PostgreSQL
  - Suppression des données de démo de la page anime-sama
  - Configuration API https://api-anime-sama.onrender.com
  - Mise à jour des endpoints pour sécurité et compatibilité
  - Amélioration séparation client/serveur

## Project Architecture

### Frontend (client/)
- **React + TypeScript** avec Vite
- **Pages principales**: anime-sama, quiz, chat, profil utilisateur
- **Styling**: TailwindCSS avec composants Radix UI
- **Routing**: Wouter pour navigation côté client

### Backend (server/)
- **Express.js** avec TypeScript
- **Base de données**: PostgreSQL avec Drizzle ORM
- **Authentication**: Passport.js avec sessions
- **API externe**: Intégration anime-sama pour contenu streaming

### Database Schema
- Users, quiz system, chat rooms/messages
- Anime favorites, watching progress
- Admin posts et gestion contenu

### API Endpoints (Tous testés et fonctionnels)
- `/api/search` - Recherche d'animes (timeout 60s)
- `/api/anime/[id]` - Détails d'un anime (cache 15min)
- `/api/episode/[id]` - Sources vidéo multi-serveurs
- `/api/seasons` - Épisodes par saison/langue (vf/vostfr)
- `/api/trending` - Animes populaires (réponse <1s)
- `/api/embed/[episodeId]` - Lecteur vidéo iframe CORS-free
- `/api/proxy/[url]` - Proxy CORS pour accès direct

## User Preferences
*Aucune préférence utilisateur spécifiée pour le moment*

## Technical Notes
- Utilise l'API externe https://api-anime-sama.onrender.com pour le contenu anime authentique
- Configuration sécurisée avec variables d'environnement
- Cache intelligent côté serveur pour optimiser les performances
- Gestion d'erreurs robuste avec fallbacks appropriés