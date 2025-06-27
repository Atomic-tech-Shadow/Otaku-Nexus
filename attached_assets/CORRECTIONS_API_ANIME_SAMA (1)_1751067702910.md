# Corrections pour l'intégration Frontend avec l'API Anime Sama

## URL de l'API déployée
```
https://api-anime-sama.onrender.com
```

## ⚠️ Mise à jour importante - Système universel
L'API utilise maintenant un système universel qui calcule automatiquement la numérotation des épisodes pour tous les animes sans configuration spécifique. La saison 7 de My Hero Academia génère automatiquement les épisodes 139-159, la saison 11 de One Piece les épisodes 1087-1122.

## Erreurs identifiées et corrections

### 1. Configuration API vide (Critique)

**❌ Erreur dans anime-sama.tsx ligne 58:**
```typescript
const API_BASE_URL = '';
```

**✅ Correction:**
```typescript
const API_BASE_URL = 'https://api-anime-sama.onrender.com';
```

### 2. Headers API manquants

**✅ Headers requis:**
```typescript
const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Origin': window.location.origin
};
```

### 3. Gestion d'erreurs insuffisante

**✅ Fonction de requête corrigée avec timeout et retry:**
```typescript
const apiRequest = async (endpoint, options = {}) => {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      // Timeout de 30 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: API_HEADERS,
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      attempt++;
      if (attempt === maxRetries || error.name === 'AbortError') {
        console.error('Erreur API après', maxRetries, 'tentatives:', error);
        throw error;
      }
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

### 4. Endpoints API validés

**✅ Endpoints fonctionnels avec l'API déployée:**

```typescript
// Recherche d'animes
const searchAnimes = async (query) => {
  const response = await apiRequest(`/api/search?query=${encodeURIComponent(query)}`);
  return response;
};

// Détails d'un anime
const getAnimeDetails = async (animeId) => {
  const response = await apiRequest(`/api/anime/${animeId}`);
  return response;
};

// Saisons et épisodes (ENDPOINT VALIDÉ)
const getSeasonEpisodes = async (animeId, seasonNumber, language = 'VOSTFR') => {
  const response = await apiRequest(`/api/seasons?animeId=${animeId}&season=${seasonNumber}&language=${language}`);
  return response;
};

// Sources de streaming d'un épisode
const getEpisodeSources = async (episodeId) => {
  const response = await apiRequest(`/api/episode/${episodeId}`);
  return response;
};

// Catalogue complet
const getCatalogue = async () => {
  const response = await apiRequest('/api/catalogue');
  return response;
};

// Animes populaires
const getTrending = async () => {
  const response = await apiRequest('/api/trending');
  return response;
};
```

### 5. Génération automatique des ID d'épisodes (Système universel)

**✅ L'API génère automatiquement les ID avec la vraie numérotation:**
```typescript
// L'API calcule automatiquement les numéros d'épisodes corrects
// My Hero Academia Saison 7 = Episodes 139-159
// One Piece Saison 11 = Episodes 1087-1122
// Aucune configuration manuelle requise

// Les ID sont générés automatiquement par l'endpoint /api/seasons
const response = await fetch(`${API_BASE_URL}/api/seasons?animeId=${animeId}&season=${seasonNumber}&language=${language}`);

// Retourne automatiquement:
// "my-hero-academia-139-vostfr", "my-hero-academia-140-vostfr", etc.
// "one-piece-1087-vostfr", "one-piece-1088-vostfr", etc.
```

### 6. Gestion des erreurs de streaming

**✅ Gestion robuste des sources vidéo:**
```typescript
const handleVideoError = (error, sources, currentPlayerIndex, setPlayerIndex, setError) => {
  console.error('Erreur lecteur vidéo:', error);
  
  // Essayer le serveur suivant
  if (sources.length > currentPlayerIndex + 1) {
    setPlayerIndex(currentPlayerIndex + 1);
  } else {
    setError('Aucune source vidéo fonctionnelle disponible');
  }
};
```

### 7. Configuration d'environnement

**✅ Configuration pour différents environnements:**
```typescript
const getApiBaseUrl = () => {
  // Production déployée
  if (process.env.NODE_ENV === 'production') {
    return 'https://api-anime-sama.onrender.com';
  }
  
  // Développement local
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  
  // Par défaut: API déployée
  return 'https://api-anime-sama.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
```

## Exemple d'implémentation complète

**✅ Configuration finale recommandée:**
```typescript
import React, { useState, useEffect } from 'react';

// Configuration API
const API_BASE_URL = 'https://api-anime-sama.onrender.com';
const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Fonction de requête robuste
const apiRequest = async (endpoint, options = {}) => {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: API_HEADERS,
        signal: controller.signal,
        ...options
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      attempt++;
      if (attempt === maxRetries || error.name === 'AbortError') {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Utilisation dans le composant
const AnimePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('/api/search?query=naruto');
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Rest of component...
};
```

## Tests de validation

**✅ URLs de test avec l'API déployée et système universel:**
```
https://api-anime-sama.onrender.com/api/health
https://api-anime-sama.onrender.com/api/search?query=naruto
https://api-anime-sama.onrender.com/api/anime/one-piece
https://api-anime-sama.onrender.com/api/seasons?animeId=one-piece&season=11&language=VOSTFR
https://api-anime-sama.onrender.com/api/episode/one-piece-1087-vostfr
https://api-anime-sama.onrender.com/api/seasons?animeId=my-hero-academia&season=7&language=VOSTFR
https://api-anime-sama.onrender.com/api/episode/my-hero-academia-139-vostfr
```

**🔄 Système universel validé:**
- One Piece Saison 11 → Episodes 1087-1122 (auto-calculé)
- My Hero Academia Saison 7 → Episodes 139-159 (auto-calculé)
- Fonctionne avec n'importe quel anime sans configuration

## Résumé des corrections

1. **Remplacer `API_BASE_URL = ''`** par l'URL déployée
2. **Ajouter gestion d'erreurs** avec timeout et retry
3. **Utiliser les endpoints validés** (notamment `/api/seasons`)
4. **Utiliser le système universel** - L'API calcule automatiquement les ID d'épisodes corrects
5. **Ajouter headers appropriés** pour les requêtes
6. **Gérer les erreurs de streaming** avec fallback automatique

## ⚡ Nouvelle fonctionnalité: Système universel de numérotation

L'API utilise maintenant un système universel qui:
- **Calcule automatiquement** la numérotation des épisodes pour tous les animes
- **Fonctionne sans configuration** spécifique par anime
- **Génère les vrais numéros** d'épisodes (ex: My Hero Academia S7 = Episodes 139-159)
- **Respecte la continuité** des saisons précédentes

**Votre frontend n'a besoin d'aucune modification** pour utiliser cette fonctionnalité - l'endpoint `/api/seasons` retourne automatiquement les bons ID d'épisodes.

Toutes ces corrections permettront à votre frontend de fonctionner parfaitement avec l'API Anime Sama déployée et son système universel.