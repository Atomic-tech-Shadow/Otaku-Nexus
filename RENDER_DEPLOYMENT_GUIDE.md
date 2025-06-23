# Guide de Déploiement Render - Otaku Nexus

## 📋 Configuration Automatique

Votre projet est maintenant configuré pour le déploiement sur Render avec :

### ✅ Fichiers Créés
- `render.yaml` - Configuration automatique du service
- `Dockerfile` - Conteneur Docker optimisé
- `.env.production` - Variables d'environnement production
- `build.sh` - Script de build personnalisé

### 🔧 Modifications Apportées
- Port dynamique configuré (`process.env.PORT`)
- Script de build avec migrations automatiques
- Configuration base de données PostgreSQL

## 🚀 Étapes de Déploiement sur Render

### 1. Créer le Service Web
1. Connectez-vous à [render.com](https://render.com)
2. Cliquez "New" → "Web Service"
3. Connectez votre repository GitHub/GitLab
4. Sélectionnez votre projet

### 2. Configuration du Service
```
Name: otaku-nexus
Environment: Node
Build Command: ./build.sh
Start Command: npm start
```

### 3. Variables d'Environnement Requises
Dans les paramètres Render, ajoutez :

```
NODE_ENV=production
JWT_SECRET=votre-secret-jwt-tres-securise
DATABASE_URL=postgresql://... (auto-généré)
```

### 4. Base de Données PostgreSQL
1. Créez une nouvelle base PostgreSQL sur Render
2. Nom : `otaku-nexus-db`
3. La `DATABASE_URL` sera automatiquement configurée

### 5. Déploiement
- Render détectera automatiquement `render.yaml`
- Le build et le déploiement se lanceront automatiquement
- Votre app sera disponible sur : `https://otaku-nexus.onrender.com`

## 🔒 Sécurité Production

### Variables Secrètes à Configurer
1. **JWT_SECRET** : Clé secrète pour l'authentification
2. **Database credentials** : Auto-générées par Render

### CORS et Domaines
Le serveur est configuré pour accepter les requêtes de votre domaine Render.

## 📱 Application Mobile

L'application mobile dans `/mobile` reste indépendante et peut être :
- Testée localement avec Expo
- Déployée sur les stores via Expo EAS
- Configurée pour pointer vers votre API Render

## 🔍 Vérifications Post-Déploiement

1. **Santé du service** : Vérifiez les logs Render
2. **Base de données** : Confirmez que les tables sont créées
3. **API endpoints** : Testez `/api/health` ou similaire
4. **Interface utilisateur** : Vérifiez le chargement du site

## 🛠️ Dépannage

### Erreurs Communes
- **Build failed** : Vérifiez les logs de build
- **Database connection** : Confirmez la `DATABASE_URL`
- **Port issues** : Le port est automatiquement configuré

### Logs et Monitoring
- Utilisez les logs Render pour diagnostiquer
- Surveillez les métriques de performance
- Configurez des alertes si nécessaire

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Render
2. Confirmez toutes les variables d'environnement
3. Testez localement avant le déploiement

Votre projet Otaku Nexus est maintenant prêt pour la production ! 🎌