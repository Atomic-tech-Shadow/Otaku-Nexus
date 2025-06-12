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
  getAdminPosts(published?: boolean): Promise<any[]>;
  getAdminPost(id: number): Promise<AdminPost | undefined>;
  createAdminPost(post: InsertAdminPost): Promise<AdminPost>;
  updateAdminPost(id: number, updates: Partial<InsertAdminPost>): Promise<AdminPost>;
  deleteAdminPost(id: number): Promise<void>;
  getPublicPosts(): Promise<any[]>;

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
}

export const storage = new DatabaseStorage();