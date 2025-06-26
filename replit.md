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