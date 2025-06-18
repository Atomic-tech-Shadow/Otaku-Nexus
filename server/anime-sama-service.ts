export interface AnimeSamaSearchResult {
  id: string;
  title: string;
  image: string;
  type: string;
  status: string;
  url: string;
}

export interface AnimeSamaAnime {
  id: string;
  title: string;
  description: string;
  image: string;
  genres: string[];
  status: string;
  year: string;
  seasons: AnimeSamaSeason[];
  url: string;
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
  number: number;
  title?: string;
  url: string;
  servers: string[];
}

export interface EpisodeSource {
  url: string;
  server: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
}

export interface StreamingData {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  sources: EpisodeSource[];
  availableServers: string[];
  url: string;
}

export interface StreamingLinks {
  vf?: string[];
  vostfr?: string[];
}

class AnimeSamaService {
  private baseUrl = 'https://api-anime-sama.onrender.com/api';

  // 1. Recherche d'animés
  async searchAnime(query: string): Promise<AnimeSamaSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        console.warn(`Search API returned ${response.status}`);
        return [];
      }
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.image || 'https://via.placeholder.com/300x400',
          type: item.type || 'anime',
          status: item.status || 'Disponible',
          url: item.url || ''
        }));
      }
      
      return [];
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
        console.warn(`Anime details API returned ${response.status} for ${animeId}`);
        return null;
      }
      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          id: data.data.id,
          title: data.data.title,
          description: data.data.description || 'Description non disponible',
          image: data.data.image || 'https://via.placeholder.com/300x400',
          genres: data.data.genres || [],
          status: data.data.status || 'Inconnu',
          year: data.data.year || '2024',
          seasons: data.data.seasons || [],
          url: data.data.url || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching anime details:', error);
      return null;
    }
  }

  // 3. Épisodes d'une saison
  async getSeasonEpisodes(animeId: string, seasonNum: number): Promise<AnimeSamaEpisode[]> {
    try {
      const animeDetails = await this.getAnimeDetails(animeId);
      if (!animeDetails || !animeDetails.seasons) {
        return [];
      }

      const season = animeDetails.seasons.find(s => s.number === seasonNum);
      if (!season) {
        return [];
      }

      // Générer la liste des épisodes basée sur episodeCount
      const episodes: AnimeSamaEpisode[] = [];
      for (let i = 1; i <= season.episodeCount; i++) {
        episodes.push({
          id: `${animeId}-episode-${i}-vostfr`,
          number: i,
          title: `Épisode ${i}`,
          url: `https://anime-sama.fr/catalogue/${animeId}/episode-${i}`,
          servers: ['Vidmoly', 'SendVid', 'Sibnet']
        });
      }

      return episodes;
    } catch (error) {
      console.error('Error fetching season episodes:', error);
      return [];
    }
  }

  // 4. Liens de streaming d'un épisode
  async getEpisodeStreaming(episodeId: string): Promise<StreamingData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/episode/${episodeId}`);
      if (!response.ok) {
        console.warn(`Episode streaming API returned ${response.status} for ${episodeId}`);
        return null;
      }
      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          id: data.data.id,
          title: data.data.title,
          animeTitle: data.data.animeTitle,
          episodeNumber: data.data.episodeNumber,
          sources: data.data.sources || [],
          availableServers: data.data.availableServers || [],
          url: data.data.url || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching episode streaming:', error);
      return null;
    }
  }

  // 5. Animes tendances
  async getTrendingAnime(): Promise<AnimeSamaSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/trending`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          return data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            image: item.image || 'https://via.placeholder.com/300x400',
            type: item.type || 'anime',
            status: item.status || 'Disponible',
            url: item.url || ''
          }));
        }
      }
      
      // Fallback au catalogue si trending n'est pas disponible
      return this.getCatalogue(1);
    } catch (error) {
      console.error('Error fetching trending anime:', error);
      return this.getCatalogue(1);
    }
  }

  // 6. Catalogue d'animés
  async getCatalogue(page = 1, genre?: string, type?: string): Promise<AnimeSamaSearchResult[]> {
    try {
      let url = `${this.baseUrl}/catalogue?page=${page}`;
      if (genre && genre !== 'all') url += `&genre=${encodeURIComponent(genre)}`;
      if (type && type !== 'all') url += `&type=${encodeURIComponent(type)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Catalogue API returned ${response.status}`);
        return [];
      }
      const data = await response.json();
      
      if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
        return data.data.items.map((item: any) => ({
          id: item.id || item.url?.split('/').pop() || Math.random().toString(),
          title: item.title,
          image: item.image || 'https://via.placeholder.com/300x400',
          type: item.type || 'anime',
          status: item.status || 'Inconnu',
          url: item.url || ''
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching anime catalogue:', error);
      return [];
    }
  }

  // 7. Animé aléatoire
  async getRandomAnime(): Promise<AnimeSamaAnime | null> {
    try {
      const response = await fetch(`${this.baseUrl}/random`);
      if (!response.ok) {
        console.warn(`Random anime API returned ${response.status}`);
        return null;
      }
      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          id: data.data.id,
          title: data.data.title,
          description: data.data.description || 'Description non disponible',
          image: data.data.image || 'https://via.placeholder.com/300x400',
          genres: data.data.genres || [],
          status: data.data.status || 'Inconnu',
          year: data.data.year || '2024',
          seasons: data.data.seasons || [],
          url: data.data.url || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching random anime:', error);
      return null;
    }
  }

  // 8. Genres disponibles
  async getGenres(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/genres`);
      if (!response.ok) {
        console.warn(`Genres API returned ${response.status}`);
        return [];
      }
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  }
}

export const animeSamaService = new AnimeSamaService();