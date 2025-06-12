# Guide d'installation - Application Mobile Otaku

Ce guide vous explique comment installer et utiliser l'application mobile React Native Expo Go basée sur votre plateforme web Otaku.

## Vue d'ensemble

L'application mobile comprend :
- Interface d'authentification avec connexion/inscription
- Écran d'accueil avec navigation rapide vers les fonctionnalités
- Système de découverte d'anime avec recherche et favoris
- Quiz interactifs avec système de points XP
- Profil utilisateur avec statistiques et niveaux

## Installation rapide

### Prérequis
- Node.js 16+ installé sur votre ordinateur
- Téléphone Android ou iOS
- Application "Expo Go" installée sur votre téléphone

### Étapes d'installation

1. **Naviguer vers le dossier mobile**
   ```bash
   cd mobile
   ```

2. **Lancer l'installation automatique**
   
   **Sur Linux/Mac :**
   ```bash
   ./install.sh
   ```
   
   **Sur Windows :**
   ```bash
   install.bat
   ```

3. **Démarrer l'application**
   ```bash
   npm start
   ```

4. **Scanner le QR code**
   - Ouvrez "Expo Go" sur votre téléphone
   - Scannez le QR code affiché dans votre terminal
   - L'application se lancera automatiquement

## Configuration de l'API

L'application mobile doit se connecter à votre serveur web. Modifiez l'URL dans le fichier `mobile/src/services/api.ts` :

```typescript
const API_BASE_URL = 'http://VOTRE_ADRESSE_IP:5000/api';
```

**Important :** 
- Remplacez `localhost` par l'adresse IP de votre ordinateur sur le réseau local
- Assurez-vous que votre serveur web fonctionne avant de tester l'application mobile

## Fonctionnalités disponibles

### Authentification
- Connexion avec email/mot de passe
- Inscription de nouveaux utilisateurs
- Gestion automatique des tokens JWT

### Découverte d'anime
- Liste des anime tendance
- Recherche par titre
- Ajout/suppression des favoris
- Affichage des détails (synopsis, score, nombre d'épisodes)

### Système de quiz
- Quiz interactifs avec questions à choix multiple
- Timer en temps réel
- Système de scoring avec pourcentages
- Récompenses XP basées sur les performances
- Quiz du jour mis en avant

### Profil utilisateur
- Affichage des statistiques personnelles
- Système de niveaux basé sur l'XP
- Barre de progression vers le niveau suivant
- Modification des informations personnelles
- Historique des quiz complétés

## Structure technique

### Architecture
- **React Native** avec Expo SDK 49
- **TypeScript** pour la sécurité des types
- **React Navigation** pour la navigation entre écrans
- **AsyncStorage** pour la persistance des données
- **React Hook Form** pour la gestion des formulaires

### Communication avec l'API
- Authentification JWT automatique
- Gestion des erreurs réseau
- Cache local des données utilisateur
- Refresh automatique des données

## Personnalisation

### Couleurs et thème
Les couleurs principales sont définies dans les fichiers de style de chaque écran :
- Violet/Bleu pour les quiz
- Rouge pour les anime
- Dégradés pour les en-têtes

### Assets
Remplacez les fichiers dans `mobile/assets/` :
- `icon.png` : Icône de l'application (1024x1024)
- `splash.png` : Écran de démarrage (1284x2778)
- `adaptive-icon.png` : Icône adaptative Android (1024x1024)

## Dépannage

### Problèmes de connexion
1. Vérifiez que votre serveur web fonctionne (`http://localhost:5000`)
2. Assurez-vous que votre téléphone et ordinateur sont sur le même réseau WiFi
3. Remplacez `localhost` par l'IP locale de votre ordinateur

### Erreurs d'installation
1. Supprimez le dossier `node_modules` : `rm -rf node_modules`
2. Réinstallez les dépendances : `npm install --force`
3. Redémarrez le serveur Metro : `npm start --clear`

### Problèmes de QR code
1. Assurez-vous qu'Expo Go est installé et à jour
2. Vérifiez que la caméra de votre téléphone fonctionne
3. Essayez de saisir manuellement l'URL affichée dans Expo Go

## Déploiement

Pour publier l'application sur les stores :

1. **Configuration**
   ```bash
   expo build:android  # Pour Android
   expo build:ios      # Pour iOS
   ```

2. **Publication**
   - Android : Upload de l'APK sur Google Play Console
   - iOS : Upload de l'IPA sur App Store Connect

## Support

L'application est testée et compatible avec :
- **Android** : Version 5.0+ (API niveau 21+)
- **iOS** : Version 11.0+
- **Expo** : SDK 49+

Pour toute question ou problème, vérifiez d'abord que votre serveur web fonctionne correctement et que la configuration de l'API est appropriée.