import {
  users,
  animes,
  animeFavorites,
  quizzes,
  quizResults,
  chatRooms,
  chatMessages,
  chatRoomMembers,
  adminPosts,
  mangas,
  mangaChapters,
  mangaReadingProgress,
  mangaDownloads,
  animeEpisodes,
  animeStreamingSources,
  animeWatchHistory,
  type User,
  type UpsertUser,
  type UpdateUserProfile,
  type Anime,
  type InsertAnime,
  type AnimeFavorite,
  type InsertAnimeFavorite,
  type Quiz,
  type InsertQuiz,
  type QuizResult,
  type InsertQuizResult,

  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type ChatRoomMember,
  type InsertChatRoomMember,
  type AdminPost,
  type InsertAdminPost,
  type Manga,
  type InsertManga,
  type MangaChapter,
  type InsertMangaChapter,
  type MangaReadingProgress,
  type InsertMangaReadingProgress,
  type MangaDownload,
  type InsertMangaDownload,
  type AnimeEpisode,
  type InsertAnimeEpisode,
  type AnimeStreamingSource,
  type InsertAnimeStreamingSource,
  type AnimeWatchHistory,
  type InsertAnimeWatchHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, count, sql, and } from "drizzle-orm";
import { inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserXP(userId: string, xpToAdd: number): Promise<User>;

  // Anime operations
  getAnimes(limit?: number): Promise<Anime[]>;
  getAnimeByMalId(malId: number): Promise<Anime | undefined>;
  createAnime(anime: InsertAnime): Promise<Anime>;
  getTrendingAnimes(): Promise<Anime[]>;
  searchAnimes(query: string): Promise<Anime[]>;
  updateAnimeGogoId(animeId: number, gogoAnimeId: string): Promise<Anime>;

  // Anime streaming operations
  getAnimeEpisodes(animeId: number): Promise<AnimeEpisode[]>;
  getAnimeEpisode(episodeId: number): Promise<AnimeEpisode | undefined>;
  createAnimeEpisode(episode: InsertAnimeEpisode): Promise<AnimeEpisode>;
  getEpisodeStreamingSources(episodeId: number): Promise<AnimeStreamingSource[]>;
  createStreamingSource(source: InsertAnimeStreamingSource): Promise<AnimeStreamingSource>;
  getUserWatchHistory(userId: string, animeId?: number): Promise<AnimeWatchHistory[]>;
  updateWatchHistory(history: InsertAnimeWatchHistory): Promise<AnimeWatchHistory>;
  markEpisodeWatched(userId: string, episodeId: number, watchedDuration: number, totalDuration: number): Promise<AnimeWatchHistory>;

  // Manga operations
  getMangas(limit?: number): Promise<Manga[]>;
  getMangaByMalId(malId: number): Promise<Manga | undefined>;
  createManga(manga: InsertManga): Promise<Manga>;
  getTrendingMangas(): Promise<Manga[]>;
  searchMangas(query: string): Promise<Manga[]>;
  getMangaChapters(mangaId: number, limit?: number): Promise<MangaChapter[]>;
  getChapterById(id: number): Promise<MangaChapter | undefined>;
  createMangaChapter(chapter: InsertMangaChapter): Promise<MangaChapter>;
  getUserReadingProgress(userId: string, mangaId?: number): Promise<MangaReadingProgress[]>;
  updateReadingProgress(progress: InsertMangaReadingProgress): Promise<MangaReadingProgress>;
  getUserDownloads(userId: string): Promise<MangaDownload[]>;
  createDownload(download: InsertMangaDownload): Promise<MangaDownload>;
  updateDownloadStatus(id: number, status: string, downloadUrl?: string): Promise<MangaDownload>;
  updateMangaChapter(id: number, updates: Partial<InsertMangaChapter>): Promise<MangaChapter>;

  // Anime favorites operations
  getUserFavorites(userId: string): Promise<AnimeFavorite[]>;
  addToFavorites(favorite: InsertAnimeFavorite): Promise<AnimeFavorite>;
  removeFromFavorites(userId: string, animeId: number): Promise<void>;

  // Quiz operations
  getQuizzes(): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getFeaturedQuiz(): Promise<Quiz | undefined>;

  // Quiz results operations
  getUserQuizResults(userId: string): Promise<QuizResult[]>;
  createQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getUserStats(userId: string): Promise<{
    totalQuizzes: number;
    totalAnime: number;
    totalXP: number;
    rank: number;
  }>;



  // Profile operations
  updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<User>;

  // Chat operations
  getChatRooms(userId?: string): Promise<ChatRoom[]>;
  getChatRoom(id: number): Promise<ChatRoom | undefined>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  getChatMessages(roomId: number, limit?: number): Promise<ChatMessage[]>;
  sendChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  joinChatRoom(membership: InsertChatRoomMember): Promise<ChatRoomMember>;
  getUserChatRooms(userId: string): Promise<ChatRoom[]>;

  // Admin operations
  getAdminPosts(published?: boolean): Promise<any[]>;
  getAdminPost(id: number): Promise<AdminPost | undefined>;
  createAdminPost(post: InsertAdminPost): Promise<AdminPost>;
  updateAdminPost(id: number, updates: Partial<InsertAdminPost>): Promise<AdminPost>;
  deleteAdminPost(id: number): Promise<void>;
  getPublicPosts(): Promise<any[]>;
  
  // Posts operations for frontend
  getPublishedPosts(): Promise<AdminPost[]>;
  getPost(id: number): Promise<AdminPost | undefined>;
  createPost(post: InsertAdminPost): Promise<AdminPost>;
  
  // Animal anime operations
  getAnimalAnimes(limit?: number): Promise<Anime[]>;
  searchAnimalAnimes(query: string): Promise<Anime[]>;
  
  // Extended admin operations
  getUsersPaginated(limit: number, offset: number): Promise<User[]>;
  updateUserAdmin(userId: string, updates: any): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  deleteQuiz(quizId: number): Promise<void>;
  updateQuiz(quizId: number, updates: any): Promise<Quiz>;
  deleteAnime(animeId: number): Promise<void>;
  deleteManga(mangaId: number): Promise<void>;
  deleteChatMessage(messageId: number): Promise<void>;
  cleanupOldSessions(): Promise<void>;
  cleanupUnusedData(): Promise<void>;

  // Utility operations
  ensureDefaultChatRoom(): Promise<void>;
  ensureAdminUser(): Promise<void>;
  getPlatformStats(): Promise<{
    totalUsers: number;
    totalQuizzes: number;
    totalAnime: number;
    totalMessages: number;
    totalPosts: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserXP(userId: string, xpToAdd: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        xp: sql`${users.xp} + ${xpToAdd}`,
        level: sql`FLOOR(${users.xp} / 100) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Anime operations
  async getAnimes(limit = 20): Promise<Anime[]> {
    return await db.select().from(animes).orderBy(desc(animes.createdAt)).limit(limit);
  }

  async getAnimeByMalId(malId: number): Promise<Anime | undefined> {
    const [anime] = await db.select().from(animes).where(eq(animes.malId, malId));
    return anime;
  }

  async createAnime(anime: InsertAnime): Promise<Anime> {
    const [newAnime] = await db.insert(animes).values(anime).returning();
    return newAnime;
  }

  async getTrendingAnimes(): Promise<Anime[]> {
    return await db.select().from(animes).orderBy(desc(animes.score)).limit(10);
  }

  async searchAnimes(query: string): Promise<Anime[]> {
    return await db
      .select()
      .from(animes)
      .where(sql`${animes.title} ILIKE ${'%' + query + '%'}`)
      .limit(20);
  }

  async updateAnimeGogoId(animeId: number, gogoAnimeId: string): Promise<Anime> {
    const [result] = await db
      .update(animes)
      .set({ gogoAnimeId })
      .where(eq(animes.id, animeId))
      .returning();
    return result;
  }

  async getAnimeEpisodes(animeId: number): Promise<AnimeEpisode[]> {
    return await db
      .select()
      .from(animeEpisodes)
      .where(eq(animeEpisodes.animeId, animeId))
      .orderBy(animeEpisodes.episodeNumber);
  }

  async getAnimeEpisode(episodeId: number): Promise<AnimeEpisode | undefined> {
    const [result] = await db
      .select()
      .from(animeEpisodes)
      .where(eq(animeEpisodes.id, episodeId));
    return result;
  }

  async createAnimeEpisode(episode: InsertAnimeEpisode): Promise<AnimeEpisode> {
    const [result] = await db
      .insert(animeEpisodes)
      .values(episode)
      .returning();
    return result;
  }

  async getEpisodeStreamingSources(episodeId: number): Promise<AnimeStreamingSource[]> {
    return await db
      .select()
      .from(animeStreamingSources)
      .where(eq(animeStreamingSources.episodeId, episodeId))
      .orderBy(desc(animeStreamingSources.isDefault));
  }

  async createStreamingSource(source: InsertAnimeStreamingSource): Promise<AnimeStreamingSource> {
    const [result] = await db
      .insert(animeStreamingSources)
      .values(source)
      .returning();
    return result;
  }

  async getUserWatchHistory(userId: string, animeId?: number): Promise<AnimeWatchHistory[]> {
    const whereConditions = animeId 
      ? and(eq(animeWatchHistory.userId, userId), eq(animes.id, animeId))
      : eq(animeWatchHistory.userId, userId);

    const result = await db
      .select({
        id: animeWatchHistory.id,
        userId: animeWatchHistory.userId,
        episodeId: animeWatchHistory.episodeId,
        watchedAt: animeWatchHistory.watchedAt,
        watchedDuration: animeWatchHistory.watchedDuration,
        totalDuration: animeWatchHistory.totalDuration,
        isCompleted: animeWatchHistory.isCompleted,
        episodeNumber: animeEpisodes.episodeNumber,
        episodeTitle: animeEpisodes.title,
        animeTitle: animes.title,
        animeId: animes.id,
      })
      .from(animeWatchHistory)
      .innerJoin(animeEpisodes, eq(animeWatchHistory.episodeId, animeEpisodes.id))
      .innerJoin(animes, eq(animeEpisodes.animeId, animes.id))
      .where(whereConditions)
      .orderBy(desc(animeWatchHistory.watchedAt));

    return result as any[];
  }

  async updateWatchHistory(history: InsertAnimeWatchHistory): Promise<AnimeWatchHistory> {
    const existing = await db
      .select()
      .from(animeWatchHistory)
      .where(
        and(
          eq(animeWatchHistory.userId, history.userId),
          eq(animeWatchHistory.episodeId, history.episodeId)
        )
      );

    if (existing.length > 0) {
      const [result] = await db
        .update(animeWatchHistory)
        .set({
          watchedDuration: history.watchedDuration,
          totalDuration: history.totalDuration,
          isCompleted: history.isCompleted,
          watchedAt: new Date(),
        })
        .where(eq(animeWatchHistory.id, existing[0].id))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(animeWatchHistory)
        .values(history)
        .returning();
      return result;
    }
  }

  async markEpisodeWatched(userId: string, episodeId: number, watchedDuration: number, totalDuration: number): Promise<AnimeWatchHistory> {
    const isCompleted = watchedDuration >= totalDuration * 0.9;
    
    return this.updateWatchHistory({
      userId,
      episodeId,
      watchedDuration,
      totalDuration,
      isCompleted,
    });
  }

  // Manga operations
  async getMangas(limit = 20): Promise<Manga[]> {
    return await db.select().from(mangas).orderBy(desc(mangas.createdAt)).limit(limit);
  }

  async getMangaByMalId(malId: number): Promise<Manga | undefined> {
    const [manga] = await db.select().from(mangas).where(eq(mangas.malId, malId));
    return manga;
  }

  async createManga(manga: InsertManga): Promise<Manga> {
    const [newManga] = await db.insert(mangas).values(manga).returning();
    return newManga;
  }

  async getTrendingMangas(): Promise<Manga[]> {
    return await db.select().from(mangas).orderBy(desc(mangas.score)).limit(10);
  }

  async searchMangas(query: string): Promise<Manga[]> {
    return await db
      .select()
      .from(mangas)
      .where(sql`${mangas.title} ILIKE ${'%' + query + '%'}`)
      .limit(20);
  }

  async getMangaChapters(mangaId: number, limit = 50): Promise<MangaChapter[]> {
    return await db
      .select()
      .from(mangaChapters)
      .where(eq(mangaChapters.mangaId, mangaId))
      .orderBy(mangaChapters.chapterNumber)
      .limit(limit);
  }

  async getChapterById(id: number): Promise<MangaChapter | undefined> {
    const [chapter] = await db.select().from(mangaChapters).where(eq(mangaChapters.id, id));
    return chapter;
  }

  async createMangaChapter(chapter: InsertMangaChapter): Promise<MangaChapter> {
    const [newChapter] = await db.insert(mangaChapters).values(chapter).returning();
    return newChapter;
  }

  async updateMangaChapter(id: number, updates: Partial<InsertMangaChapter>): Promise<MangaChapter> {
    const [updatedChapter] = await db
      .update(mangaChapters)
      .set(updates)
      .where(eq(mangaChapters.id, id))
      .returning();
    return updatedChapter;
  }

  async getUserReadingProgress(userId: string, mangaId?: number): Promise<MangaReadingProgress[]> {
    const whereConditions = mangaId 
      ? and(eq(mangaReadingProgress.userId, userId), eq(mangaReadingProgress.mangaId, mangaId))
      : eq(mangaReadingProgress.userId, userId);

    const result = await db
      .select()
      .from(mangaReadingProgress)
      .where(whereConditions)
      .orderBy(desc(mangaReadingProgress.updatedAt));

    return result;
  }

  async updateReadingProgress(progress: InsertMangaReadingProgress): Promise<MangaReadingProgress> {
    const [updatedProgress] = await db
      .insert(mangaReadingProgress)
      .values(progress)
      .onConflictDoUpdate({
        target: [mangaReadingProgress.userId, mangaReadingProgress.mangaId],
        set: {
          lastChapterId: progress.lastChapterId,
          lastPageNumber: progress.lastPageNumber,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updatedProgress;
  }

  // Download operations
  async getUserDownloads(userId: string): Promise<MangaDownload[]> {
    return await db
      .select()
      .from(mangaDownloads)
      .where(eq(mangaDownloads.userId, userId))
      .orderBy(desc(mangaDownloads.createdAt));
  }

  async createDownload(download: InsertMangaDownload): Promise<MangaDownload> {
    const [newDownload] = await db.insert(mangaDownloads).values(download).returning();
    return newDownload;
  }

  async updateDownloadStatus(id: number, status: string, downloadUrl?: string): Promise<MangaDownload> {
    const updateData: any = { 
      status, 
      ...(downloadUrl && { downloadUrl }),
      ...(status === 'completed' && { downloadedAt: new Date() })
    };

    const [updatedDownload] = await db
      .update(mangaDownloads)
      .set(updateData)
      .where(eq(mangaDownloads.id, id))
      .returning();
    return updatedDownload;
  }

  // Anime favorites operations
  async getUserFavorites(userId: string): Promise<AnimeFavorite[]> {
    return await db.select().from(animeFavorites).where(eq(animeFavorites.userId, userId));
  }

  async addToFavorites(favorite: InsertAnimeFavorite): Promise<AnimeFavorite> {
    const [newFavorite] = await db.insert(animeFavorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFromFavorites(userId: string, animeId: number): Promise<void> {
    await db
      .delete(animeFavorites)
      .where(
        sql`${animeFavorites.userId} = ${userId} AND ${animeFavorites.animeId} = ${animeId}`
      );
  }

  // Quiz operations
  async getQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    try {
      const quiz = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, id))
        .limit(1);

      if (!quiz[0]) {
        return undefined;
      }

      const quizData = quiz[0];
      console.log("Raw quiz data from DB:", quizData);

      // Parse questions if they're stored as JSON string
      if (typeof quizData.questions === 'string') {
        try {
          quizData.questions = JSON.parse(quizData.questions);
        } catch (parseError) {
          console.error("Error parsing questions JSON:", parseError);
          quizData.questions = [];
        }
      }

      console.log("Processed quiz data:", quizData);
      return quizData;
    } catch (error) {
      console.error("Error getting quiz:", error);
      throw error;
    }
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async deleteAllQuizzes(): Promise<void> {
    // Delete all quiz results first (foreign key constraint)
    await db.delete(quizResults);
    // Then delete all quizzes
    await db.delete(quizzes);
  }

  async cleanupDuplicateQuizzes(): Promise<void> {
    // Delete auto-generated quiz duplicates, keeping only unique titles
    const allQuizzes = await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
    const seenTitles = new Set();
    const toDelete = [];

    for (const quiz of allQuizzes) {
      if (seenTitles.has(quiz.title) || quiz.title.includes('Quiz Anime du Jour')) {
        toDelete.push(quiz.id);
      } else {
        seenTitles.add(quiz.title);
      }
    }

    // Delete quiz results for duplicates first
    if (toDelete.length > 0) {
      await db.delete(quizResults).where(inArray(quizResults.quizId, toDelete));
      await db.delete(quizzes).where(inArray(quizzes.id, toDelete));
    }
  }

  async getFeaturedQuiz(): Promise<Quiz | undefined> {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.difficulty, "hard"))
      .orderBy(desc(quizzes.xpReward))
      .limit(1);
    return quiz;
  }

  // Quiz results operations
  async getUserQuizResults(userId: string): Promise<QuizResult[]> {
    return await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.completedAt));
  }

  async createQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const [newResult] = await db.insert(quizResults).values(result).returning();
    return newResult;
  }

  async getUserStats(userId: string): Promise<{
    totalQuizzes: number;
    totalAnime: number;
    totalXP: number;
    rank: number;
  }> {
    const [quizCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizResults)
      .where(eq(quizResults.userId, userId));

    const [animeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(animeFavorites)
      .where(eq(animeFavorites.userId, userId));

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    const [rankResult] = await db
      .select({ rank: sql<number>`COUNT(*) + 1` })
      .from(users)
      .where(sql`${users.xp} > ${user?.xp || 0}`);

    return {
      totalQuizzes: quizCount?.count || 0,
      totalAnime: animeCount?.count || 0,
      totalXP: user?.xp || 0,
      rank: rankResult?.rank || 1,
    };
  }



  // Profile operations
  async updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Chat operations
  async getChatRooms(userId?: string): Promise<ChatRoom[]> {
    if (userId) {
      return await db
        .select({
          id: chatRooms.id,
          name: chatRooms.name,
          description: chatRooms.description,
          isPrivate: chatRooms.isPrivate,
          createdBy: chatRooms.createdBy,
          createdAt: chatRooms.createdAt,
        })
        .from(chatRooms)
        .innerJoin(chatRoomMembers, eq(chatRoomMembers.roomId, chatRooms.id))
        .where(eq(chatRoomMembers.userId, userId))
        .orderBy(desc(chatRooms.createdAt));
    }
    return await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.isPrivate, false))
      .orderBy(desc(chatRooms.createdAt));
  }

  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room;
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const [newRoom] = await db.insert(chatRooms).values(room).returning();
    // Auto-join the creator
    await db.insert(chatRoomMembers).values({
      roomId: newRoom.id,
      userId: room.createdBy,
    });
    return newRoom;
  }

  async getChatMessages(roomId: number, limit: number = 100): Promise<any[]> {
    const results = await db
      .select({
        id: chatMessages.id,
        content: chatMessages.message,
        userId: chatMessages.userId,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userProfileImageUrl: users.profileImageUrl,
        isAdmin: users.isAdmin,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(chatMessages.createdAt) // Ordre chronologique direct
      .limit(limit);

    // Retourner les messages dans l'ordre chronologique
    return results.map(result => ({
      ...result,
      timestamp: result.createdAt, // Assurer la compatibilité
      username: result.userFirstName || 'Utilisateur' // Fallback pour le nom
    }));
  }

  async sendChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async joinChatRoom(membership: InsertChatRoomMember): Promise<ChatRoomMember> {
    const [newMember] = await db.insert(chatRoomMembers).values(membership).returning();
    return newMember;
  }

  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    return await db
      .select({
        id: chatRooms.id,
        name: chatRooms.name,
        description: chatRooms.description,
        isPrivate: chatRooms.isPrivate,
        createdBy: chatRooms.createdBy,
        createdAt: chatRooms.createdAt,
      })
      .from(chatRooms)
      .innerJoin(chatRoomMembers, eq(chatRoomMembers.roomId, chatRooms.id))
      .where(eq(chatRoomMembers.userId, userId))
      .orderBy(desc(chatRooms.createdAt));
  }

  // Public posts operations
  async getPublicPosts(): Promise<any[]> {
    return await db.select({
      id: adminPosts.id,
      title: adminPosts.title,
      content: adminPosts.content,
      type: adminPosts.type,
      isPublished: adminPosts.isPublished,
      adminOnly: adminPosts.adminOnly,
      authorId: adminPosts.authorId,
      imageUrl: adminPosts.imageUrl,
      createdAt: adminPosts.createdAt,
      updatedAt: adminPosts.updatedAt,
      authorName: users.firstName,
      authorLastName: users.lastName,
      authorProfileImageUrl: users.profileImageUrl,
    })
    .from(adminPosts)
    .leftJoin(users, eq(adminPosts.authorId, users.id))
    .where(and(eq(adminPosts.isPublished, true), eq(adminPosts.adminOnly, false)))
    .orderBy(desc(adminPosts.createdAt));
  }

  // Admin operations
  async getAdminPosts(published?: boolean): Promise<any[]> {
    const query = db.select({
      id: adminPosts.id,
      title: adminPosts.title,
      content: adminPosts.content,
      type: adminPosts.type,
      isPublished: adminPosts.isPublished,
      adminOnly: adminPosts.adminOnly,
      authorId: adminPosts.authorId,
      imageUrl: adminPosts.imageUrl,
      createdAt: adminPosts.createdAt,
      updatedAt: adminPosts.updatedAt,
      authorName: users.firstName,
      authorLastName: users.lastName,
      authorProfileImageUrl: users.profileImageUrl,
    })
    .from(adminPosts)
    .leftJoin(users, eq(adminPosts.authorId, users.id));

    if (published !== undefined) {
      query.where(eq(adminPosts.isPublished, published));
    }

    return await query.orderBy(desc(adminPosts.createdAt));
  }

  async getAdminPost(id: number): Promise<AdminPost | undefined> {
    const [post] = await db.select().from(adminPosts).where(eq(adminPosts.id, id));
    return post;
  }

  async createAdminPost(post: InsertAdminPost): Promise<AdminPost> {
    const [newPost] = await db.insert(adminPosts).values(post).returning();
    return newPost;
  }

  async updateAdminPost(id: number, updates: Partial<InsertAdminPost>): Promise<AdminPost> {
    const [updatedPost] = await db
      .update(adminPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adminPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteAdminPost(id: number): Promise<void> {
    await db.delete(adminPosts).where(eq(adminPosts.id, id));
  }

  // Ensure admin user exists
  async ensureAdminUser(): Promise<void> {
    try {
      const adminUser = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);

      if (adminUser.length === 0) {
        // Check if there's a user that should be admin
        const adminEmail = process.env.ADMIN_USER_ID || "sorokomarco@gmail.com";
        const potentialAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

        if (potentialAdmin.length > 0) {
          // Make this user admin
          await db.update(users)
            .set({ isAdmin: true })
            .where(eq(users.id, potentialAdmin[0].id));
        }
      }
    } catch (error) {
      console.error("Error ensuring admin user:", error);
    }
  }

  // Ensure default chat room exists
  async ensureDefaultChatRoom(): Promise<void> {
    try {
      const existingRoom = await db.select().from(chatRooms).where(eq(chatRooms.id, 1)).limit(1);

      if (existingRoom.length === 0) {
        // Get the first admin user to be the creator, or create with a real user
        const adminUser = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);

        if (adminUser.length > 0) {
          // Create default room with admin as creator
          await db.insert(chatRooms).values({
            id: 1,
            name: "🌸 Otaku Community",
            description: "Chat général de la communauté otaku - Partagez vos discussions, recommandations et découvertes !",
            isPrivate: false,
            createdBy: adminUser[0].id
          }).onConflictDoNothing();
        } else {
          // If no admin exists, wait for a user to be created
          console.log("No admin user found, waiting for user creation to setup default chat room");
        }
      }
    } catch (error) {
      console.error("Error ensuring default chat room:", error);
    }
  }

  // Get platform statistics for admin dashboard
  async getPlatformStats(): Promise<{
    totalUsers: number;
    totalQuizzes: number;
    totalAnime: number;
    totalMessages: number;
    totalPosts: number;
  }> {
    try {
      const [usersCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      const [quizzesCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(quizzes);

      const [animeCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(animes);

      const [messagesCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(chatMessages);

      const [postsCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(adminPosts);

      return {
        totalUsers: usersCount?.count || 0,
        totalQuizzes: quizzesCount?.count || 0,
        totalAnime: animeCount?.count || 0,
        totalMessages: messagesCount?.count || 0,
        totalPosts: postsCount?.count || 0,
      };
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      return {
        totalUsers: 0,
        totalQuizzes: 0,
        totalAnime: 0,
        totalMessages: 0,
        totalPosts: 0,
      };
    }
  }

  // Extended admin operations
  async getUsersPaginated(limit: number, offset: number): Promise<User[]> {
    return await db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
  }

  async updateUserAdmin(userId: string, updates: any): Promise<User> {
    const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async deleteQuiz(quizId: number): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, quizId));
  }

  async updateQuiz(quizId: number, updates: any): Promise<Quiz> {
    const [updatedQuiz] = await db.update(quizzes).set(updates).where(eq(quizzes.id, quizId)).returning();
    return updatedQuiz;
  }

  async deleteAnime(animeId: number): Promise<void> {
    await db.delete(animes).where(eq(animes.id, animeId));
  }

  async deleteManga(mangaId: number): Promise<void> {
    await db.delete(mangas).where(eq(mangas.id, mangaId));
  }

  async deleteChatMessage(messageId: number): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.id, messageId));
  }

  async cleanupOldSessions(): Promise<void> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await db.execute(sql`DELETE FROM sessions WHERE expires < ${oneWeekAgo}`);
  }

  async cleanupUnusedData(): Promise<void> {
    // Clean up quiz results for deleted quizzes
    await db.delete(quizResults).where(sql`${quizResults.quizId} NOT IN (SELECT id FROM ${quizzes})`);
    
    // Clean up favorites for deleted anime/manga
    await db.delete(animeFavorites).where(sql`${animeFavorites.animeId} NOT IN (SELECT id FROM ${animes})`);
  }

  // Posts operations for frontend
  async getPublishedPosts(): Promise<AdminPost[]> {
    return await db.select().from(adminPosts).where(eq(adminPosts.isPublished, true)).orderBy(desc(adminPosts.createdAt));
  }

  async getPost(id: number): Promise<AdminPost | undefined> {
    const [post] = await db.select().from(adminPosts).where(eq(adminPosts.id, id));
    return post;
  }

  async createPost(postData: InsertAdminPost): Promise<AdminPost> {
    const [post] = await db.insert(adminPosts).values(postData).returning();
    return post;
  }

  // Animal anime operations
  async getAnimalAnimes(limit: number = 20): Promise<Anime[]> {
    // Get animes with animal themes or characters
    return await db.select()
      .from(animes)
      .where(sql`${animes.title} ILIKE '%animal%' OR ${animes.title} ILIKE '%cat%' OR ${animes.title} ILIKE '%dog%' OR ${animes.synopsis} ILIKE '%animal%'`)
      .limit(limit)
      .orderBy(desc(animes.createdAt));
  }

  async searchAnimalAnimes(query: string): Promise<Anime[]> {
    return await db.select()
      .from(animes)
      .where(
        and(
          like(animes.title, `%${query}%`),
          sql`(${animes.title} ILIKE '%animal%' OR ${animes.title} ILIKE '%cat%' OR ${animes.title} ILIKE '%dog%' OR ${animes.synopsis} ILIKE '%animal%')`
        )
      )
      .limit(20);
  }
}

export const storage = new DatabaseStorage();