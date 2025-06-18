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
  private baseUrl = 'https://api-anime-sama.onrender.com/api';

  // 1. Recherche d'animés
  async searchAnime(query: string): Promise<AnimeSamaSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      // Handle search response structure: data array
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.image,
          language: 'VF+VOSTFR' // Default for anime-sama
        }));
      }
      return [];
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  }

  private getDemoSearchResults(query: string): AnimeSamaSearchResult[] {
    const demoResults: AnimeSamaSearchResult[] = [
      {
        id: 'naruto',
        title: 'Naruto',
        image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
        language: 'VF+VOSTFR'
      },
      {
        id: 'one-piece',
        title: 'One Piece',
        image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
        language: 'VF+VOSTFR'
      },
      {
        id: 'demon-slayer',
        title: 'Demon Slayer',
        image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        language: 'VOSTFR'
      },
      {
        id: 'attack-on-titan',
        title: 'Attack on Titan',
        image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
        language: 'VF+VOSTFR'
      }
    ];
    
    return demoResults.filter(anime => 
      anime.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  // 2. Détails d'un animé
  async getAnimeDetails(animeId: string): Promise<AnimeSamaAnime | null> {
    try {
      const response = await fetch(`${this.baseUrl}/anime/${animeId}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching anime details:', error);
      return null;
    }
  }

  private getDemoAnimeDetails(animeId: string): AnimeSamaAnime | null {
    const demoDetails: { [key: string]: AnimeSamaAnime } = {
      'naruto': {
        id: 'naruto',
        title: 'Naruto',
        image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
        language: 'VF+VOSTFR',
        synopsis: 'Naruto Uzumaki est un jeune ninja du village de Konoha. Porteur du démon renard à neuf queues, il rêve de devenir Hokage.',
        genres: ['Action', 'Aventure', 'Arts martiaux'],
        type: 'Anime',
        status: 'Terminé',
        seasons: [
          { seasonNumber: 1, title: 'Naruto', episodes: [] },
          { seasonNumber: 2, title: 'Naruto Shippuden', episodes: [] }
        ]
      },
      'one-piece': {
        id: 'one-piece',
        title: 'One Piece',
        image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
        language: 'VF+VOSTFR',
        synopsis: 'Monkey D. Luffy rêve de devenir le Roi des Pirates. Il part à l\'aventure pour trouver le légendaire trésor One Piece.',
        genres: ['Action', 'Aventure', 'Comédie'],
        type: 'Anime',
        status: 'En cours',
        seasons: [
          { seasonNumber: 1, title: 'East Blue', episodes: [] },
          { seasonNumber: 2, title: 'Alabasta', episodes: [] }
        ]
      },
      'demon-slayer': {
        id: 'demon-slayer',
        title: 'Demon Slayer',
        image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        language: 'VOSTFR',
        synopsis: 'Tanjiro Kamado devient un chasseur de démons pour sauver sa sœur transformée en démon.',
        genres: ['Action', 'Drame', 'Surnaturel'],
        type: 'Anime',
        status: 'En cours',
        seasons: [
          { seasonNumber: 1, title: 'Demon Slayer', episodes: [] }
        ]
      }
    };
    
    return demoDetails[animeId] || null;
  }

  // 3. Épisodes d'une saison
  async getSeasonEpisodes(animeId: string, seasonNum: number): Promise<AnimeSamaEpisode[]> {
    try {
      const response = await fetch(`${this.baseUrl}/anime/${animeId}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.data || data.episodes || [];
    } catch (error) {
      console.error('Error fetching season episodes:', error);
      return [];
    }
  }

  private getDemoSeasonEpisodes(animeId: string, seasonNum: number): AnimeSamaEpisode[] {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `${animeId}-s${seasonNum}-ep${i + 1}`,
      number: i + 1,
      title: `Épisode ${i + 1}`,
      links: {
        vf: [`https://example.com/vf/${animeId}/s${seasonNum}/ep${i + 1}`],
        vostfr: [`https://example.com/vostfr/${animeId}/s${seasonNum}/ep${i + 1}`]
      }
    }));
  }

  // 4. Liens de streaming d'un épisode
  async getEpisodeStreaming(episodeId: string): Promise<{ vf?: string[]; vostfr?: string[] } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/episode/${episodeId}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.data || data.links || null;
    } catch (error) {
      console.error('Error fetching episode streaming:', error);
      return null;
    }
  }

  private getDemoStreamingLinks(episodeId: string): { vf?: string[]; vostfr?: string[] } {
    return {
      vf: [`https://vidmoly.to/embed/demo-vf-${episodeId}`],
      vostfr: [`https://vidmoly.to/embed/demo-vostfr-${episodeId}`]
    };
  }

  // 5. Animés tendances
  async getTrendingAnime(): Promise<AnimeSamaSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/trending`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      // Handle trending response structure: data array
      if (data.success && data.data && Array.isArray(data.data)) {
        return data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.image,
          language: 'VF+VOSTFR' // Default for anime-sama
        }));
      }
      // If trending returns direct array format
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.image,
          language: 'VF+VOSTFR'
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching trending anime:', error);
      return [];
    }
  }

  private getDemoTrendingAnime(): AnimeSamaSearchResult[] {
    return [
      {
        id: 'jujutsu-kaisen',
        title: 'Jujutsu Kaisen',
        image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
        language: 'VF+VOSTFR'
      },
      {
        id: 'spy-family',
        title: 'Spy x Family',
        image: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg',
        language: 'VF+VOSTFR'
      },
      {
        id: 'chainsaw-man',
        title: 'Chainsaw Man',
        image: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
        language: 'VOSTFR'
      }
    ];
  }

  // 6. Catalogue avec filtres
  async getCatalogue(page = 1, genre?: string, type?: string): Promise<AnimeSamaSearchResult[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(genre && genre !== 'all' && { genre }),
        ...(type && type !== 'all' && { type })
      });
      
      const response = await fetch(`${this.baseUrl}/api/catalogue?${params}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      // Handle catalogue response structure: data.items
      if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
        return data.data.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.image,
          language: 'VF+VOSTFR' // Default for anime-sama
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching catalogue:', error);
      return [];
    }
  }

  private getDemoCatalogue(page: number, genre?: string, type?: string): AnimeSamaSearchResult[] {
    const allAnime = [
      ...this.getDemoSearchResults(''),
      ...this.getDemoTrendingAnime()
    ];
    
    let filtered = allAnime;
    
    if (genre && genre !== 'all') {
      // Simple genre filtering for demo
      filtered = allAnime.filter(() => Math.random() > 0.5);
    }
    
    if (type && type !== 'all') {
      // Simple type filtering for demo
      filtered = allAnime.filter(() => Math.random() > 0.3);
    }
    
    const startIndex = (page - 1) * 12;
    return filtered.slice(startIndex, startIndex + 12);
  }

  // 7. Animé aléatoire
  async getRandomAnime(): Promise<AnimeSamaAnime | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/random`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching random anime:', error);
      return null;
    }
  }

  private getDemoRandomAnime(): AnimeSamaAnime {
    const animeIds = ['naruto', 'one-piece', 'demon-slayer'];
    const randomId = animeIds[Math.floor(Math.random() * animeIds.length)];
    return this.getDemoAnimeDetails(randomId)!;
  }

  // 8. Recherche avancée
  async searchAdvanced(genre?: string, year?: string, type?: string): Promise<AnimeSamaSearchResult[]> {
    try {
      const params = new URLSearchParams({
        ...(genre && genre !== 'all' && { genre }),
        ...(year && { year }),
        ...(type && type !== 'all' && { type })
      });
      
      const response = await fetch(`${this.baseUrl}/api/search/advanced?${params}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.data || data.results || [];
    } catch (error) {
      console.error('Error in advanced search:', error);
      return [];
    }
  }

  // 9. Liste des genres
  async getGenres(): Promise<AnimeSamaGenre[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/genres`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      return data.data || data.genres || [];
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  }
}

export const animeSamaService = new AnimeSamaService();