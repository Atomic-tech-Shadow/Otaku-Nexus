# Guide de Déploiement Render - Otaku Nexus

## 🚀 Configuration Automatique

Tous les fichiers de déploiement sont prêts. Voici les étapes pour déployer sur Render :

### 1. Connexion à Render
- Allez sur [render.com](https://render.com)
- Connectez-vous avec votre compte GitHub
- Autorisez l'accès à votre repository

### 2. Création du Service Web
1. Cliquez sur "New" → "Web Service"
2. Connectez votre repository GitHub
3. Configurations :
   - **Name**: `otaku-nexus`
   - **Environment**: `Node`
   - **Build Command**: `npm run render:build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Starter ($7/month)`

### 3. Variables d'Environnement
Ajoutez ces variables dans Render Dashboard :

```bash
NODE_ENV=production
API_BASE_URL=https://api-anime-sama.onrender.com
JWT_SECRET=votre-jwt-secret-securise-ici
SESSION_SECRET=votre-session-secret-securise-ici
CORS_ORIGIN=https://otaku-nexus.onrender.com
```

### 4. Base de Données PostgreSQL
1. Dans Render Dashboard : "New" → "PostgreSQL"
2. Configurations :
   - **Name**: `otaku-nexus-db`
   - **Database Name**: `otaku_nexus`
   - **User**: `otaku_user`
   - **Plan**: `Starter (Gratuit)`

3. Copiez l'URL de connexion générée
4. Ajoutez-la comme variable `DATABASE_URL` dans votre service web

### 5. Configuration des Domaines
- **URL Auto**: `https://otaku-nexus.onrender.com`
- **Domaine Custom** (optionnel): Configurez dans "Settings" → "Custom Domains"

## 📊 Monitoring et Logs

### Health Check
L'application expose un endpoint de santé : `/api/health`

### Logs en Temps Réel
```bash
# Dans Render Dashboard → votre service → "Logs"
# Ou via CLI Render
render logs -s otaku-nexus
```

### Métriques
- CPU/RAM usage visibles dans Dashboard
- Temps de réponse automatiquement trackés
- Alertes configurables

## 🔧 Optimisations Production

### 1. Performance
- Build optimisé avec Vite
- Compression gzip activée
- Cache headers configurés
- Minification automatique

### 2. Sécurité
- HTTPS automatique
- Variables secrets chiffrées
- CORS configuré
- Validation des inputs

### 3. Évolutivité
- Auto-scaling disponible
- Load balancing intégré
- CDN global
- Database backup automatique

## 🚨 Troubleshooting

### Erreurs Courantes

**1. Build Failed**
```bash
# Vérifiez les logs de build
# Souvent : dépendances manquantes ou erreurs TypeScript
npm run build:server
```

**2. Database Connection**
```bash
# Vérifiez que DATABASE_URL est correctement définie
# Format: postgresql://user:pass@host:port/db
```

**3. API CORS**
```bash
# Vérifiez CORS_ORIGIN dans variables environnement
# Doit correspondre à votre domaine Render
```

**4. Memory Issues**
```bash
# Passez au plan Starter+ si nécessaire
# Optimisez les requêtes DB
```

### Support
- Documentation Render : [render.com/docs](https://render.com/docs)
- Community : [community.render.com](https://community.render.com)

## 📱 Post-Déploiement

### Tests à Effectuer
1. ✅ Page d'accueil charge correctement
2. ✅ Authentication fonctionne
3. ✅ Page anime-sama accessible
4. ✅ API anime-sama.onrender.com répond
5. ✅ Base de données connectée
6. ✅ Changements VF/VOSTFR fonctionnent
7. ✅ Lecteur vidéo sans erreurs CORS

### Configuration Mobile
L'application mobile React Native (dossier `/mobile`) peut pointer vers :
```javascript
const API_BASE = 'https://otaku-nexus.onrender.com';
```

## 🎯 URLs Finales
- **Application Web**: `https://otaku-nexus.onrender.com`
- **API Anime-Sama**: `https://api-anime-sama.onrender.com`
- **Database**: Géré automatiquement par Render
- **Admin Panel**: `https://otaku-nexus.onrender.com/admin`

Votre application sera disponible 24/7 avec SSL automatique et sauvegarde database !