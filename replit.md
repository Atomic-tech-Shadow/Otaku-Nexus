# Overview

This is a full-stack otaku community platform called "Otaku App" built with modern web technologies. The application serves as a comprehensive platform for users to take quizzes, watch videos, chat with other users, and engage with the community.

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
- **Video Content**: AMVs, openings, and community video content
- **Quiz System**: Interactive quizzes with scoring and difficulty levels

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
1. Frontend requests anime data from API
2. Server checks local database for cached content  
3. If not found, fetches from external APIs (Jikan/MangaDX)
4. Data normalized and stored in PostgreSQL
5. Processed data returned to frontend with caching headers

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
- **Jikan API**: MyAnimeList data for anime information
- **MangaDX API**: Manga content and chapter data
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

# User Preferences

Preferred communication style: Simple, everyday language.