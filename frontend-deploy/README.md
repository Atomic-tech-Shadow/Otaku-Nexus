# Quiz & Chat Frontend (Version Vercel)

Version optimisée pour Vercel avec structure aplatie.

## Déploiement Vercel

1. Utilisez ce dossier `frontend-deploy/` comme repository
2. Configuration Vercel :
   - Framework Preset: Vite
   - Root Directory: `.` (racine)
   - Build Command: `npm run build`
   - Output Directory: `dist`

Pas besoin de configurer "Root Directory" car les fichiers sont déjà à la racine.

## Variables d'environnement

Configuration actuelle pour backend Replit :
```
VITE_API_URL=https://rest-express.replit.app
```

Dans Vercel, ajoutez cette variable dans les paramètres du projet :
1. Allez dans les Settings de votre projet Vercel
2. Section "Environment Variables"
3. Ajoutez : `VITE_API_URL` = `https://rest-express.replit.app`
4. Redéployez le projet