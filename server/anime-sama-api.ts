export interface AnimeSamaAnime {
  id: string;
  title: string;
  image: string;
  language: 'VF' | 'VOSTFR' | 'VF+VOSTFR';
  synopsis?: string;
  genres?: string[];
  type?: string;
  status?: string;
  seasons?: AnimeSamaSeason[];
}

export interface AnimeSamaSeason {
  seasonNumber: number;
  title: string;
  episodes: AnimeSamaEpisode[];
}

export interface AnimeSamaEpisode {
  id: string;
  number: number;
  title?: string;
  links: {
    vf?: string[];
    vostfr?: string[];
  };
}

export interface AnimeSamaSearchResult {
  id: string;
  title: string;
  image: string;
  language: 'VF' | 'VOSTFR' | 'VF+VOSTFR';
}

export interface AnimeSamaGenre {
  name: string;
  slug: string;
}

class AnimeSamaService {
  private baseUrl = 'https://api-anime-sama.onrender.com';

  // 1. Recherche d'animés
  async searchAnime(query: string): Promise<AnimeSamaSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  }

  // 2. Détails d'un animé
  async getAnimeDetails(animeId: string): Promise<AnimeSamaAnime | null> {
    try {
      const response = await fetch(`${this.baseUrl}/anime/${animeId}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching anime details:', error);
      return null;
    }
  }

  // 3. Épisodes d'une saison
  async getSeasonEpisodes(animeId: string, seasonNum: number): Promise<AnimeSamaEpisode[]> {
    try {
      const response = await fetch(`${this.baseUrl}/anime/${animeId}/season/${seasonNum}/episodes`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.episodes || [];
    } catch (error) {
      console.error('Error fetching season episodes:', error);
      return [];
    }
  }

  // 4. Liens de streaming d'un épisode
  async getEpisodeStreaming(episodeId: string): Promise<{ vf?: string[]; vostfr?: string[] } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/episode/${episodeId}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.links || null;
    } catch (error) {
      console.error('Error fetching episode streaming:', error);
      return null;
    }
  }

  // 5. Animés tendances
  async getTrendingAnime(): Promise<AnimeSamaSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/trending`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching trending anime:', error);
      return [];
    }
  }

  // 6. Catalogue avec filtres
  async getCatalogue(page = 1, genre?: string, type?: string): Promise<AnimeSamaSearchResult[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(genre && { genre }),
        ...(type && { type })
      });
      
      const response = await fetch(`${this.baseUrl}/catalogue?${params}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching catalogue:', error);
      return [];
    }
  }

  // 7. Animé aléatoire
  async getRandomAnime(): Promise<AnimeSamaAnime | null> {
    try {
      const response = await fetch(`${this.baseUrl}/random`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching random anime:', error);
      return null;
    }
  }

  // 8. Recherche avancée
  async searchAdvanced(genre?: string, year?: string, type?: string): Promise<AnimeSamaSearchResult[]> {
    try {
      const params = new URLSearchParams({
        ...(genre && { genre }),
        ...(year && { year }),
        ...(type && { type })
      });
      
      const response = await fetch(`${this.baseUrl}/search/advanced?${params}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error in advanced search:', error);
      return [];
    }
  }

  // 9. Liste des genres
  async getGenres(): Promise<AnimeSamaGenre[]> {
    try {
      const response = await fetch(`${this.baseUrl}/genres`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.genres || [];
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  }
}

export const animeSamaService = new AnimeSamaService();