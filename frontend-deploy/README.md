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

Après déploiement backend :
```
VITE_API_URL=https://votre-backend.koyeb.app
```