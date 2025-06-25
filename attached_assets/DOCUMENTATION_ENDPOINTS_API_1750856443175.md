# Documentation Complète des Endpoints API Anime-Sama

## URL de l'API Déployée
**Production:** `https://api-anime-sama.onrender.com`
**Local (développement):** `http://localhost:5000`

---

## 🏥 ENDPOINTS DE SANTÉ & SURVEILLANCE

### 1. GET `/api/health`
**Fonction:** Vérification de l'état de santé du serveur
**Configuration:**
```javascript
// Test de base
fetch('https://api-anime-sama.onrender.com/api/health')
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "anime-sama-api",
    "version": "2.0.0",
    "environment": "vercel-serverless",
    "timestamp": "2025-06-25T12:57:43.891Z",
    "uptime": 108.579352752,
    "memory": {
      "used": 8,
      "total": 10,
      "external": 4
    },
    "platform": {
      "node": "v20.18.1",
      "platform": "linux",
      "arch": "x64"
    }
  }
}
```

### 2. GET `/api/status`
**Fonction:** État détaillé du système et statistiques
**Configuration:**
```javascript
fetch('https://api-anime-sama.onrender.com/api/status')
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "service": "anime-sama-api",
    "version": "2.0.0",
    "deployment": "vercel-serverless",
    "cache": {
      "size": 0,
      "activeKeys": 0,
      "sampleKeys": []
    },
    "endpoints": {
      "total": 12,
      "available": [
        "/api/search",
        "/api/anime/:id",
        "/api/episode/:id",
        "/api/trending",
        "/api/catalogue",
        "/api/genres",
        "/api/random",
        "/api/advanced-search",
        "/api/seasons",
        "/api/content",
        "/api/content-types",
        "/api/embed/:episodeId",
        "/api/proxy/:url"
      ]
    },
    "features": {
      "passiveAuthentication": true,
      "adBlocking": true,
      "rateLimiting": true,
      "caching": true,
      "multiLanguage": ["VF", "VOSTFR"],
      "videoServers": ["Sibnet", "Vidmoly", "SendVid", "Dailymotion", "YouTube"]
    }
  }
}
```

---

## 🔍 ENDPOINTS DE RECHERCHE

### 3. GET `/api/search`
**Fonction:** Recherche d'animes par titre
**Paramètres:**
- `query` (string, requis): Terme de recherche
- `q` (string, alternatif): Alias pour query

**Configuration:**
```javascript
// Recherche simple
fetch('https://api-anime-sama.onrender.com/api/search?query=naruto')

// Recherche avec caractères spéciaux
fetch('https://api-anime-sama.onrender.com/api/search?query=attack%20on%20titan')
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "naruto",
        "title": "Naruto",
        "url": "https://anime-sama.fr/catalogue/naruto",
        "genres": ["Action", "Aventure", "Arts martiaux", "Ninja"],
        "type": "Anime",
        "languages": ["VOSTFR", "VF"],
        "authentic": true
      }
    ],
    "totalResults": 1,
    "query": "naruto"
  }
}
```

### 4. GET `/api/advanced-search`
**Fonction:** Recherche avancée avec filtres
**Paramètres:**
- `genre` (string): Filtrer par genre
- `type` (string): "anime" ou "scan"
- `language` (string): "VF" ou "VOSTFR"
- `status` (string): Statut de l'anime

**Configuration:**
```javascript
fetch('https://api-anime-sama.onrender.com/api/advanced-search?genre=Action&type=anime&language=VOSTFR')
```

---

## 📚 ENDPOINTS DE CATALOGUE

### 5. GET `/api/catalogue`
**Fonction:** Liste complète des animes disponibles
**Paramètres:**
- `page` (number, optionnel): Numéro de page (défaut: 1)
- `limit` (number, optionnel): Nombre d'éléments par page (défaut: 20)
- `search` (string, optionnel): Filtrage par titre

**Configuration:**
```javascript
// Page 1 avec 20 éléments
fetch('https://api-anime-sama.onrender.com/api/catalogue')

// Page 2 avec 50 éléments
fetch('https://api-anime-sama.onrender.com/api/catalogue?page=2&limit=50')

// Recherche dans le catalogue
fetch('https://api-anime-sama.onrender.com/api/catalogue?search=demon')
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "anime-id",
        "title": "Titre de l'anime",
        "url": "https://anime-sama.fr/catalogue/anime-id",
        "authentic": true
      }
    ],
    "totalItems": 48,
    "totalPages": 3,
    "currentPage": 1,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "source": "anime-sama.fr",
    "authentic": true
  }
}
```

### 6. GET `/api/trending`
**Fonction:** Animes populaires/tendances
**Configuration:**
```javascript
fetch('https://api-anime-sama.onrender.com/api/trending')
```

### 7. GET `/api/random`
**Fonction:** Anime aléatoire pour découverte
**Configuration:**
```javascript
fetch('https://api-anime-sama.onrender.com/api/random')
```

### 8. GET `/api/genres`
**Fonction:** Liste de tous les genres disponibles
**Configuration:**
```javascript
fetch('https://api-anime-sama.onrender.com/api/genres')
```

---

## 🎬 ENDPOINTS D'ANIME & ÉPISODES

### 9. GET `/api/anime/:id`
**Fonction:** Détails complets d'un anime spécifique
**Paramètres:**
- `id` (string, requis): Identifiant de l'anime

**Configuration:**
```javascript
fetch('https://api-anime-sama.onrender.com/api/anime/naruto')
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "naruto",
    "title": "Naruto",
    "description": "Description de l'anime...",
    "genres": ["Action", "Aventure"],
    "seasons": [
      {
        "number": 1,
        "episodes": 220,
        "title": "Naruto"
      }
    ],
    "totalEpisodes": 220,
    "languages": ["VF", "VOSTFR"],
    "status": "Terminé",
    "authentic": true,
    "source": "anime-sama.fr"
  }
}
```

### 10. GET `/api/episode/:id`
**Fonction:** Sources de streaming pour un épisode
**Paramètres:**
- `id` (string, requis): ID de l'épisode au format "anime-id-episode-number"

**Configuration:**
```javascript
fetch('https://api-anime-sama.onrender.com/api/episode/naruto-1')
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "episodeId": "naruto-1",
    "animeId": "naruto",
    "episodeNumber": 1,
    "title": "Naruto - Épisode 1",
    "sources": [
      {
        "server": "Sibnet",
        "language": "VOSTFR",
        "quality": "HD",
        "url": "https://video.sibnet.ru/shell.php?videoid=...",
        "embed": true
      }
    ],
    "authentic": true
  }
}
```

---

## 🎥 ENDPOINTS D'INTÉGRATION VIDÉO

### 11. GET `/api/embed/:episodeId`
**Fonction:** Page d'intégration iframe pour les épisodes
**Paramètres:**
- `episodeId` (string, requis): ID de l'épisode

**Configuration:**
```javascript
// Intégration iframe
<iframe src="https://api-anime-sama.onrender.com/api/embed/naruto-1" 
        width="800" height="450" frameborder="0"></iframe>

// Requête directe
fetch('https://api-anime-sama.onrender.com/api/embed/naruto-1')
```

### 12. GET `/api/proxy/:url`
**Fonction:** Proxy pour contourner les restrictions CORS
**Paramètres:**
- `url` (string, requis): URL à proxifier (encodée)

**Configuration:**
```javascript
const videoUrl = encodeURIComponent('https://video.server.com/video.mp4');
fetch(`https://api-anime-sama.onrender.com/api/proxy/${videoUrl}`)
```

---

## 📄 ENDPOINTS DE CONTENU

### 13. GET `/api/content`
**Fonction:** Contenu général de la plateforme
**Configuration:**
```javascript
fetch('https://api-anime-sama.onrender.com/api/content')
```

### 14. GET `/api/content-types`
**Fonction:** Types de contenu disponibles
**Configuration:**
```javascript
fetch('https://api-anime-sama.onrender.com/api/content-types')
```

### 15. GET `/api/seasons`
**Fonction:** Informations sur les saisons d'animes
**Configuration:**
```javascript
fetch('https://api-anime-sama.onrender.com/api/seasons')
```

---

## 🔧 CONFIGURATION TECHNIQUE

### Headers CORS
```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
  'X-Frame-Options': 'ALLOWALL',
  'Content-Security-Policy': 'frame-ancestors *'
};
```

### Gestion d'Erreurs
```javascript
// Exemple de gestion d'erreur
fetch('https://api-anime-sama.onrender.com/api/anime/invalid-id')
  .then(response => response.json())
  .then(data => {
    if (!data.success) {
      console.error('Erreur API:', data.error);
    }
  });
```

### Rate Limiting
- **Limite:** 100 requêtes par minute par IP
- **Fenêtre:** 60 secondes glissantes

### Cache
- **TTL:** 5 minutes par défaut
- **Basé sur:** Paramètres de requête et endpoint

---

## 🚀 EXEMPLES D'INTÉGRATION

### Exemple JavaScript Frontend
```javascript
class AnimeSamaAPI {
  constructor() {
    this.baseURL = 'https://api-anime-sama.onrender.com';
  }

  async searchAnime(query) {
    const response = await fetch(`${this.baseURL}/api/search?query=${encodeURIComponent(query)}`);
    return response.json();
  }

  async getAnimeDetails(id) {
    const response = await fetch(`${this.baseURL}/api/anime/${id}`);
    return response.json();
  }

  async getEpisodeSources(episodeId) {
    const response = await fetch(`${this.baseURL}/api/episode/${episodeId}`);
    return response.json();
  }
}

// Utilisation
const api = new AnimeSamaAPI();
api.searchAnime('naruto').then(console.log);
```

### Exemple React/Vue/Angular
```javascript
// Hook React
import { useState, useEffect } from 'react';

function useAnimeSama() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchAnime = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api-anime-sama.onrender.com/api/search?query=${query}`);
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return { searchAnime, loading, error };
}
```

---

## ✅ TESTS DE VALIDATION

Tous les endpoints ont été testés et sont **FONCTIONNELS** ✅

- [x] Health check opérationnel
- [x] Status avec statistiques détaillées  
- [x] Catalogue avec 48+ animes authentiques
- [x] Recherche fonctionnelle
- [x] Sources vidéo extraites depuis anime-sama.fr
- [x] CORS configuré pour intégration iframe
- [x] Rate limiting actif
- [x] Cache système opérationnel

**Dernière validation:** 25 juin 2025, 12:57 UTC
**Source de données:** anime-sama.fr (authentique)
**Statut:** Production Ready ✅