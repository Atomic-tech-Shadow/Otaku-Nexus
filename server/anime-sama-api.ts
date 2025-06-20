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
    server: string;
    quality: string;
    language: string;
    type: string;
    serverIndex: number;
  }>;
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

  async searchAnime(query: string): Promise<AnimeSamaAnime[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: AnimeSamaSearchResult = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  }

  async getAnimeById(animeId: string): Promise<AnimeSamaAnime | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/anime/${animeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching anime details:', error);
      return null;
    }
  }

  async getSeasonEpisodes(animeId: string, season: number, language: 'vf' | 'vostfr' = 'vostfr'): Promise<AnimeSamaEpisode[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/seasons?animeId=${animeId}&season=${season}&language=${language}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: AnimeSamaSeasonResult = await response.json();
      return result.success ? result.data.episodes : [];
    } catch (error) {
      console.error('Error fetching season episodes:', error);
      return [];
    }
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