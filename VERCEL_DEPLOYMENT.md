# Déploiement sur Vercel

## Étapes pour déployer votre application Quiz & Anime sur Vercel

### 1. Préparation des fichiers
✅ Les fichiers de configuration Vercel sont déjà créés :
- `vercel.json` - Configuration principal
- `api/index.ts` - Point d'entrée serverless pour l'API

### 2. Variables d'environnement requises
Vous devez configurer ces variables dans Vercel :

**Database (PostgreSQL Neon) :**
```
DATABASE_URL=votre_url_neon_postgresql
PGHOST=votre_host_neon
PGDATABASE=votre_nom_db
PGUSER=votre_user_neon
PGPASSWORD=votre_password_neon
PGPORT=5432
```

**Authentification :**
```
JWT_SECRET=votre_secret_jwt_aleatoire
SESSION_SECRET=votre_secret_session_aleatoire
NODE_ENV=production
```

### 3. Configuration sur Vercel.com

1. **Connectez votre repository :**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez "New Project"
   - Importez votre repository GitHub/GitLab

2. **Configuration du build :**
   - Framework Preset: **"Other"**
   - Build Command: `vite build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`

3. **Ajoutez les variables d'environnement :**
   - Dans Settings > Environment Variables
   - Ajoutez toutes les variables listées ci-dessus

### 4. Configuration spéciale pour l'API
- Le serveur Express est configuré comme fonction serverless
- Les routes API seront disponibles sous `/api/*`
- Le frontend sera servi depuis la racine `/`

### 5. Points importants

**Base de données :**
- Assurez-vous que votre base PostgreSQL Neon accepte les connexions externes
- Les migrations doivent être exécutées manuellement via `npm run db:push`

**Sessions :**
- Les sessions utilisent la base PostgreSQL (compatible serverless)
- Pas de stockage en mémoire (incompatible avec Vercel)

**Fichiers statiques :**
- Les assets sont servis via Vercel CDN
- Configuration automatique pour les routes SPA

### 6. Déploiement
Une fois configuré, Vercel déploiera automatiquement à chaque push sur la branche principale.

## Alternatives recommandées

Si vous rencontrez des difficultés avec Vercel, ces plateformes sont plus adaptées aux applications full-stack :

1. **Replit Deployments** (recommandé) - Déjà configuré et prêt
2. **Railway** - Excellent pour Node.js + PostgreSQL
3. **Render** - Simple et efficace pour full-stack
4. **Fly.io** - Performant pour applications Express

## Support
Pour des questions spécifiques au déploiement, consultez la documentation Vercel ou utilisez une alternative plus adaptée.