# Fix pour déploiement Koyeb

## Fichiers ajoutés
- `package-lock.json` : Lockfile requis par Koyeb
- `.npmrc` : Configuration npm pour installation déterministe

## Actions à faire
1. Commit et push ces nouveaux fichiers vers votre repository backend
2. Relancer le déploiement sur Koyeb
3. Le build devrait maintenant réussir

## Configuration Koyeb finale
```
Build command: npm run build
Run command: npm start
Work directory: . (racine)
```