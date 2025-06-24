# Otaku Nexus - Plateforme Anime/Manga

## Overview
Plateforme complète pour les fans d'anime et manga avec streaming, quiz, chat et gestion de favoris. Le projet utilise React/TypeScript en frontend, Express/Node.js en backend, PostgreSQL comme base de données, et une API externe pour le contenu anime.

## Recent Changes
- **Migration Replit Agent vers Replit Environment** (24 juin 2025)
  - Configuration de la base de données PostgreSQL Replit
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

### API Endpoints
- `/api/search` - Recherche d'animes
- `/api/anime/[id]` - Détails d'un anime  
- `/api/episode/[id]` - Sources vidéo
- `/api/seasons` - Épisodes par saison
- `/api/trending` - Animes populaires
- `/api/embed/[episodeId]` - Lecteur vidéo
- `/api/proxy/[url]` - Proxy CORS

## User Preferences
*Aucune préférence utilisateur spécifiée pour le moment*

## Technical Notes
- Utilise l'API externe https://api-anime-sama.onrender.com pour le contenu anime authentique
- Configuration sécurisée avec variables d'environnement
- Cache intelligent côté serveur pour optimiser les performances
- Gestion d'erreurs robuste avec fallbacks appropriés