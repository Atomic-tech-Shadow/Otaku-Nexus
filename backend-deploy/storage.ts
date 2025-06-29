import {
  users,
  quizzes,
  quizResults,
  chatRooms,
  chatMessages,
  chatRoomMembers,
  adminPosts,

  type User,
  type UpsertUser,
  type UpdateUserProfile,
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

} from "./shared/schema";
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
  
  // Extended admin operations
  getUsersPaginated(limit: number, offset: number): Promise<User[]>;
  updateUserAdmin(userId: string, updates: any): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  deleteQuiz(quizId: number): Promise<void>;
  updateQuiz(quizId: number, updates: any): Promise<Quiz>;

  deleteChatMessage(messageId: number): Promise<void>;
  cleanupOldSessions(): Promise<void>;
  cleanupUnusedData(): Promise<void>;

  // Utility operations
  ensureDefaultChatRoom(): Promise<void>;
  ensureAdminUser(): Promise<void>;
  getPlatformStats(): Promise<{
    totalUsers: number;
    totalQuizzes: number;
    totalMessages: number;
    totalPosts: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: any): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
      const result = await db
        .update(users)
        .set({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(users)
        .values({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
          xp: 0,
          level: 1,
          achievements: [],
          isAdmin: false,
        })
        .returning();
      return result[0];
    }
  }

  async updateUserXP(userId: string, xpToAdd: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const newXP = user.xp + xpToAdd;
    const newLevel = Math.floor(newXP / 100) + 1;

    const result = await db
      .update(users)
      .set({
        xp: newXP,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return result[0];
  }

  async getQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const result = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
    return result[0];
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const result = await db.insert(quizzes).values(quiz).returning();
    return result[0];
  }

  async deleteAllQuizzes(): Promise<void> {
    await db.delete(quizzes);
  }

  async cleanupDuplicateQuizzes(): Promise<void> {
    // Keep only the first occurrence of each title
    const duplicates = await db.execute(sql`
      DELETE FROM quizzes 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM quizzes 
        GROUP BY title
      )
    `);
  }

  async getFeaturedQuiz(): Promise<Quiz | undefined> {
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.isFeatured, true))
      .limit(1);
    return result[0];
  }

  async getUserQuizResults(userId: string): Promise<QuizResult[]> {
    return await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.completedAt));
  }

  async createQuizResult(result: InsertQuizResult): Promise<QuizResult> {
    const quizResult = await db.insert(quizResults).values(result).returning();
    
    // Update user XP
    await this.updateUserXP(result.userId, result.xpEarned);
    
    return quizResult[0];
  }

  async getUserStats(userId: string): Promise<{
    totalQuizzes: number;
    totalXP: number;
    rank: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { totalQuizzes: 0, totalXP: 0, rank: 0 };
    }

    // Get total quizzes completed
    const totalQuizzesResult = await db
      .select({ count: count() })
      .from(quizResults)
      .where(eq(quizResults.userId, userId));

    // Get rank based on XP
    const rankResult = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.xp} > ${user.xp}`);

    return {
      totalQuizzes: totalQuizzesResult[0]?.count || 0,
      totalXP: user.xp,
      rank: (rankResult[0]?.count || 0) + 1,
    };
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    return await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
        xp: users.xp,
        level: users.level,
      })
      .from(users)
      .orderBy(desc(users.xp))
      .limit(limit);
  }

  async updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<User> {
    const result = await db
      .update(users)
      .set({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        avatar: profile.avatar,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return result[0];
  }

  async getChatRooms(userId?: string): Promise<ChatRoom[]> {
    if (userId) {
      // Get rooms the user is a member of
      return await db
        .select({
          id: chatRooms.id,
          name: chatRooms.name,
          description: chatRooms.description,
          isPrivate: chatRooms.isPrivate,
          createdBy: chatRooms.createdBy,
          createdAt: chatRooms.createdAt,
          updatedAt: chatRooms.updatedAt,
        })
        .from(chatRooms)
        .innerJoin(chatRoomMembers, eq(chatRooms.id, chatRoomMembers.roomId))
        .where(eq(chatRoomMembers.userId, userId))
        .orderBy(desc(chatRooms.updatedAt));
    } else {
      // Get all public rooms
      return await db
        .select()
        .from(chatRooms)
        .where(eq(chatRooms.isPrivate, false))
        .orderBy(desc(chatRooms.updatedAt));
    }
  }

  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    const result = await db.select().from(chatRooms).where(eq(chatRooms.id, id)).limit(1);
    return result[0];
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const result = await db.insert(chatRooms).values(room).returning();
    
    // Auto-join the creator to the room
    await this.joinChatRoom({
      roomId: result[0].id,
      userId: room.createdBy,
    });
    
    return result[0];
  }

  async getChatMessages(roomId: number, limit: number = 100): Promise<any[]> {
    return await db
      .select({
        id: chatMessages.id,
        roomId: chatMessages.roomId,
        userId: chatMessages.userId,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          avatar: users.avatar,
        },
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async sendChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    
    // Update room's updatedAt timestamp
    await db
      .update(chatRooms)
      .set({ updatedAt: new Date() })
      .where(eq(chatRooms.id, message.roomId));
    
    return result[0];
  }

  async joinChatRoom(membership: InsertChatRoomMember): Promise<ChatRoomMember> {
    // Check if already a member
    const existing = await db
      .select()
      .from(chatRoomMembers)
      .where(
        and(
          eq(chatRoomMembers.roomId, membership.roomId),
          eq(chatRoomMembers.userId, membership.userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(chatRoomMembers).values(membership).returning();
    return result[0];
  }

  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    return this.getChatRooms(userId);
  }

  async getPublicPosts(): Promise<any[]> {
    return await db
      .select({
        id: adminPosts.id,
        title: adminPosts.title,
        content: adminPosts.content,
        createdAt: adminPosts.createdAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(adminPosts)
      .innerJoin(users, eq(adminPosts.author, users.id))
      .where(eq(adminPosts.isPublished, true))
      .orderBy(desc(adminPosts.createdAt));
  }

  async getAdminPosts(published?: boolean): Promise<any[]> {
    if (published !== undefined) {
      return await db
        .select({
          id: adminPosts.id,
          title: adminPosts.title,
          content: adminPosts.content,
          isPublished: adminPosts.isPublished,
          createdAt: adminPosts.createdAt,
          updatedAt: adminPosts.updatedAt,
          author: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
          },
        })
        .from(adminPosts)
        .innerJoin(users, eq(adminPosts.author, users.id))
        .where(eq(adminPosts.isPublished, published))
        .orderBy(desc(adminPosts.createdAt));
    } else {
      return await db
        .select({
          id: adminPosts.id,
          title: adminPosts.title,
          content: adminPosts.content,
          isPublished: adminPosts.isPublished,
          createdAt: adminPosts.createdAt,
          updatedAt: adminPosts.updatedAt,
          author: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
          },
        })
        .from(adminPosts)
        .innerJoin(users, eq(adminPosts.author, users.id))
        .orderBy(desc(adminPosts.createdAt));
    }
  }

  async getAdminPost(id: number): Promise<AdminPost | undefined> {
    const result = await db.select().from(adminPosts).where(eq(adminPosts.id, id)).limit(1);
    return result[0];
  }

  async createAdminPost(post: InsertAdminPost): Promise<AdminPost> {
    const result = await db.insert(adminPosts).values(post).returning();
    return result[0];
  }

  async updateAdminPost(id: number, updates: Partial<InsertAdminPost>): Promise<AdminPost> {
    const result = await db
      .update(adminPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adminPosts.id, id))
      .returning();

    return result[0];
  }

  async deleteAdminPost(id: number): Promise<void> {
    await db.delete(adminPosts).where(eq(adminPosts.id, id));
  }

  async ensureAdminUser(): Promise<void> {
    const adminEmail = "admin@otaku-nexus.com";
    const existingAdmin = await this.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      await this.createUser({
        id: "admin",
        email: adminEmail,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
        xp: 1000,
        level: 10,
        achievements: [],
      });
    }
  }

  async ensureDefaultChatRoom(): Promise<void> {
    const rooms = await this.getChatRooms();
    
    if (rooms.length === 0) {
      await this.ensureAdminUser();
      
      await this.createChatRoom({
        name: "Général",
        description: "Discussion générale pour tous les membres",
        isPrivate: false,
        createdBy: "admin",
      });
    }
  }

  async getPlatformStats(): Promise<{
    totalUsers: number;
    totalQuizzes: number;
    totalMessages: number;
    totalPosts: number;
  }> {
    const [usersCount, quizzesCount, messagesCount, postsCount] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(quizzes),
      db.select({ count: count() }).from(chatMessages),
      db.select({ count: count() }).from(adminPosts),
    ]);

    return {
      totalUsers: usersCount[0]?.count || 0,
      totalQuizzes: quizzesCount[0]?.count || 0,
      totalMessages: messagesCount[0]?.count || 0,
      totalPosts: postsCount[0]?.count || 0,
    };
  }

  async getUsersPaginated(limit: number, offset: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateUserAdmin(userId: string, updates: any): Promise<User> {
    const result = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return result[0];
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async deleteQuiz(quizId: number): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, quizId));
  }

  async updateQuiz(quizId: number, updates: any): Promise<Quiz> {
    const result = await db
      .update(quizzes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quizzes.id, quizId))
      .returning();

    return result[0];
  }

  async deleteChatMessage(messageId: number): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.id, messageId));
  }

  async cleanupOldSessions(): Promise<void> {
    // Delete expired sessions
    await db.execute(sql`DELETE FROM sessions WHERE expire < NOW()`);
  }

  async cleanupUnusedData(): Promise<void> {
    await this.cleanupOldSessions();
  }

  async getPublishedPosts(): Promise<AdminPost[]> {
    return await db
      .select()
      .from(adminPosts)
      .where(eq(adminPosts.isPublished, true))
      .orderBy(desc(adminPosts.createdAt));
  }

  async getPost(id: number): Promise<AdminPost | undefined> {
    return this.getAdminPost(id);
  }

  async createPost(postData: InsertAdminPost): Promise<AdminPost> {
    return this.createAdminPost(postData);
  }
}

export const storage = new DatabaseStorage();