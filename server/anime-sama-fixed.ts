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
        throw new Error(`API returned ${response.status}`);
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
        throw new Error(`API returned ${response.status}`);
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



  // 3. Épisodes d'une saison (générer une liste basée sur episodeCount)
  async getSeasonEpisodes(animeId: string, seasonNum: number): Promise<AnimeSamaEpisode[]> {
    try {
      // D'abord obtenir les détails de l'anime pour connaître le nombre d'épisodes
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
          url: `${season.url}/episode-${i}`,
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
  async getEpisodeStreaming(episodeId: string): Promise<StreamingLinks | null> {
    try {
      const response = await fetch(`${this.baseUrl}/episode/${episodeId}`);
      if (!response.ok) {
        // Si l'endpoint n'existe pas, retourner des liens de démonstration
        console.warn(`Episode endpoint not available for ${episodeId}`);
        return null;
      }
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching episode streaming:', error);
      return null;
    }
  }



  // 5. Animés tendances
  async getTrendingAnime(): Promise<AnimeSamaSearchResult[]> {
    try {
      // Utiliser le catalogue pour obtenir des animes populaires
      return this.getCatalogue(1);
    } catch (error) {
      console.error('Error fetching trending anime:', error);
      return [];
    }
  }

  // 6. Catalogue d'animés
  async getCatalogue(page = 1, genre?: string, type?: string): Promise<AnimeSamaSearchResult[]> {
    try {
      let url = `${this.baseUrl}/catalogue?page=${page}`;
      if (genre) url += `&genre=${encodeURIComponent(genre)}`;
      if (type) url += `&type=${encodeURIComponent(type)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      
      // Gérer la structure de réponse de l'API anime-sama
      if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
        return data.data.items.map((item: any) => ({
          id: item.id || item.url?.split('/').pop() || Math.random().toString(),
          title: item.title,
          image: item.image || 'https://via.placeholder.com/300x400',
          type: item.type || 'anime',
          status: item.status || 'Unknown',
          url: item.url || ''
        }));
      }
      
      // Si l'API ne retourne pas de données, retourner un tableau vide
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
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
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
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data.map((genre: any) => genre.name || genre);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching anime genres:', error);
      return ['Action', 'Aventure', 'Comédie', 'Drame', 'Fantasy', 'Romance', 'Sci-Fi', 'Thriller'];
    }
  }
}

export const animeSamaService = new AnimeSamaService();