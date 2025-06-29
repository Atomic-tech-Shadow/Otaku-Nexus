# Quiz & Chat Frontend

Application frontend React/TypeScript pour déploiement sur Vercel.

## Configuration Vercel

1. **Connecter le repository** : Importez ce dossier frontend dans Vercel
2. **Variables d'environnement** :
   ```
   VITE_API_URL=https://votre-backend-koyeb.app
   ```
3. **Build Settings** :
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Développement local

```bash
npm install
npm run dev
```

L'application se lance sur http://localhost:3000

## Structure

- `/src` - Code source React/TypeScript
- `/src/components` - Composants UI réutilisables
- `/src/pages` - Pages de l'application
- `/src/lib` - Utilitaires et configuration API
- `/shared` - Types et schémas partagés avec le backend