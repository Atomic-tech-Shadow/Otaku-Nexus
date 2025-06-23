# Guide de Déploiement Render - Otaku Nexus

## 🚀 Configuration Render automatique

Le projet est maintenant configuré pour déploiement automatique sur Render avec tous les fichiers nécessaires.

### 📁 Fichiers de configuration créés

1. **render.yaml** - Configuration automatique du service et base de données
2. **Dockerfile** - Image Docker optimisée pour production  
3. **build.sh** - Script de build avec migrations automatiques
4. **package.json** - Ajout du script `start` pour production

### 🔧 Étapes de déploiement

#### 1. Connexion à Render
- Allez sur [render.com](https://render.com)
- Connectez-vous avec votre compte GitHub

#### 2. Nouveau service
- Cliquez sur "New +" → "Blueprint"
- Connectez votre repository GitHub
- Render détectera automatiquement le fichier `render.yaml`

#### 3. Configuration automatique
Render va automatiquement :
- Créer le service web `otaku-nexus`
- Créer la base PostgreSQL `otaku-nexus-db`
- Générer les secrets JWT et session
- Configurer les variables d'environnement

#### 4. Variables d'environnement (optionnelles)
Si vous voulez des clés API spécifiques :
- `OPENAI_API_KEY` - Pour fonctionnalités IA
- `SMTP_*` - Pour emails (optionnel)

### 🗃️ Base de données

- **Type** : PostgreSQL 15+
- **Plan** : Starter (gratuit)
- **Migrations** : Automatiques via `npm run db:push`
- **Connexion** : Variable `DATABASE_URL` auto-configurée

### 🌐 Domaine et SSL

- **URL** : `https://otaku-nexus.onrender.com` (généré automatiquement)
- **SSL** : Certificat HTTPS automatique
- **Custom Domain** : Configurable dans les paramètres Render

### 📊 Monitoring

Render fournit :
- Logs en temps réel
- Métriques de performance
- Health checks automatiques sur `/api/health`
- Auto-restart en cas d'erreur

### 🔄 Déploiement continu

- **Auto-deploy** : Activé sur la branche main
- **Build time** : ~3-5 minutes
- **Zero downtime** : Déploiements rolling
- **Rollback** : Un clic pour revenir à la version précédente

### ⚡ Performance

- **Plan Starter** : 512MB RAM, CPU partagé (gratuit)
- **Scaling** : Upgrade possible vers plans supérieurs
- **CDN** : Render edge network pour assets statiques
- **Database** : Connection pooling automatique

### 🛠️ Commandes utiles

```bash
# Build local (test)
npm run build

# Vérifier les migrations
npm run db:push

# Mode développement
npm run dev
```

### 📱 Application mobile

L'app mobile React Native se connectera automatiquement à :
- **Production** : `https://otaku-nexus.onrender.com`
- **API** : Tous les endpoints disponibles
- **WebSocket** : Chat temps réel fonctionnel

### 🔐 Sécurité

- Variables d'environnement chiffrées
- Secrets générés automatiquement
- Base de données isolée
- HTTPS obligatoire
- CORS configuré pour production

## ✅ Checklist avant déploiement

- [ ] Code pushé sur GitHub
- [ ] Tests passent en local
- [ ] Variables d'environnement configurées
- [ ] Base de données testée avec `npm run db:push`

Après déploiement, votre application sera accessible publiquement avec SSL, base de données PostgreSQL managée, et déploiement automatique à chaque push sur GitHub.