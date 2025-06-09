import {
  users,
  animes,
  animeFavorites,
  quizzes,
  quizResults,
  videos,
  chatRooms,
  chatMessages,
  chatRoomMembers,
  adminPosts,
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
  type Video,
  type InsertVideo,
  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type ChatRoomMember,
  type InsertChatRoomMember,
  type AdminPost,
  type InsertAdminPost,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserXP(userId: string, xpToAdd: number): Promise<User>;
  
  // Anime operations
  getAnimes(limit?: number): Promise<Anime[]>;
  getAnimeByMalId(malId: number): Promise<Anime | undefined>;
  createAnime(anime: InsertAnime): Promise<Anime>;
  getTrendingAnimes(): Promise<Anime[]>;
  searchAnimes(query: string): Promise<Anime[]>;
  
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
  
  // Video operations
  getVideos(limit?: number): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  getPopularVideos(): Promise<Video[]>;
  
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
  getAdminPosts(published?: boolean): Promise<AdminPost[]>;
  getAdminPost(id: number): Promise<AdminPost | undefined>;
  createAdminPost(post: InsertAdminPost): Promise<AdminPost>;
  updateAdminPost(id: number, updates: Partial<InsertAdminPost>): Promise<AdminPost>;
  deleteAdminPost(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
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

  // Video operations
  async getVideos(limit = 20): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.createdAt)).limit(limit);
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async getPopularVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.views)).limit(10);
  }
}

export const storage = new DatabaseStorage();
