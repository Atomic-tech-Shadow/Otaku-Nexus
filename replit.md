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
- ✓ Updated anime-sama.tsx video URL handling with proxy API integration
- ✓ Configured permanent Neon PostgreSQL database for production and development
- ✓ Enhanced video player with dynamic proxy URL fetching from episode sources
- ✓ Improved CORS handling with source-specific proxy URLs
- ✓ Database schema migrations executed successfully
- ✓ All dependencies and packages properly installed and working
- ✓ Application running successfully on port 5000
- ✓ Fixed quiz JSON parsing bug by configuring PostgreSQL database
- ✓ Resolved chat authentication issues with JWT token handling

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