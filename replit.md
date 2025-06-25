# Anime-Sama Mirror Application

## Project Overview
This is a 100% mirror application of anime-sama.fr, providing anime streaming functionality with:
- Authentic anime catalogue with correct image URLs
- Episode streaming capabilities
- User authentication and quiz features
- Admin functionality
- Real-time search and trending anime

## User Preferences
- Language: French (primary interface)
- Focus: 100% fidelity to original anime-sama.fr site
- Priority: Correct image display and streaming functionality

## Project Architecture

### Core Components
- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon)
- **External API**: anime-sama API integration
- **Image CDN**: https://cdn.statically.io/gh/Anime-Sama/IMG/

### Recent Changes (Latest First)
- **2025-06-25**: Fixed image URLs to use correct CDN (cdn.statically.io/gh/Anime-Sama/IMG)
- **2025-06-25**: Added image URL correction method in anime-sama-api.ts
- **2025-06-25**: Added catalogue and seasons API routes
- **2025-06-25**: Updated fallback anime data with authentic titles and images
- **2025-06-25**: Migrated project from Replit Agent to Replit environment

### Critical Features
1. **Image Display**: All anime images now use the correct CDN URLs
2. **API Integration**: Direct proxy to anime-sama API with image corrections
3. **Search Functionality**: Real-time anime search with proper image display
4. **Episode Streaming**: Full episode streaming capabilities
5. **User System**: Authentication, profiles, and quiz functionality

### Technical Decisions
- Using authentic anime-sama.fr CDN for images
- Implementing fallback data that matches the original site
- Correcting API responses to ensure proper image URLs
- Maintaining 100% compatibility with original site structure

## Current Status
- Application running successfully on port 5000
- Image URLs corrected to match original site
- API routes properly configured
- Database connected and functional