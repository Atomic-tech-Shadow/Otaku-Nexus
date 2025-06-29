# Otaku Nexus Backend (Version Koyeb)

Backend optimisé pour le déploiement sur Koyeb.

## Configuration Koyeb

### Variables d'environnement requises :
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key
NODE_ENV=production
PORT=8000
```

### Configuration de déploiement Koyeb :
1. Connectez votre repository GitHub
2. Sélectionnez ce dossier `backend-deploy/` comme répertoire racine
3. Runtime : Node.js
4. Build command : `npm run build`
5. Start command : `npm start`
6. Port : 8000

### Fichiers requis pour le déploiement :
- `package.json` : dépendances et scripts
- `tsconfig.json` : configuration TypeScript
- Tous les fichiers `.ts` du backend
- Note : package-lock.json sera généré automatiquement par Koyeb

### Stratégie de déploiement simplifiée :
- Suppression du package-lock.json problématique
- Build command intégré dans le script : `npm install && npx tsc`
- Koyeb génèrera automatiquement le lockfile lors du déploiement
- Configuration TypeScript optimisée pour production
- Versions des packages fixées (sans ^) pour éviter les conflits
- Support complet pour Node.js 18+ et TypeScript 5.4.5

### Structure du projet :
- `index.ts` - Point d'entrée principal
- `routes.ts` - Toutes les routes API
- `storage.ts` - Gestion de la base de données
- `auth.ts` - Authentification JWT
- `db.ts` - Configuration base de données
- `shared/schema.ts` - Schémas Drizzle

### Endpoints API disponibles :
- `GET /api/health` - Health check
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/user` - Profil utilisateur
- `GET /api/quizzes` - Liste des quiz
- `GET /api/chat/rooms` - Salles de chat
- `GET /api/posts` - Articles publiés

## Notes de déploiement :
- Le backend utilise PostgreSQL (Neon compatible)
- CORS configuré pour accepter toutes les origines
- Authentification par JWT
- Support des variables d'environnement Koyeb