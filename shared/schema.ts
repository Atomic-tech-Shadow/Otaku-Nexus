import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const newPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Updated for email/password auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username"),
  bio: text("bio"),
  favoriteQuote: text("favorite_quote"),
  isAdmin: boolean("is_admin").default(false),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auth tokens for password reset, email verification, etc.
export const authTokens = pgTable("auth_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull(),
  type: varchar("type").notNull(), // 'email_verification', 'password_reset'
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.token),
]);



export const mangas = pgTable("mangas", {
  id: serial("id").primaryKey(),
  malId: integer("mal_id").unique().notNull(),
  title: text("title").notNull(),
  synopsis: text("synopsis"),
  imageUrl: text("image_url"),
  score: text("score"),
  year: integer("year"),
  status: text("status"),
  chapters: integer("chapters"),
  volumes: integer("volumes"),
  genres: text("genres").array(),
  authors: text("authors").array(),
  serialization: text("serialization"),
  type: text("type"), // manga, manhwa, manhua, etc.
  createdAt: timestamp("created_at").defaultNow(),
});



export const mangaFavorites = pgTable("manga_favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  mangaId: integer("manga_id").notNull().references(() => mangas.id),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mangaChapters = pgTable("manga_chapters", {
  id: serial("id").primaryKey(),
  mangadxId: varchar("mangadx_id").unique().notNull(),
  mangaId: integer("manga_id").notNull().references(() => mangas.id),
  chapterNumber: text("chapter_number").notNull(),
  title: text("title"),
  volume: text("volume"),
  pages: integer("pages").default(0),
  translatedLanguage: text("translated_language").default("fr"),
  scanlationGroup: text("scanlation_group"),
  publishAt: timestamp("publish_at"),
  readableAt: timestamp("readable_at"),
  version: integer("version").default(1),
  hash: text("hash"),
  data: text("data").array(),
  dataSaver: text("data_saver").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mangaReadingProgress = pgTable("manga_reading_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  mangaId: integer("manga_id").notNull().references(() => mangas.id),
  lastChapterId: integer("last_chapter_id").references(() => mangaChapters.id),
  lastPageNumber: integer("last_page_number").default(1),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mangaDownloads = pgTable("manga_downloads", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  chapterId: integer("chapter_id").notNull().references(() => mangaChapters.id),
  downloadUrl: text("download_url"),
  status: text("status").default("pending"), // pending, downloading, completed, failed
  downloadedAt: timestamp("downloaded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  questions: jsonb("questions").notNull(),
  xpReward: integer("xp_reward").default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at").defaultNow(),
});



// Chat system tables
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").default(false),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"), // text, image, anime_share
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatRoomMembers = pgTable("chat_room_members", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Admin posts/announcements
export const adminPosts = pgTable("admin_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'announcement', 'event', 'update'
  isPublished: boolean("is_published").default(false),
  adminOnly: boolean("admin_only").default(false), // Only visible in admin panel
  authorId: text("author_id").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert and select schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  level: true,
  xp: true,
});



export const insertMangaSchema = createInsertSchema(mangas).omit({
  id: true,
  createdAt: true,
});

export const insertMangaFavoriteSchema = createInsertSchema(mangaFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertMangaChapterSchema = createInsertSchema(mangaChapters).omit({
  id: true,
  createdAt: true,
});

export const insertMangaReadingProgressSchema = createInsertSchema(mangaReadingProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertMangaDownloadSchema = createInsertSchema(mangaDownloads).omit({
  id: true,
  createdAt: true,
  downloadedAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
  completedAt: true,
});



export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChatRoomMemberSchema = createInsertSchema(chatRoomMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertAdminPostSchema = createInsertSchema(adminPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = createInsertSchema(users).pick({
  username: true,
  bio: true,
  favoriteQuote: true,
  profileImageUrl: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export type Manga = typeof mangas.$inferSelect;
export type InsertManga = z.infer<typeof insertMangaSchema>;
export type MangaFavorite = typeof mangaFavorites.$inferSelect;
export type InsertMangaFavorite = z.infer<typeof insertMangaFavoriteSchema>;
export type MangaChapter = typeof mangaChapters.$inferSelect;
export type InsertMangaChapter = z.infer<typeof insertMangaChapterSchema>;
export type MangaReadingProgress = typeof mangaReadingProgress.$inferSelect;
export type InsertMangaReadingProgress = z.infer<typeof insertMangaReadingProgressSchema>;
export type MangaDownload = typeof mangaDownloads.$inferSelect;
export type InsertMangaDownload = z.infer<typeof insertMangaDownloadSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;

export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatRoomMember = typeof chatRoomMembers.$inferSelect;
export type InsertChatRoomMember = z.infer<typeof insertChatRoomMemberSchema>;
export type AdminPost = typeof adminPosts.$inferSelect;
export type InsertAdminPost = z.infer<typeof insertAdminPostSchema>;