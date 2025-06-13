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

  async searchAnime(query: string): Promise<ConsumetAnime[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  }

  async getAnimeInfo(animeId: string): Promise<ConsumetAnimeInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/info/${animeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting anime info:', error);
      return null;
    }
  }

  async getStreamingData(episodeId: string): Promise<ConsumetStreamingData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/watch/${episodeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting streaming data:', error);
      return null;
    }
  }

  async getTopAiring(): Promise<ConsumetAnime[]> {
    try {
      const response = await fetch(`${this.baseUrl}/top-airing`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error getting top airing:', error);
      return [];
    }
  }

  async getRecentEpisodes(): Promise<ConsumetAnime[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recent-episodes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error getting recent episodes:', error);
      return [];
    }
  }

  // Helper method to determine if an anime has French dub available
  isFrenchdubAvailable(anime: ConsumetAnime | ConsumetAnimeInfo): boolean {
    const title = anime.title.toLowerCase();
    const subOrDub = anime.subOrDub?.toLowerCase() || '';
    
    // Check for French indicators in title or subOrDub field
    return subOrDub.includes('dub') || 
           title.includes('vf') || 
           title.includes('french') || 
           title.includes('français');
  }

  // Helper method to extract quality from source
  getQualityFromSource(source: ConsumetSource): string {
    if (source.quality) return source.quality;
    
    // Extract quality from URL if available
    const url = source.url.toLowerCase();
    if (url.includes('1080')) return '1080p';
    if (url.includes('720')) return '720p';
    if (url.includes('480')) return '480p';
    if (url.includes('360')) return '360p';
    
    return 'default';
  }
}

export const consumetService = new ConsumetService();