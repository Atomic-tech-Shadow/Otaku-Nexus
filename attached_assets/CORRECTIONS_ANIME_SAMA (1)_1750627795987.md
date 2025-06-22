# Corrections Page Anime-Sama Existante
**Date**: 22 juin 2025  
**Version**: Corrections pour page fonctionnelle

## 🔧 Corrections à Appliquer sur Votre Page Existante

### 1. **Endpoint CORS Manquant** ⚠️ CRITIQUE
**Problème**: Pas d'endpoint `/api/embed/:episodeId` pour résoudre les problèmes CORS
**Correction**: 
```typescript
// Créer api/embed/[episodeId].ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuration CORS pour l'embed
  setCorsHeaders(res);
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  
  // Retourner page HTML avec iframe intégré
  const embedHtml = `<!DOCTYPE html>...`;
  return res.status(200).send(embedHtml);
}
```

### 2. **Configuration API avec URL Déployée** ⚠️ CRITIQUE
**Problème**: Doit utiliser l'URL de votre API déployée
**Correction**:
```javascript
// Configuration pour votre API déployée
const API_BASE = 'https://api-anime-sama.onrender.com';

// Alternative si vous préférez une variable d'environnement
const API_BASE = process.env.REACT_APP_API_URL || 'https://api-anime-sama.onrender.com';
```

### 3. **URL API dans le Code** ⚠️ CRITIQUE
**Problème**: Remplacer l'URL API locale par votre API déployée
**Correction**: Dans votre fichier anime-sama.tsx, modifier:
```javascript
// Trouver cette ligne dans votre code
const API_BASE = '/api';

// La remplacer par votre URL déployée
const API_BASE = 'https://api-anime-sama.onrender.com';
```

### 4. **Headers CORS pour Vidéo** ⚠️ CRITIQUE
**Problème**: Impossible d'intégrer les vidéos en iframe
**Correction**: Ajouter headers spécifiques dans l'endpoint embed
```typescript
res.setHeader('X-Frame-Options', 'ALLOWALL');
res.setHeader('Content-Security-Policy', "frame-ancestors *");
```

### 5. **Gestion d'Erreurs Vidéo**
**Problème**: Pas de fallback en cas d'erreur de chargement
**Correction**: Système de retry automatique
```javascript
function loadVideoSource(serverIndex) {
  videoFrame.onerror = function() {
    if (serverIndex + 1 < currentSources.length) {
      loadVideoSource(serverIndex + 1); // Essayer serveur suivant
    } else {
      displayVideoError('Aucune source disponible');
    }
  };
}
```

### 6. **Race Conditions**
**Problème**: États non protégés lors du changement de langue
**Correction**: Variable de verrouillage
```javascript
let languageChangeInProgress = false;

async function changeLanguage(newLanguage) {
  if (languageChangeInProgress) return;
  languageChangeInProgress = true;
  
  try {
    // Logique de changement
  } finally {
    languageChangeInProgress = false;
  }
}
```

### 7. **Cache et Performance**
**Problème**: Pas de cache pour éviter les requêtes répétées
**Correction**: Cache simple en mémoire
```javascript
const cache = new Map();

async function getCachedData(key, fetcher, ttl = 300000) {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < ttl) {
      return data;
    }
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 8. **Épisodes Vides API** ⚠️ CRITIQUE
**Problème**: L'API retourne parfois des tableaux d'épisodes vides même avec "success":true
**Exemple**: "tis-time-for-torture-princess" retourne "episodes":[] et "totalEpisodes":0

**Correction**: Validation et fallback intelligent
```javascript
async function loadSeasonEpisodes(animeId, seasonNumber, seasonName) {
  try {
    // Tenter plusieurs langues et méthodes
    const languages = ['VOSTFR', 'VF'];
    let validEpisodes = [];
    
    for (const lang of languages) {
      const response = await fetch(`${API_BASE}/api/seasons?animeId=${animeId}&seasonNumber=${seasonNumber}&language=${lang}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        validEpisodes = data.data;
        selectedLanguage = lang;
        break;
      }
    }
    
    // Si aucun épisode trouvé, essayer méthodes alternatives
    if (validEpisodes.length === 0) {
      // Essayer endpoint content
      const contentResponse = await fetch(`${API_BASE}/api/content?animeId=${animeId}&type=episodes`);
      const contentData = await contentResponse.json();
      
      if (contentData.success && contentData.data && contentData.data.length > 0) {
        validEpisodes = contentData.data;
      } else {
        // Dernière tentative avec catalogue
        const catalogueResponse = await fetch(`${API_BASE}/api/catalogue?search=${animeId}`);
        const catalogueData = await catalogueResponse.json();
        
        if (catalogueData.success && catalogueData.data) {
          const animeInfo = catalogueData.data.find(a => a.id === animeId);
          if (animeInfo && animeInfo.seasons && animeInfo.seasons[seasonNumber - 1]) {
            const season = animeInfo.seasons[seasonNumber - 1];
            // Générer des épisodes basés sur episodeCount
            validEpisodes = Array.from({ length: season.episodeCount }, (_, i) => ({
              id: `${animeId}-s${seasonNumber}-e${i + 1}`,
              episodeNumber: i + 1,
              title: `Épisode ${i + 1}`,
              language: 'VOSTFR'
            }));
          }
        }
      }
    }
    
    if (validEpisodes.length === 0) {
      throw new Error(`Aucun épisode disponible pour ${seasonName}. Cet anime pourrait ne pas être encore disponible.`);
    }
    
    // Continuer avec les épisodes trouvés...
    
  } catch (error) {
    console.error('Erreur saison:', error);
    displayError('playerContainer', `Erreur: ${error.message}`);
  }
}
```

## 📋 Checklist des Corrections (Page Existante)

- [ ] Ajouter endpoint `api/embed/[episodeId].ts` à votre API
- [ ] Modifier `API_BASE` dans votre page anime-sama existante
- [ ] Améliorer gestion d'erreurs vidéo avec retry
- [ ] Protéger changements de langue contre race conditions
- [ ] Optimiser avec système de cache
- [ ] **Corriger problème épisodes vides avec fallback intelligent**

## 🎯 Résultat Attendu

Votre page anime-sama existante aura:
- ✅ Lecteur vidéo sans erreurs CORS
- ✅ Meilleure gestion d'erreurs
- ✅ Performance optimisée
- ✅ Changements de langue fluides

## 📝 Instructions pour l'IA

**À modifier dans votre page anime-sama existante:**

1. **Endpoint API manquant** - Ajouter `/api/embed/[episodeId].ts` dans votre backend
2. **URL API** - Remplacer l'URL locale par votre API déployée
3. **Gestion d'erreurs** - Améliorer le système de retry vidéo
4. **Race conditions** - Protéger les changements de langue
5. **Cache** - Optimiser les performances

**Important**: Modifier uniquement votre page existante, ne pas créer de nouvelles pages.