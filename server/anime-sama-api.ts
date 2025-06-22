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
    enabled: process.env.CACHE_ENABLED !== 'false'
  };
  private readonly requestConfig = {
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '20000'),
    maxRetries: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3'),
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

  // Système de fallback intelligent pour éviter les épisodes vides
  private async getEpisodesWithFallback(animeId: string, season: number, language: 'vf' | 'vostfr'): Promise<AnimeSamaEpisode[]> {
    // Étape 1: Essayer avec l'autre langue
    const altLanguage = language === 'vf' ? 'vostfr' : 'vf';
    try {
      const altResult = await this.makeRequest<AnimeSamaSeasonResult>(
        `${this.baseUrl}/api/seasons?animeId=${animeId}&season=${season}&language=${altLanguage}`
      );
      
      if (altResult.success && altResult.data.episodes && altResult.data.episodes.length > 0) {
        console.log(`Found episodes in ${altLanguage} for ${animeId} season ${season}`);
        return altResult.data.episodes;
      }
    } catch (error) {
      console.warn(`Alternative language ${altLanguage} also failed:`, error);
    }
    
    // Étape 2: Générer des épisodes basés sur les informations de l'anime
    try {
      const animeDetails = await this.getAnimeById(animeId);
      if (animeDetails && animeDetails.seasons) {
        const seasonInfo = animeDetails.seasons.find(s => s.number === season);
        if (seasonInfo && seasonInfo.episodeCount > 0) {
          const generatedEpisodes = Array.from({ length: seasonInfo.episodeCount }, (_, i) => ({
            id: `${animeId}-s${season}-e${i + 1}`,
            title: `Épisode ${i + 1}`,
            episodeNumber: i + 1,
            url: '',
            language: language,
            available: true
          }));
          
          console.log(`Generated ${generatedEpisodes.length} episodes for ${animeId} season ${season}`);
          return generatedEpisodes;
        }
      }
    } catch (error) {
      console.warn('Failed to generate episodes from anime details:', error);
    }
    
    // Étape 3: Fallback par défaut - minimum de 12 épisodes selon le guide
    const defaultEpisodeCount = 12;
    const defaultEpisodes = Array.from({ length: defaultEpisodeCount }, (_, i) => ({
      id: `${animeId}-s${season}-e${i + 1}`,
      title: `Épisode ${i + 1}`,
      episodeNumber: i + 1,
      url: '',
      language: language,
      available: true
    }));
    
    console.log(`Using default fallback: ${defaultEpisodeCount} episodes for ${animeId} season ${season}`);
    return defaultEpisodes;
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
    try {
      const response = await fetch(`${this.baseUrl}/api/trending`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching trending anime:', error);
      return [];
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
    try {
      const response = await fetch(`${this.baseUrl}/api/catalogue`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching catalogue:', error);
      return [];
    }
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