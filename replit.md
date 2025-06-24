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
- ✓ Migrated project to Replit environment (January 2025)
- ✓ Set up PostgreSQL database with environment variables
- ✓ Configured workflow to run application on port 5000
- ✓ Fixed Render deployment: Created production-specific server files
- ✓ Added render.yaml with Vite-free build configuration  
- ✓ Verified production build works without any Vite dependencies
- ✓ Added database schema migration to build process for Render
- ✓ Configured Neon PostgreSQL database for production deployment
- ✓ All tables created successfully in production database
- ✓ Fixed anime-sama page video loading errors with corrected API routes
- ✓ Simplified video player configuration to resolve CORS issues

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