import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration pour Android Emulator et production
const BASE_URL = __DEV__ ? 'http://10.0.2.2:5000' : 'https://otaku-nexus.onrender.com';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Interfaces Anime-Sama synchronisées avec le site web
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

class ApiService {
  private baseUrl: string;
  private cache = new Map();
  private readonly cacheConfig = {
    trending: 30 * 60 * 1000, // 30 minutes
    catalogue: 60 * 60 * 1000, // 1 hour
    search: 10 * 60 * 1000, // 10 minutes
    episode: 5 * 60 * 1000, // 5 minutes
  };

  constructor() {
    this.baseUrl = BASE_URL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    
    try {
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API request failed (attempt ${retryCount + 1}):`, error);
      
      // Retry logic with exponential backoff
      if (retryCount < maxRetries && 
          (error instanceof TypeError || 
           (error instanceof Error && error.message.includes('Failed to fetch')))) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.makeRequest<{token: string, user: any}>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    
    return response;
  }

  async register(email: string, password: string, username: string) {
    const response = await this.makeRequest<{token: string, user: any}>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
    
    if (response.success && response.data?.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    
    return response;
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
    this.cache.clear(); // Clear cache on logout
    return this.makeRequest('/api/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getProfile() {
    return this.makeRequest('/api/user/profile');
  }

  async updateProfile(data: any) {
    return this.makeRequest('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.makeRequest('/api/user/stats');
  }

  async getLeaderboard() {
    return this.makeRequest('/api/users/leaderboard');
  }

  // Quiz endpoints
  async getQuizzes() {
    return this.makeRequest('/api/quizzes');
  }

  async getFeaturedQuiz() {
    return this.makeRequest('/api/quizzes/featured');
  }

  async getQuiz(id: string) {
    return this.makeRequest(`/api/quizzes/${id}`);
  }

  async submitQuiz(id: string, answers: any[]) {
    return this.makeRequest(`/api/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // Anime-Sama endpoints avec cache intelligent
  async searchAnime(query: string): Promise<AnimeSamaAnime[]> {
    const cacheKey = `search_${query}`;
    const cached = this.getCachedData<AnimeSamaAnime[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<AnimeSamaAnime[]>(
        `/api/anime-sama/search?q=${encodeURIComponent(query)}`
      );
      
      if (response.success && response.data) {
        this.setCachedData(cacheKey, response.data, this.cacheConfig.search);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Search anime failed:', error);
      return [];
    }
  }

  async getAnimeById(animeId: string): Promise<AnimeSamaAnime | null> {
    const cacheKey = `anime_${animeId}`;
    const cached = this.getCachedData<AnimeSamaAnime>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<AnimeSamaAnime>(
        `/api/anime-sama/anime/${animeId}`
      );
      
      if (response.success && response.data) {
        this.setCachedData(cacheKey, response.data, this.cacheConfig.episode);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Get anime failed:', error);
      return null;
    }
  }

  async getSeasonEpisodes(
    animeId: string, 
    season: number, 
    language: 'vf' | 'vostfr' = 'vostfr'
  ): Promise<AnimeSamaEpisode[]> {
    const cacheKey = `episodes_${animeId}_${season}_${language}`;
    const cached = this.getCachedData<AnimeSamaEpisode[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<{
        animeId: string;
        season: number;
        language: string;
        episodes: AnimeSamaEpisode[];
        episodeCount: number;
      }>(`/api/anime-sama/episodes/${animeId}/${season}/${language}`);
      
      if (response.success && response.data?.episodes) {
        // Apply One Piece episode correction if needed
        let episodes = response.data.episodes;
        if (animeId === 'one-piece' && episodes.length > 0) {
          episodes = this.correctOnePieceEpisodes(episodes, season);
        }
        
        this.setCachedData(cacheKey, episodes, this.cacheConfig.episode);
        return episodes;
      }
      
      // Fallback to alternative language if no episodes found
      if (language === 'vf') {
        console.log(`No VF episodes found, trying VOSTFR fallback for ${animeId} season ${season}`);
        return this.getSeasonEpisodes(animeId, season, 'vostfr');
      }
      
      return [];
    } catch (error) {
      console.error('Get season episodes failed:', error);
      
      // Fallback to alternative language on error
      if (language === 'vf') {
        console.log(`VF request failed, trying VOSTFR fallback for ${animeId} season ${season}`);
        return this.getSeasonEpisodes(animeId, season, 'vostfr');
      }
      
      return [];
    }
  }

  // Correction des numéros d'épisodes One Piece
  private correctOnePieceEpisodes(episodes: AnimeSamaEpisode[], season: number): AnimeSamaEpisode[] {
    if (season === 11) { // Saga 11: Egghead Island
      return episodes.map((episode, index) => ({
        ...episode,
        episodeNumber: 1087 + index, // Episodes 1087-1122
        title: episode.title || `Episode ${1087 + index}`,
        id: this.formatEpisodeId('one-piece', 1087 + index, episode.language)
      }));
    }
    return episodes;
  }

  async getEpisodeDetails(episodeId: string): Promise<AnimeSamaEpisodeDetail | null> {
    const cacheKey = `episode_detail_${episodeId}`;
    const cached = this.getCachedData<AnimeSamaEpisodeDetail>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<AnimeSamaEpisodeDetail>(
        `/api/anime-sama/episode/${episodeId}`
      );
      
      if (response.success && response.data) {
        this.setCachedData(cacheKey, response.data, this.cacheConfig.episode);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Get episode details failed:', error);
      return null;
    }
  }

  async getTrendingAnime(): Promise<AnimeSamaAnime[]> {
    const cacheKey = 'trending_anime';
    const cached = this.getCachedData<AnimeSamaAnime[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<AnimeSamaAnime[]>('/api/anime-sama/trending');
      
      if (response.success && response.data) {
        this.setCachedData(cacheKey, response.data, this.cacheConfig.trending);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Get trending anime failed:', error);
      return [];
    }
  }

  async getCatalogue(): Promise<AnimeSamaAnime[]> {
    const cacheKey = 'catalogue_anime';
    const cached = this.getCachedData<AnimeSamaAnime[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<AnimeSamaAnime[]>('/api/anime-sama/catalogue');
      
      if (response.success && response.data) {
        this.setCachedData(cacheKey, response.data, this.cacheConfig.catalogue);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Get catalogue failed:', error);
      return [];
    }
  }

  // Chat endpoints
  async getChatMessages(limit = 50) {
    return this.makeRequest(`/api/chat/messages?limit=${limit}`);
  }

  async sendMessage(message: string) {
    return this.makeRequest('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Posts endpoints
  async getPosts() {
    return this.makeRequest('/api/posts');
  }

  // Admin endpoints
  async getAdminStats() {
    return this.makeRequest('/api/admin/stats');
  }

  async getAllUsers() {
    return this.makeRequest('/api/admin/users');
  }

  async deleteUser(userId: string) {
    return this.makeRequest(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAllPosts() {
    return this.makeRequest('/api/admin/posts');
  }

  async deletePost(postId: string) {
    return this.makeRequest(`/api/admin/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async getAllQuizzes() {
    return this.makeRequest('/api/admin/quizzes');
  }

  async deleteQuiz(quizId: string) {
    return this.makeRequest(`/api/admin/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  }

  // Helper methods pour correction épisodes One Piece
  formatEpisodeId(animeId: string, episodeNumber: number, language: string): string {
    return `${animeId}-episode-${episodeNumber}-${language}`;
  }

  extractAnimeId(input: string): string {
    if (input.includes('one-piece')) {
      return 'one-piece';
    }
    return input.split('-')[0];
  }

  // Méthodes utilitaires pour cache
  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const apiService = new ApiService();
export default apiService;