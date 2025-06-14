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
        console.warn(`Consumet API returned ${response.status}, using demo data`);
        return this.getDemoSearchResults(query);
      }
      
      const text = await response.text();
      
      // Check if response is HTML (API down or blocked)
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html') || text.includes('<title>')) {
        console.warn('Consumet API returned HTML, using demo data');
        return this.getDemoSearchResults(query);
      }
      
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.warn('Consumet API unavailable, using demo data:', error instanceof Error ? error.message : 'Unknown error');
      return this.getDemoSearchResults(query);
    }
  }

  private getDemoSearchResults(query: string): ConsumetAnime[] {
    const demoAnimes = [
      {
        id: 'demo-naruto',
        title: 'Naruto',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
        releaseDate: '2002',
        subOrDub: 'sub'
      },
      {
        id: 'demo-one-piece',
        title: 'One Piece',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
        releaseDate: '1999',
        subOrDub: 'sub'
      },
      {
        id: 'demo-attack-titan',
        title: 'Attack on Titan (VF)',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
        releaseDate: '2013',
        subOrDub: 'dub'
      },
      {
        id: 'demo-demon-slayer',
        title: 'Demon Slayer',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        releaseDate: '2019',
        subOrDub: 'sub'
      }
    ];

    return demoAnimes.filter(anime => 
      anime.title.toLowerCase().includes(query.toLowerCase())
    );
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
        console.warn(`Consumet API returned ${response.status}, using demo data`);
        return this.getDemoAnimeInfo(animeId);
      }
      
      const text = await response.text();
      
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html') || text.includes('<title>')) {
        console.warn('Consumet API returned HTML, using demo data');
        return this.getDemoAnimeInfo(animeId);
      }
      
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      console.warn('Consumet API unavailable, using demo data:', error instanceof Error ? error.message : 'Unknown error');
      return this.getDemoAnimeInfo(animeId);
    }
  }

  private getDemoAnimeInfo(animeId: string): ConsumetAnimeInfo | null {
    const demoInfos: { [key: string]: ConsumetAnimeInfo } = {
      'demo-naruto': {
        id: 'demo-naruto',
        title: 'Naruto',
        url: '',
        genres: ['Action', 'Aventure', 'Arts martiaux'],
        totalEpisodes: 220,
        image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
        releaseDate: '2002',
        description: 'Naruto Uzumaki est un ninja adolescent qui rêve de devenir Hokage, le leader de son village.',
        subOrDub: 'sub',
        type: 'TV',
        status: 'Completed',
        otherName: 'ナルト',
        episodes: Array.from({ length: 10 }, (_, i) => ({
          id: `demo-naruto-ep-${i + 1}`,
          number: i + 1,
          url: '',
          title: `Épisode ${i + 1}`
        }))
      },
      'demo-one-piece': {
        id: 'demo-one-piece',
        title: 'One Piece',
        url: '',
        genres: ['Action', 'Aventure', 'Comédie'],
        totalEpisodes: 1000,
        image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
        releaseDate: '1999',
        description: 'Monkey D. Luffy explore le Grand Line à la recherche du trésor légendaire One Piece.',
        subOrDub: 'sub',
        type: 'TV',
        status: 'Ongoing',
        otherName: 'ワンピース',
        episodes: Array.from({ length: 15 }, (_, i) => ({
          id: `demo-one-piece-ep-${i + 1}`,
          number: i + 1,
          url: '',
          title: `Épisode ${i + 1}`
        }))
      },
      'demo-attack-titan': {
        id: 'demo-attack-titan',
        title: 'Attack on Titan (VF)',
        url: '',
        genres: ['Action', 'Drame', 'Fantaisie'],
        totalEpisodes: 75,
        image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
        releaseDate: '2013',
        description: 'L\'humanité lutte pour survivre contre des géants mangeurs d\'hommes.',
        subOrDub: 'dub',
        type: 'TV',
        status: 'Completed',
        otherName: '進撃の巨人',
        episodes: Array.from({ length: 12 }, (_, i) => ({
          id: `demo-attack-titan-ep-${i + 1}`,
          number: i + 1,
          url: '',
          title: `Épisode ${i + 1}`
        }))
      },
      'demo-demon-slayer': {
        id: 'demo-demon-slayer',
        title: 'Demon Slayer',
        url: '',
        genres: ['Action', 'Surnaturel', 'Historique'],
        totalEpisodes: 26,
        image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        releaseDate: '2019',
        description: 'Tanjiro Kamado devient un chasseur de démons pour sauver sa sœur.',
        subOrDub: 'sub',
        type: 'TV',
        status: 'Completed',
        otherName: '鬼滅の刃',
        episodes: Array.from({ length: 8 }, (_, i) => ({
          id: `demo-demon-slayer-ep-${i + 1}`,
          number: i + 1,
          url: '',
          title: `Épisode ${i + 1}`
        }))
      }
    };

    return demoInfos[animeId] || null;
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
        console.warn(`Consumet API returned ${response.status}, using demo data`);
        return this.getDemoStreamingData(episodeId);
      }
      
      const text = await response.text();
      
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html') || text.includes('<title>')) {
        console.warn('Consumet API returned HTML, using demo data');
        return this.getDemoStreamingData(episodeId);
      }
      
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      console.warn('Consumet API unavailable, using demo data:', error instanceof Error ? error.message : 'Unknown error');
      return this.getDemoStreamingData(episodeId);
    }
  }

  private getDemoStreamingData(episodeId: string): ConsumetStreamingData {
    return {
      headers: { Referer: '' },
      sources: [
        {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          quality: '1080p',
          isM3U8: false
        },
        {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          quality: '720p',
          isM3U8: false
        },
        {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          quality: '480p',
          isM3U8: false
        }
      ],
      download: ''
    };
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
        console.warn(`Consumet API returned ${response.status}, using demo data`);
        return this.getDemoTopAiring();
      }
      
      const text = await response.text();
      
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html') || text.includes('<title>')) {
        console.warn('Consumet API returned HTML, using demo data');
        return this.getDemoTopAiring();
      }
      
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.warn('Consumet API unavailable, using demo data:', error instanceof Error ? error.message : 'Unknown error');
      return this.getDemoTopAiring();
    }
  }

  private getDemoTopAiring(): ConsumetAnime[] {
    return [
      {
        id: 'demo-demon-slayer',
        title: 'Demon Slayer',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        releaseDate: '2019',
        subOrDub: 'sub'
      },
      {
        id: 'demo-attack-titan',
        title: 'Attack on Titan (VF)',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
        releaseDate: '2013',
        subOrDub: 'dub'
      },
      {
        id: 'demo-spy-family',
        title: 'Spy x Family (VF)',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/1441/122795.jpg',
        releaseDate: '2022',
        subOrDub: 'dub'
      }
    ];
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
        console.warn(`Consumet API returned ${response.status}, using demo data`);
        return this.getDemoRecentEpisodes();
      }
      
      const text = await response.text();
      
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html') || text.includes('<title>')) {
        console.warn('Consumet API returned HTML, using demo data');
        return this.getDemoRecentEpisodes();
      }
      
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.warn('Consumet API unavailable, using demo data:', error instanceof Error ? error.message : 'Unknown error');
      return this.getDemoRecentEpisodes();
    }
  }

  private getDemoRecentEpisodes(): ConsumetAnime[] {
    return [
      {
        id: 'demo-chainsaw-man',
        title: 'Chainsaw Man - Episode 12',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
        releaseDate: '2022',
        subOrDub: 'sub'
      },
      {
        id: 'demo-mob-psycho',
        title: 'Mob Psycho 100 III - Episode 12 (VF)',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/1228/125011.jpg',
        releaseDate: '2022',
        subOrDub: 'dub'
      }
    ];
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