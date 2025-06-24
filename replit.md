# Anime Sama Project - Replit Migration

## Overview
This is an anime streaming platform built with Node.js/Express backend and React frontend. The project has been successfully migrated from Docker-based deployment to Replit environment.

## Architecture
- **Backend**: Express.js server with TypeScript
- **Frontend**: React with Vite bundler
- **Database**: PostgreSQL (Replit managed)
- **Authentication**: JWT with Passport.js
- **Styling**: Tailwind CSS with Radix UI components

## Recent Changes
- ✓ Successfully migrated project from Replit Agent to Replit environment (June 2025)
- ✓ Fixed anime-sama page black screen issue by correcting API endpoints
- ✓ Updated API configuration to use deployed server instead of external anime-sama API
- ✓ Enhanced video player with fallback mechanisms for reliable streaming
- ✓ Configured permanent Neon PostgreSQL database for production and development
- ✓ Corrected React hooks placement to resolve component rendering issues
- ✓ Database schema migrations executed successfully
- ✓ All dependencies and packages properly installed and working
- ✓ Application running successfully on port 5000

## User Preferences
- Language: French (based on documentation files)
- Platform: Anime streaming focus

## Security Features
- Client/server separation maintained
- JWT authentication
- Session management with express-session
- Input validation with Zod
- Password hashing with bcryptjs

## Deployment
The application runs on Replit's platform using the "Start application" workflow. No Docker configuration needed.