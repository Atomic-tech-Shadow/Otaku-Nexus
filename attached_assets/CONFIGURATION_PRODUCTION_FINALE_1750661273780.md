# Configuration Production Finale - API Anime-Sama

## URL de Production Exclusive

Toutes les configurations utilisent désormais **exclusivement** l'URL de production :
```
https://api-anime-sama.onrender.com
```

## Configuration API Mise à Jour

### api-config.js - Configuration Finale
```javascript
export const API_CONFIG = {
  // URL de production (exclusive)
  PRODUCTION_URL: 'https://api-anime-sama.onrender.com',
  
  // URL par défaut (production uniquement)
  BASE_URL: 'https://api-anime-sama.onrender.com',
  
  // Timeout pour les requêtes (en ms)
  TIMEOUT: 10000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Fonctions API avec URL de production
export const AnimeAPI = {
  // Recherche (corrigée avec query=)
  search: (query) => apiRequest(`https://api-anime-sama.onrender.com/api/search?query=${encodeURIComponent(query)}`),
  
  // Détails anime
  getAnime: (animeId) => apiRequest(`https://api-anime-sama.onrender.com/api/anime/${animeId}`),
  
  // Épisodes par saison (corrigée avec tous les paramètres)
  getSeasonEpisodes: (animeId, season, language = 'vostfr') => 
    apiRequest(`https://api-anime-sama.onrender.com/api/seasons?animeId=${animeId}&season=${season}&language=${language}`),
  
  // Sources d'épisodes
  getEpisodeSources: (episodeId) => apiRequest(`https://api-anime-sama.onrender.com/api/episode/${episodeId}`),
  
  // Trending
  getTrending: () => apiRequest('https://api-anime-sama.onrender.com/api/trending'),
  
  // Santé API
  getHealth: () => apiRequest('https://api-anime-sama.onrender.com/api/health')
};
```

## Correction des Bugs avec URL Production

### 1. Chargement des Épisodes
```javascript
async function loadSeasonEpisodes(animeId, seasonNumber, language) {
  try {
    const response = await fetch(`https://api-anime-sama.onrender.com/api/seasons?animeId=${animeId}&season=${seasonNumber}&language=${language}`);
    const data = await response.json();
    
    if (data.success) {
      // Corriger les numéros d'épisodes avec mapping One Piece
      const correctedEpisodes = correctEpisodeNumbers(animeId, seasonNumber, data.data.episodes);
      return correctedEpisodes;
    }
    
    return [];
  } catch (error) {
    console.error('Erreur chargement épisodes:', error);
    return [];
  }
}
```

### 2. Lecteur Vidéo avec Production URL
```javascript
// Créer le lecteur avec URL de production pour embed
function createVideoPlayer(episodeId) {
  const iframe = document.createElement('iframe');
  iframe.src = `https://api-anime-sama.onrender.com/api/embed/${episodeId}`;
  iframe.width = '100%';
  iframe.height = '500px';
  iframe.frameBorder = '0';
  iframe.allowFullscreen = true;
  iframe.style.border = 'none';
  
  return iframe;
}
```

### 3. Gestion des Sources avec Production URL
```javascript
async function loadEpisodeWithServers(episodeId) {
  try {
    const response = await fetch(`https://api-anime-sama.onrender.com/api/episode/${episodeId}`);
    const data = await response.json();
    
    if (data.success && data.data.sources.length > 0) {
      return {
        episodeId: episodeId,
        title: data.data.title,
        sources: data.data.sources,
        embedUrl: `https://api-anime-sama.onrender.com${data.data.embedUrl}`,
        availableServers: data.data.availableServers
      };
    }
    
    throw new Error('Aucune source trouvée');
  } catch (error) {
    console.error('Erreur chargement épisode:', error);
    return null;
  }
}
```

## Tests de Validation Production

### Endpoints Testés avec Production URL
```bash
# Santé API
curl "https://api-anime-sama.onrender.com/api/health"

# Recherche
curl "https://api-anime-sama.onrender.com/api/search?query=one+piece"

# Détails anime
curl "https://api-anime-sama.onrender.com/api/anime/one-piece"

# Épisodes One Piece
curl "https://api-anime-sama.onrender.com/api/episode/one-piece-episode-1093-vf"
curl "https://api-anime-sama.onrender.com/api/episode/one-piece-episode-1093-vostfr"

# Embed lecteur
curl "https://api-anime-sama.onrender.com/api/embed/one-piece-episode-1093-vf"
```

## Mapping One Piece Production

```javascript
const ONE_PIECE_MAPPINGS = {
  1: { start: 1, end: 61, name: "Saga 1 (East Blue)" },
  2: { start: 62, end: 135, name: "Saga 2 (Alabasta)" },
  3: { start: 136, end: 206, name: "Saga 3 (Ile céleste)" },
  4: { start: 207, end: 325, name: "Saga 4 (Water Seven)" },
  5: { start: 326, end: 384, name: "Saga 5 (Thriller Bark)" },
  6: { start: 385, end: 516, name: "Saga 6 (Guerre au Sommet)" },
  7: { start: 517, end: 574, name: "Saga 7 (Ile des Hommes-Poissons)" },
  8: { start: 575, end: 746, name: "Saga 8 (Dressrosa)" },
  9: { start: 747, end: 889, name: "Saga 9 (Ile Tougato)" },
  10: { start: 890, end: 1086, name: "Saga 10 (Pays des Wa)" },
  11: { start: 1087, end: 1122, name: "Saga 11 (Egghead)" }
};

function getCorrectEpisodeNumbers(seasonNumber) {
  const mapping = ONE_PIECE_MAPPINGS[seasonNumber];
  if (!mapping) return [];
  
  const episodes = [];
  for (let i = mapping.start; i <= mapping.end; i++) {
    episodes.push({
      episodeNumber: i,
      title: `Episode ${i}`,
      id: `one-piece-episode-${i}-vostfr`,
      embedUrl: `https://api-anime-sama.onrender.com/api/embed/one-piece-episode-${i}-vostfr`
    });
  }
  
  return episodes;
}
```

## Classe Player Production Complète

```javascript
class AnimeSamaPlayerProduction {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiBase = 'https://api-anime-sama.onrender.com';
    this.currentEpisode = null;
    this.currentSources = [];
  }
  
  async loadEpisode(episodeId) {
    try {
      this.showLoading();
      
      const response = await fetch(`${this.apiBase}/api/episode/${episodeId}`);
      const data = await response.json();
      
      if (data.success) {
        this.currentEpisode = {
          id: episodeId,
          title: data.data.title,
          embedUrl: `${this.apiBase}${data.data.embedUrl}`,
          sources: data.data.sources
        };
        
        this.renderPlayer();
      } else {
        this.showError('Épisode non trouvé');
      }
      
    } catch (error) {
      console.error('Erreur chargement:', error);
      this.showError('Erreur de connexion à l\'API');
    }
  }
  
  renderPlayer() {
    this.container.innerHTML = `
      <div class="production-player" style="background: #1a1a1a; border-radius: 8px; overflow: hidden;">
        <div class="player-header" style="background: #000; color: white; padding: 15px;">
          <h3>${this.currentEpisode.title}</h3>
          <small>Production API: api-anime-sama.onrender.com</small>
        </div>
        
        <div class="video-container" style="position: relative; background: #000;">
          <iframe 
            src="${this.currentEpisode.embedUrl}" 
            width="100%" 
            height="500px" 
            frameborder="0" 
            allowfullscreen
            style="border: none;"
          ></iframe>
        </div>
        
        <div class="server-info" style="padding: 15px; background: #111; color: white;">
          <div>Serveurs disponibles: ${this.currentEpisode.sources.length}</div>
          <div>API Status: ✅ Production</div>
        </div>
      </div>
    `;
  }
  
  showLoading() {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 50px; color: white; background: #1a1a1a; border-radius: 8px;">
        <div style="font-size: 18px; margin-bottom: 10px;">Chargement depuis production...</div>
        <div style="font-size: 12px; color: #666;">api-anime-sama.onrender.com</div>
      </div>
    `;
  }
  
  showError(message) {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 50px; color: white; background: #1a1a1a; border-radius: 8px;">
        <div style="font-size: 18px; color: #ef4444; margin-bottom: 20px;">${message}</div>
        <div style="font-size: 12px; color: #666;">Vérifiez la connexion à api-anime-sama.onrender.com</div>
      </div>
    `;
  }
}
```

## Instructions pour l'IA

### Configuration Exclusive Production
1. **Remplacer** toutes les références `localhost:5000` par `https://api-anime-sama.onrender.com`
2. **Utiliser** la classe `AnimeSamaPlayerProduction` pour le lecteur vidéo
3. **Appliquer** le mapping One Piece pour les numéros d'épisodes corrects
4. **Implémenter** les corrections CORS avec les endpoints `/api/embed/`

### Résultat Attendu
- ✅ Saga 11 One Piece : épisodes 1087-1122 (au lieu de 261-286)
- ✅ Lecteur vidéo sans erreurs CORS
- ✅ API production stable et rapide
- ✅ Sources multiples fonctionnelles

Toute la configuration est maintenant alignée sur l'API de production déployée.