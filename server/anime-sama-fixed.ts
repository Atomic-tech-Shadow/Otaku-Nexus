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
        return data.data;
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
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching anime details:', error);
      // Return demo data for testing when API fails
      return this.getDemoAnimeDetails(animeId);
    }
  }

  private getDemoAnimeDetails(animeId: string): AnimeSamaAnime {
    const demoDetails: { [key: string]: AnimeSamaAnime } = {
      "attack-on-titan": {
        id: "attack-on-titan",
        title: "L'Attaque des Titans",
        description: "L'humanité se bat pour sa survie contre des titans géants qui ont poussé la civilisation au bord de l'extinction.",
        image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        genres: ["Action", "Drame", "Fantasy"],
        status: "Terminé",
        year: "2013",
        seasons: [
          {
            number: 1,
            name: "Saison 1",
            languages: ["VF", "VOSTFR"],
            episodeCount: 25,
            url: "https://anime-sama.fr/catalogue/anime/attack-on-titan/saison-1"
          },
          {
            number: 2,
            name: "Saison 2",
            languages: ["VF", "VOSTFR"],
            episodeCount: 12,
            url: "https://anime-sama.fr/catalogue/anime/attack-on-titan/saison-2"
          }
        ],
        url: "https://anime-sama.fr/catalogue/anime/attack-on-titan"
      },
      "demon-slayer": {
        id: "demon-slayer",
        title: "Demon Slayer",
        description: "Une famille est attaquée par des démons et seuls deux membres survivent - Tanjiro et sa sœur Nezuko, qui se transforme lentement en démon.",
        image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
        genres: ["Action", "Surnaturel", "Historique"],
        status: "Terminé",
        year: "2019",
        seasons: [
          {
            number: 1,
            name: "Saison 1",
            languages: ["VF", "VOSTFR"],
            episodeCount: 26,
            url: "https://anime-sama.fr/catalogue/anime/demon-slayer/saison-1"
          }
        ],
        url: "https://anime-sama.fr/catalogue/anime/demon-slayer"
      },
      "one-piece": {
        id: "one-piece",
        title: "One Piece",
        description: "Monkey D. Luffy se lance dans une aventure avec son équipage de pirates dans l'espoir de trouver le plus grand trésor jamais découvert.",
        image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
        genres: ["Action", "Aventure", "Comédie"],
        status: "En cours",
        year: "1999",
        seasons: [
          {
            number: 1,
            name: "East Blue",
            languages: ["VF", "VOSTFR"],
            episodeCount: 61,
            url: "https://anime-sama.fr/catalogue/anime/one-piece/east-blue"
          },
          {
            number: 2,
            name: "Alabasta",
            languages: ["VF", "VOSTFR"],
            episodeCount: 78,
            url: "https://anime-sama.fr/catalogue/anime/one-piece/alabasta"
          }
        ],
        url: "https://anime-sama.fr/catalogue/anime/one-piece"
      }
    };

    return demoDetails[animeId] || demoDetails["attack-on-titan"];
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
        return this.generateDemoStreamingLinks(episodeId);
      }
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return this.generateDemoStreamingLinks(episodeId);
    } catch (error) {
      console.error('Error fetching episode streaming:', error);
      return this.generateDemoStreamingLinks(episodeId);
    }
  }

  private generateDemoStreamingLinks(episodeId: string): StreamingLinks {
    return {
      vf: [`https://vidmoly.to/embed/demo-vf-${episodeId}`],
      vostfr: [`https://vidmoly.to/embed/demo-vostfr-${episodeId}`]
    };
  }

  // 5. Animés tendances
  async getTrendingAnime(): Promise<AnimeSamaSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/trending`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      return [];
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
      
      // Si l'API ne retourne pas de données, retourner des données de démonstration
      return this.getDemoCatalogueData();
    } catch (error) {
      console.error('Error fetching anime catalogue:', error);
      return this.getDemoCatalogueData();
    }
  }

  private getDemoCatalogueData(): AnimeSamaSearchResult[] {
    return [
      {
        id: "attack-on-titan",
        title: "L'Attaque des Titans",
        image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        type: "TV",
        status: "Terminé",
        url: "https://anime-sama.fr/catalogue/anime/attack-on-titan"
      },
      {
        id: "demon-slayer",
        title: "Demon Slayer",
        image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
        type: "TV",
        status: "Terminé",
        url: "https://anime-sama.fr/catalogue/anime/demon-slayer"
      },
      {
        id: "one-piece",
        title: "One Piece",
        image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
        type: "TV",
        status: "En cours",
        url: "https://anime-sama.fr/catalogue/anime/one-piece"
      },
      {
        id: "naruto",
        title: "Naruto",
        image: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
        type: "TV",
        status: "Terminé",
        url: "https://anime-sama.fr/catalogue/anime/naruto"
      },
      {
        id: "jujutsu-kaisen",
        title: "Jujutsu Kaisen",
        image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
        type: "TV",
        status: "Terminé",
        url: "https://anime-sama.fr/catalogue/anime/jujutsu-kaisen"
      },
      {
        id: "my-hero-academia",
        title: "My Hero Academia",
        image: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
        type: "TV",
        status: "En cours",
        url: "https://anime-sama.fr/catalogue/anime/my-hero-academia"
      }
    ];
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