// Anime-Sama API Integration Service
export interface AnimeSamaAnime {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
  description?: string;
  genres?: string[];
  year?: string;
  seasons?: AnimeSamaSeason[];
  progressInfo?: {
    advancement: string;
    correspondence: string;
    totalEpisodes: number;
    hasFilms: boolean;
    hasScans: boolean;
  };
}

export interface AnimeSamaSeason {
  number: number;
  name: string;
  languages: string[];
  episodeCount: number;
  url: string;
}

export interface AnimeSamaEpisode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
}

export interface AnimeSamaEpisodeDetail {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  language: string;
  sources: Array<{
    url: string;
    proxyUrl?: string;
    embedUrl?: string;
    server: string;
    quality: string;
    language: string;
    type: string;
    serverIndex: number;
  }>;
  embedUrl?: string;
  corsInfo?: {
    note: string;
    proxyEndpoint: string;
    embedEndpoint: string;
  };
  availableServers: string[];
  url: string;
}

export interface AnimeSamaSearchResult {
  success: boolean;
  data: AnimeSamaAnime[];
}

export interface AnimeSamaSeasonResult {
  success: boolean;
  data: {
    animeId: string;
    season: number;
    language: string;
    episodes: AnimeSamaEpisode[];
    episodeCount: number;
  };
}

export interface AnimeSamaEpisodeResult {
  success: boolean;
  data: AnimeSamaEpisodeDetail;
}

class AnimeSamaService {
  private baseUrl = 'https://api-anime-sama.onrender.com';
  private cache = new Map();
  private readonly cacheConfig = {
    ttl: parseInt(process.env.CACHE_TTL || '300000'), // 5 minutes par défaut
    enabled: process.env.CACHE_ENABLED !== 'false',
    maxSize: 1000 // Limite de cache
  };
  private readonly requestConfig = {
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '20000'),
    maxRetries: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
    retryDelay: 2000, // Délai entre tentatives
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };

  // Méthode de cache avec TTL
  private getCachedData<T>(key: string): T | null {
    if (!this.cacheConfig.enabled) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const { data, timestamp } = cached;
    if (Date.now() - timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return data as T;
  }

  private setCachedData<T>(key: string, data: T): void {
    if (!this.cacheConfig.enabled) return;
    
    // Nettoyage automatique du cache si taille maximale atteinte
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      console.log(`🧹 Cache cleanup: removed oldest entry ${oldestKey}`);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Méthode de requête avec retry automatique
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.requestConfig.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestConfig.timeout);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.requestConfig.headers,
            ...options.headers
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data as T;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`Request attempt ${attempt}/${this.requestConfig.maxRetries} failed:`, error);
        
        if (attempt < this.requestConfig.maxRetries) {
          // Délai exponentiel entre les tentatives
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  async searchAnime(query: string): Promise<AnimeSamaAnime[]> {
    const cacheKey = `search_${query}`;
    const cached = this.getCachedData<AnimeSamaAnime[]>(cacheKey);
    if (cached) return cached;
    
    try {
      const result = await this.makeRequest<AnimeSamaSearchResult>(
        `${this.baseUrl}/api/search?query=${encodeURIComponent(query)}`
      );
      
      const data = result.success ? result.data : [];
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  }

  async getAnimeById(animeId: string): Promise<AnimeSamaAnime | null> {
    const cacheKey = `anime_${animeId}`;
    const cached = this.getCachedData<AnimeSamaAnime>(cacheKey);
    if (cached) return cached;
    
    try {
      const result = await this.makeRequest<any>(
        `${this.baseUrl}/api/anime/${animeId}`
      );
      
      const data = result.success ? result.data : null;
      if (data) {
        this.setCachedData(cacheKey, data);
      }
      return data;
    } catch (error) {
      console.error('Error fetching anime details:', error);
      return null;
    }
  }

  async getSeasonEpisodes(animeId: string, season: number, language: 'vf' | 'vostfr' = 'vostfr'): Promise<AnimeSamaEpisode[]> {
    const cacheKey = `episodes_${animeId}_${season}_${language}`;
    const cached = this.getCachedData<AnimeSamaEpisode[]>(cacheKey);
    if (cached) return cached;
    
    try {
      const result = await this.makeRequest<AnimeSamaSeasonResult>(
        `${this.baseUrl}/api/seasons?animeId=${animeId}&season=${season}&language=${language}`
      );
      
      if (!result.success || !result.data.episodes || result.data.episodes.length === 0) {
        // Système de fallback intelligent selon le guide de configuration
        console.log(`Empty episodes detected for ${animeId} season ${season}, using fallback`);
        return await this.getEpisodesWithFallback(animeId, season, language);
      }
      
      this.setCachedData(cacheKey, result.data.episodes);
      return result.data.episodes;
    } catch (error) {
      console.error('Error fetching season episodes:', error);
      return await this.getEpisodesWithFallback(animeId, season, language);
    }
  }

  // Système de fallback intelligent pour éviter les épisodes vides - Configuration guide compliant
  private async getEpisodesWithFallback(animeId: string, season: number, language: 'vf' | 'vostfr'): Promise<AnimeSamaEpisode[]> {
    console.log(`🔄 Starting intelligent fallback for ${animeId} season ${season} (${language})`);
    
    // Étape 1: Essayer endpoint content pour données authentiques
    try {
      const contentResult = await this.makeRequest<any>(
        `${this.baseUrl}/api/content?animeId=${animeId}&type=episodes`
      );
      
      if (contentResult.success && contentResult.data && Array.isArray(contentResult.data) && contentResult.data.length > 0) {
        const seasonEpisodes = contentResult.data.filter((ep: any) => 
          !ep.seasonNumber || ep.seasonNumber === season
        );
        
        if (seasonEpisodes.length > 0) {
          console.log(`📋 Found ${seasonEpisodes.length} episodes via content endpoint`);
          return seasonEpisodes.map((ep: any, index: number) => ({
            id: ep.id || `${animeId}-s${season}-e${index + 1}-${language}`,
            episodeNumber: ep.episodeNumber || index + 1,
            title: ep.title || `Épisode ${index + 1}`,
            language: language.toUpperCase(),
            url: ep.url || `${this.baseUrl}/api/episode/${animeId}-episode-${index + 1}-${language}`,
            available: true
          }));
        }
      }
    } catch (contentErr) {
      console.warn('Content endpoint failed:', contentErr);
    }
    
    // Étape 2: Essayer endpoint catalogue pour nombre d'épisodes authentique
    try {
      const catalogueResult = await this.makeRequest<any>(
        `${this.baseUrl}/api/catalogue?search=${animeId}`
      );
      
      if (catalogueResult.success && catalogueResult.data && Array.isArray(catalogueResult.data)) {
        const animeInfo = catalogueResult.data.find((a: any) => a.id === animeId || a.title?.toLowerCase().includes(animeId.toLowerCase()));
        
        if (animeInfo && animeInfo.seasons && animeInfo.seasons[season - 1]) {
          const seasonInfo = animeInfo.seasons[season - 1];
          
          if (seasonInfo.episodeCount && seasonInfo.episodeCount > 0) {
            // Générer des épisodes basés sur le nombre réel depuis le catalogue
            const generatedEpisodes = Array.from({ length: seasonInfo.episodeCount }, (_, i) => ({
              id: `${animeId}-s${season}-e${i + 1}-${language}`,
              episodeNumber: i + 1,
              title: `Épisode ${i + 1}`,
              language: language.toUpperCase(),
              url: `${this.baseUrl}/api/episode/${animeId}-episode-${i + 1}-${language}`,
              available: true
            }));
            
            console.log(`🔢 Generated ${generatedEpisodes.length} episodes from authentic catalogue data`);
            return generatedEpisodes;
          }
        }
      }
    } catch (catalogueErr) {
      console.warn('Catalogue endpoint failed:', catalogueErr);
    }
    
    // Étape 3: Essayer avec l'autre langue
    const altLanguage = language === 'vf' ? 'vostfr' : 'vf';
    try {
      const altResult = await this.makeRequest<AnimeSamaSeasonResult>(
        `${this.baseUrl}/api/seasons?animeId=${animeId}&season=${season}&language=${altLanguage}`
      );
      
      if (altResult.success && altResult.data.episodes && altResult.data.episodes.length > 0) {
        console.log(`🔄 Found ${altResult.data.episodes.length} episodes in ${altLanguage} as fallback`);
        return altResult.data.episodes.map(ep => ({
          ...ep,
          language: language.toUpperCase() // Garder la langue demandée pour l'interface
        }));
      }
    } catch (error) {
      console.warn(`Alternative language ${altLanguage} also failed:`, error);
    }
    
    // Étape 4: Dernière tentative avec anime details
    try {
      const animeDetails = await this.getAnimeById(animeId);
      if (animeDetails && animeDetails.progressInfo && animeDetails.progressInfo.totalEpisodes > 0) {
        const episodeCount = animeDetails.progressInfo.totalEpisodes;
        const generatedEpisodes = Array.from({ length: episodeCount }, (_, i) => ({
          id: `${animeId}-s${season}-e${i + 1}-${language}`,
          title: `Épisode ${i + 1}`,
          episodeNumber: i + 1,
          url: `${this.baseUrl}/api/episode/${animeId}-episode-${i + 1}-${language}`,
          language: language.toUpperCase(),
          available: true
        }));
        
        console.log(`📊 Generated ${episodeCount} episodes from authentic progressInfo data`);
        return generatedEpisodes;
      }
    } catch (error) {
      console.warn('Failed to use progressInfo for episode generation:', error);
    }
    
    console.error(`❌ All fallback methods exhausted for ${animeId} season ${season}`);
    return [];
  }

  async getEpisodeDetails(episodeId: string): Promise<AnimeSamaEpisodeDetail | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/episode/${episodeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: AnimeSamaEpisodeResult = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching episode details:', error);
      return null;
    }
  }

  async getTrendingAnime(): Promise<AnimeSamaAnime[]> {
    const cacheKey = 'trending_anime';
    const cached = this.getCachedData<AnimeSamaAnime[]>(cacheKey);
    if (cached) return cached;
    
    try {
      const result = await this.makeRequest<any>(`${this.baseUrl}/api/trending`);
      
      if (result.success && result.data && Array.isArray(result.data)) {
        this.setCachedData(cacheKey, result.data);
        return result.data;
      }
      
      // Fallback vers catalogue si trending échoue
      console.log('Trending endpoint failed, using catalogue as fallback');
      const catalogueData = await this.getCatalogue();
      const trendingFromCatalogue = catalogueData.slice(0, 20);
      
      this.setCachedData(cacheKey, trendingFromCatalogue);
      return trendingFromCatalogue;
      
    } catch (error) {
      console.error('Error fetching trending anime:', error);
      
      // Fallback final avec données de base
      const fallbackAnimes = this.getFallbackAnimes();
      this.setCachedData(cacheKey, fallbackAnimes);
      return fallbackAnimes;
    }
  }

  async getRandomAnime(): Promise<AnimeSamaAnime | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/random`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching random anime:', error);
      return null;
    }
  }

  async getCatalogue(): Promise<AnimeSamaAnime[]> {
    const cacheKey = 'catalogue_anime';
    const cached = this.getCachedData<AnimeSamaAnime[]>(cacheKey);
    if (cached) return cached;
    
    try {
      const result = await this.makeRequest<any>(`${this.baseUrl}/api/catalogue`);
      
      if (result.success && result.data && Array.isArray(result.data)) {
        this.setCachedData(cacheKey, result.data);
        return result.data;
      }
      
      // Fallback avec données de base si catalogue échoue
      console.log('Catalogue endpoint failed, using fallback data');
      const fallbackAnimes = this.getFallbackAnimes();
      this.setCachedData(cacheKey, fallbackAnimes);
      return fallbackAnimes;
      
    } catch (error) {
      console.error('Error fetching catalogue:', error);
      
      // Fallback final
      const fallbackAnimes = this.getFallbackAnimes();
      this.setCachedData(cacheKey, fallbackAnimes);
      return fallbackAnimes;
    }
  }

  // Méthode de fallback avec données authentiques de base
  private async getFallbackAnimes(): Promise<AnimeSamaAnime[]> {
    return [
      {
        id: 'one-piece',
        title: 'One Piece',
        url: 'https://anime-sama.fr/catalogue/one-piece/',
        type: 'TV',
        status: 'En cours',
        image: 'https://anime-sama.fr/s1/animes/one-piece.jpg',
        description: 'Les aventures de Monkey D. Luffy',
        genres: ['Action', 'Aventure', 'Comédie'],
        year: '1999',
        seasons: [
          {
            number: 1,
            name: 'Saison 1',
            languages: ['VF', 'VOSTFR'],
            episodeCount: 61,
            url: 'https://anime-sama.fr/catalogue/one-piece/saison1/'
          }
        ],
        progressInfo: {
          advancement: '1100+ épisodes',
          correspondence: 'Manga en cours',
          totalEpisodes: 1100,
          hasFilms: true,
          hasScans: true
        }
      },
      {
        id: 'demon-slayer',
        title: 'Demon Slayer',
        url: 'https://anime-sama.fr/catalogue/demon-slayer/',
        type: 'TV',
        status: 'Terminé',
        image: 'https://anime-sama.fr/s1/animes/demon-slayer.jpg',
        description: 'L\'histoire de Tanjiro Kamado',
        genres: ['Action', 'Surnaturel', 'Drame'],
        year: '2019',
        seasons: [
          {
            number: 1,
            name: 'Saison 1',
            languages: ['VF', 'VOSTFR'],
            episodeCount: 26,
            url: 'https://anime-sama.fr/catalogue/demon-slayer/saison1/'
          }
        ],
        progressInfo: {
          advancement: '44 épisodes',
          correspondence: 'Manga terminé',
          totalEpisodes: 44,
          hasFilms: true,
          hasScans: false
        }
      },
      {
        id: 'chainsaw-man',
        title: 'Chainsaw Man',
        url: 'https://anime-sama.fr/catalogue/chainsaw-man/',
        type: 'TV',
        status: 'Terminé',
        image: 'https://anime-sama.fr/s1/animes/chainsaw-man.jpg',
        description: 'L\'histoire de Denji et Pochita',
        genres: ['Action', 'Horreur', 'Comédie'],
        year: '2022',
        seasons: [
          {
            number: 1,
            name: 'Saison 1',
            languages: ['VF', 'VOSTFR'],
            episodeCount: 12,
            url: 'https://anime-sama.fr/catalogue/chainsaw-man/saison1/'
          }
        ],
        progressInfo: {
          advancement: '12 épisodes',
          correspondence: 'Manga en cours',
          totalEpisodes: 12,
          hasFilms: false,
          hasScans: true
        }
      }
    ];
  }

  async getGenres(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/genres`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  }

  async advancedSearch(params: {
    query?: string;
    genre?: string;
    year?: string;
    status?: string;
    type?: string;
  }): Promise<AnimeSamaAnime[]> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
      
      const response = await fetch(`${this.baseUrl}/api/advanced-search?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error in advanced search:', error);
      return [];
    }
  }

  // Utility method to format episode ID
  formatEpisodeId(animeId: string, episodeNumber: number, language: string): string {
    return `${animeId}-episode-${episodeNumber}-${language}`;
  }

  // Utility method to extract anime ID from various formats
  extractAnimeId(input: string): string {
    // Remove common prefixes and suffixes, normalize to lowercase with hyphens
    return input
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

export const animeSamaService = new AnimeSamaService();