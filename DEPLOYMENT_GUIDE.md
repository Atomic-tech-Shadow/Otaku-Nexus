# Guide de Déploiement Séparé

## 📋 Vue d'ensemble

Votre application Quiz & Chat est maintenant préparée pour un déploiement séparé :
- **Frontend** → Vercel
- **Backend** → Koyeb

## 🚀 1. Déploiement Backend sur Koyeb

### Étapes :

1. **Créer un compte Koyeb** sur https://www.koyeb.com

2. **Connecter votre repository** :
   - Créez un nouveau repository Git avec le dossier `backend/`
   - Connectez-le à Koyeb

3. **Configuration des variables d'environnement** :
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=votre-jwt-secret-key-aleatoire
   SESSION_SECRET=votre-session-secret-key-aleatoire
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://votre-app.vercel.app
   ```

4. **Build Settings** :
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Port: 5000

5. **Déployer** et noter l'URL Koyeb (ex: `https://votre-app.koyeb.app`)

## 🌐 2. Déploiement Frontend sur Vercel

### Étapes :

1. **Créer un compte Vercel** sur https://vercel.com

2. **Connecter votre repository** :
   - Créez un nouveau repository Git avec le dossier `frontend/`
   - Importez-le dans Vercel

3. **Configuration des variables d'environnement** :
   ```
   VITE_API_URL=https://votre-backend.koyeb.app
   ```

4. **Build Settings** :
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `.` (racine du repo frontend)

5. **Déployer**

## 🔧 3. Configuration finale

### Mettre à jour CORS_ORIGIN :
Retournez dans Koyeb et mettez à jour la variable `CORS_ORIGIN` avec l'URL Vercel finale.

### Tester la connexion :
1. Ouvrez votre app Vercel
2. Essayez de vous connecter
3. Vérifiez que toutes les fonctionnalités marchent

## 📁 Structure des repositories

### Repository Backend :
```
backend/
├── server/
├── shared/
├── migrations/
├── package.json
├── Dockerfile
├── drizzle.config.ts
├── tsconfig.json
└── README.md
```

### Repository Frontend :
```
frontend/
├── src/
├── shared/
├── package.json
├── vite.config.ts
├── vercel.json
├── tailwind.config.ts
└── README.md
```

## ✅ Vérifications

- [ ] Backend déployé sur Koyeb
- [ ] Frontend déployé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] CORS configuré correctement
- [ ] Base de données accessible
- [ ] Connexion utilisateur fonctionnelle
- [ ] Chat en temps réel opérationnel
- [ ] Quiz system actif