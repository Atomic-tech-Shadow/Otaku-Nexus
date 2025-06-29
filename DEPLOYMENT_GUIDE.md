# Guide de Déploiement Séparé

## 📋 Vue d'ensemble

Votre application Quiz & Chat est maintenant préparée pour un déploiement séparé :
- **Frontend** → Vercel
- **Backend** → Koyeb

## 🌐 1. Déploiement Frontend sur Vercel (EN PREMIER)

### Étapes :

1. **Créer un compte Vercel** sur https://vercel.com

2. **Connecter votre repository** :
   - Créez un nouveau repository Git avec le dossier `frontend/`
   - Importez-le dans Vercel

3. **Configuration temporaire** :
   - Ne configurez PAS encore `VITE_API_URL`
   - Laissez vide pour le moment

4. **Build Settings** :
   - Framework Preset: Vite
   - Root Directory: `frontend` (IMPORTANT!)
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Déployer** et **NOTER L'URL VERCEL** (ex: `https://votre-app.vercel.app`)

## 🚀 2. Déploiement Backend sur Koyeb (APRÈS VERCEL)

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
   CORS_ORIGIN=https://VOTRE-URL-VERCEL-ICI.vercel.app
   ```
   ⚠️ **Remplacez `VOTRE-URL-VERCEL-ICI` par l'URL obtenue à l'étape 1**

4. **Build Settings** :
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Port: 5000

5. **Déployer** et noter l'URL Koyeb (ex: `https://votre-app.koyeb.app`)

## 🔧 3. Configuration finale (CONNECTER LES DEUX)

### Étape 3A - Mettre à jour Frontend avec URL Koyeb :
1. Dans Vercel, allez dans Settings > Environment Variables
2. Ajoutez/modifiez : `VITE_API_URL=https://votre-url-koyeb.app`
3. Redéployez le frontend

### Étape 3B - Vérifier CORS Backend :
1. Dans Koyeb, vérifiez que `CORS_ORIGIN` contient bien votre URL Vercel
2. Redémarrez si nécessaire

### Tester la connexion :
1. Ouvrez votre app Vercel
2. Ouvrez les Developer Tools (F12) 
3. Essayez de vous connecter
4. Vérifiez qu'il n'y a pas d'erreurs CORS dans la console

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