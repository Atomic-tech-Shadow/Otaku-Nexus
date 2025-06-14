export interface ConsumetAnime {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate?: string;
  subOrDub: string;
}

export interface ConsumetAnimeInfo {
  id: string;
  title: string;
  url: string;
  genres: string[];
  totalEpisodes: number;
  image: string;
  releaseDate: string;
  description: string;
  subOrDub: string;
  type: string;
  status: string;
  otherName: string;
  episodes: ConsumetEpisode[];
}

export interface ConsumetEpisode {
  id: string;
  number: number;
  url: string;
  title?: string;
}

export interface ConsumetStreamingData {
  headers: {
    Referer: string;
  };
  sources: ConsumetSource[];
  download: string;
}

export interface ConsumetSource {
  url: string;
  isM3U8: boolean;
  quality: string;
}

class ConsumetService {
  private baseUrl = 'https://api.consumet.org/anime/gogoanime';

  // Configuration pour différentes sources (gogoanime, aniwatch, animepahe, zoro)
  switchProvider(provider: string = 'gogoanime') {
    this.baseUrl = `https://api.consumet.org/anime/${provider}`;
  }

  // 1️⃣ Rechercher un anime par nom - GET /anime/gogoanime/{query}
  async searchAnime(query: string): Promise<ConsumetAnime[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Consumet API returned ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('Consumet API error:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Unable to search anime. Please check your internet connection or try again later.');
    }
  }

  // 2️⃣ Récupérer la liste des épisodes - GET /anime/gogoanime/info/{animeId}
  async getAnimeInfo(animeId: string): Promise<ConsumetAnimeInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/info/${animeId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Consumet API returned ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Consumet API error:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Unable to fetch anime details. Please check your internet connection or try again later.');
    }
  }

  // 3️⃣ Lire un épisode - GET /anime/gogoanime/watch/{episodeId}
  async getStreamingData(episodeId: string): Promise<ConsumetStreamingData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/watch/${episodeId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Consumet API returned ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Consumet API error:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Unable to fetch streaming data. Please check your internet connection or try again later.');
    }
  }

  // Top Airing - GET /anime/gogoanime/top-airing
  async getTopAiring(): Promise<ConsumetAnime[]> {
    try {
      const response = await fetch(`${this.baseUrl}/top-airing`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Consumet API returned ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('Consumet API error:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Unable to fetch top airing anime. Please check your internet connection or try again later.');
    }
  }

  // Recent Episodes - GET /anime/gogoanime/recent-episodes
  async getRecentEpisodes(): Promise<ConsumetAnime[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recent-episodes`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Consumet API returned ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('Consumet API error:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Unable to fetch recent episodes. Please check your internet connection or try again later.');
    }
  }

  // Vérifier si l'anime dispose de doublage français  
  isFrenchdubAvailable(anime: ConsumetAnime | ConsumetAnimeInfo): boolean {
    return anime.subOrDub?.toLowerCase().includes('dub') || 
           anime.title.toLowerCase().includes('vf') ||
           anime.title.toLowerCase().includes('french');
  }

  // Obtenir la qualité depuis une source
  getQualityFromSource(source: ConsumetSource): string {
    return source.quality || '720p';
  }
}

export const consumetService = new ConsumetService();