export interface MangaDxManga {
  id: string;
  title: string;
  description: string;
  coverArt?: string;
  status: string;
  originalLanguage: string;
  publicationDemographic?: string;
  year?: number;
  tags: string[];
  author?: string;
  artist?: string;
}

export interface MangaDxChapter {
  id: string;
  title?: string;
  chapter: string;
  volume?: string;
  translatedLanguage: string;
  publishAt: string;
  pages: number;
  mangaId: string;
  externalUrl?: string;
}

export interface MangaDxChapterPages {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

class MangaDxService {
  private baseUrl = 'https://api.mangadex.org';

  async searchManga(query: string, limit = 20): Promise<MangaDxManga[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/manga?title=${encodeURIComponent(query)}&limit=${limit}&includes[]=cover_art&includes[]=author&includes[]=artist`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.data.map((manga: any) => this.formatManga(manga, data.includes));
    } catch (error) {
      console.error('Error searching manga:', error);
      throw error;
    }
  }

  async getMangaById(mangaId: string): Promise<MangaDxManga | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return this.formatManga(data.data, data.includes);
    } catch (error) {
      console.error('Error fetching manga:', error);
      throw error;
    }
  }

  async getMangaChapters(mangaId: string, limit = 100, offset = 0): Promise<MangaDxChapter[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/manga/${mangaId}/feed?limit=${limit}&offset=${offset}&order[chapter]=asc&translatedLanguage[]=fr&translatedLanguage[]=en`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.data.map((chapter: any) => this.formatChapter(chapter, mangaId));
    } catch (error) {
      console.error('Error fetching chapters:', error);
      throw error;
    }
  }

  async getChapterPages(chapterId: string): Promise<MangaDxChapterPages | null> {
    try {
      const response = await fetch(`${this.baseUrl}/at-home/server/${chapterId}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching chapter pages:', error);
      throw error;
    }
  }

  async getPopularManga(limit = 20): Promise<MangaDxManga[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/manga?limit=${limit}&order[followedCount]=desc&includes[]=cover_art&includes[]=author&includes[]=artist&contentRating[]=safe&contentRating[]=suggestive`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.data.map((manga: any) => this.formatManga(manga, data.includes));
    } catch (error) {
      console.error('Error fetching popular manga:', error);
      throw error;
    }
  }

  async getLatestManga(limit = 20): Promise<MangaDxManga[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/manga?limit=${limit}&order[createdAt]=desc&includes[]=cover_art&includes[]=author&includes[]=artist&contentRating[]=safe&contentRating[]=suggestive`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.data.map((manga: any) => this.formatManga(manga, data.includes));
    } catch (error) {
      console.error('Error fetching latest manga:', error);
      throw error;
    }
  }

  private formatManga(manga: any, includes: any[] = []): MangaDxManga {
    // Find cover art
    let coverArt = '';
    const coverRelation = manga.relationships?.find((rel: any) => rel.type === 'cover_art');
    if (coverRelation) {
      const coverData = includes.find((inc: any) => inc.id === coverRelation.id);
      if (coverData) {
        coverArt = `https://uploads.mangadex.org/covers/${manga.id}/${coverData.attributes.fileName}`;
      }
    }

    // Find author and artist
    const authorRelation = manga.relationships?.find((rel: any) => rel.type === 'author');
    const artistRelation = manga.relationships?.find((rel: any) => rel.type === 'artist');

    let author = '';
    let artist = '';

    if (authorRelation) {
      const authorData = includes.find((inc: any) => inc.id === authorRelation.id);
      author = authorData?.attributes?.name || '';
    }

    if (artistRelation) {
      const artistData = includes.find((inc: any) => inc.id === artistRelation.id);
      artist = artistData?.attributes?.name || '';
    }

    return {
      id: manga.id,
      title: manga.attributes.title?.en || manga.attributes.title?.fr || Object.values(manga.attributes.title)[0] || 'Titre non disponible',
      description: manga.attributes.description?.en || manga.attributes.description?.fr || Object.values(manga.attributes.description || {})[0] || 'Description non disponible',
      coverArt,
      status: manga.attributes.status,
      originalLanguage: manga.attributes.originalLanguage,
      publicationDemographic: manga.attributes.publicationDemographic,
      year: manga.attributes.year,
      tags: manga.attributes.tags?.map((tag: any) => tag.attributes.name.en || tag.attributes.name.fr || Object.values(tag.attributes.name)[0]) || [],
      author,
      artist
    };
  }

  private formatChapter(chapter: any, mangaId: string): MangaDxChapter {
    return {
      id: chapter.id,
      title: chapter.attributes.title,
      chapter: chapter.attributes.chapter,
      volume: chapter.attributes.volume,
      translatedLanguage: chapter.attributes.translatedLanguage,
      publishAt: chapter.attributes.publishAt,
      pages: chapter.attributes.pages || 0,
      mangaId,
      externalUrl: chapter.attributes.externalUrl
    };
  }
}

export const mangaDxService = new MangaDxService();