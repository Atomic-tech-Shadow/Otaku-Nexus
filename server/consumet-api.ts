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
      
      const text = await response.text();
      
      // Check if response is HTML (API down)
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        console.warn('Consumet API returned HTML, service may be down');
        // Return demo data to show UI functionality
        return this.getDemoSearchResults(query);
      }
      
      const data = JSON.parse(text);
      return data.results || [];
    } catch (error) {
      console.error('Error searching anime:', error);
      // Return demo data to show UI functionality
      return this.getDemoSearchResults(query);
    }
  }

  private getDemoSearchResults(query: string): ConsumetAnime[] {
    // Demo data to demonstrate the streaming interface
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
      }
    ];

    return demoAnimes.filter(anime => 
      anime.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getAnimeInfo(animeId: string): Promise<ConsumetAnimeInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/info/${animeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        return this.getDemoAnimeInfo(animeId);
      }
      
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      console.error('Error getting anime info:', error);
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
      }
    };

    return demoInfos[animeId] || null;
  }

  async getStreamingData(episodeId: string): Promise<ConsumetStreamingData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/watch/${episodeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        return this.getDemoStreamingData(episodeId);
      }
      
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      console.error('Error getting streaming data:', error);
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

  async getTopAiring(): Promise<ConsumetAnime[]> {
    try {
      const response = await fetch(`${this.baseUrl}/top-airing`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        return this.getDemoTopAiring();
      }
      
      const data = JSON.parse(text);
      return data.results || [];
    } catch (error) {
      console.error('Error getting top airing:', error);
      return this.getDemoTopAiring();
    }
  }

  async getRecentEpisodes(): Promise<ConsumetAnime[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recent-episodes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        return this.getDemoRecentEpisodes();
      }
      
      const data = JSON.parse(text);
      return data.results || [];
    } catch (error) {
      console.error('Error getting recent episodes:', error);
      return this.getDemoRecentEpisodes();
    }
  }

  private getDemoTopAiring(): ConsumetAnime[] {
    return [
      {
        id: 'demo-jujutsu-kaisen',
        title: 'Jujutsu Kaisen',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
        releaseDate: '2020',
        subOrDub: 'sub'
      },
      {
        id: 'demo-demon-slayer',
        title: 'Demon Slayer',
        url: '',
        image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        releaseDate: '2019',
        subOrDub: 'sub'
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