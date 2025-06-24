// api-config.js - Configuration API Anime-Sama pour Replit
export const API_CONFIG = {
  // URL de base - Replit déployé  
  BASE_URL: typeof window !== 'undefined' 
    ? (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000'
        : window.location.origin)
    : 'http://localhost:5000',
  
  // Endpoints corrects
  ENDPOINTS: {
    SEARCH: '/api/search?q=',           // ✅ 'q' pas 'query'
    ANIME: '/api/anime/',
    SEASONS: '/api/seasons',
    EPISODE: '/api/episode/',
    EMBED: '/api/embed/',
    TRENDING: '/api/trending',
    CONTENT: '/api/content',
    CATALOGUE: '/api/catalogue'
  },
  
  // Headers optimisés
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  },
  
  // Configuration timeout
  TIMEOUT: 15000,
  
  // Utilitaires
  buildEpisodeId: (animeId, episodeNumber, language) => {
    return `${animeId}-episode-${episodeNumber}-${language.toLowerCase()}`;
  },
  
  buildSearchUrl: (query) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH}${encodeURIComponent(query)}`;
  },
  
  buildEmbedUrl: (episodeId) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMBED}${episodeId}`;
  }
};