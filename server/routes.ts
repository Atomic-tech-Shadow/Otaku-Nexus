import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertAnimeSchema,
  insertAnimeFavoriteSchema,
  insertMangaSchema,
  insertMangaFavoriteSchema,
  insertMangaChapterSchema,
  insertMangaReadingProgressSchema,
  insertMangaDownloadSchema,
  insertQuizSchema,
  insertQuizResultSchema,
  insertVideoSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertChatRoomMemberSchema,
  insertAdminPostSchema,
  updateUserProfileSchema,
} from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth";
import { mangaDxService } from "./mangadx-api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // User routes
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Anime routes
  app.get('/api/anime', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      let animes = await storage.getAnimes(limit);
      res.json(animes);
    } catch (error) {
      console.error("Error fetching animes:", error);
      res.status(500).json({ message: "Failed to fetch animes" });
    }
  });

  app.get('/api/anime/trending', async (req, res) => {
    try {
      let animes = await storage.getTrendingAnimes();
      res.json(animes);
    } catch (error) {
      console.error("Error fetching trending animes:", error);
      res.status(500).json({ message: "Failed to fetch trending animes" });
    }
  });

  // AnimeSama API routes
  app.get("/api/anime-sama/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const { animeSamaService } = await import("./anime-sama-api");
      const results = await animeSamaService.searchAnime(q);
      res.json(results);
    } catch (error) {
      console.error("Error searching anime:", error);
      res.status(500).json({ error: "Failed to search anime" });
    }
  });

  app.get("/api/anime-sama/anime/:animeId", async (req, res) => {
    try {
      const { animeId } = req.params;
      const { animeSamaService } = await import("./anime-sama-api");
      const animeInfo = await animeSamaService.getAnimeDetails(animeId);
      
      if (!animeInfo) {
        return res.status(404).json({ error: "Anime not found" });
      }

      res.json(animeInfo);
    } catch (error) {
      console.error("Error fetching anime details:", error);
      res.status(500).json({ error: "Failed to fetch anime details" });
    }
  });

  app.get("/api/anime-sama/episode/:episodeId/streaming", async (req, res) => {
    try {
      const { episodeId } = req.params;
      const { animeSamaService } = await import("./anime-sama-api");
      const streamingLinks = await animeSamaService.getEpisodeStreaming(episodeId);
      
      if (!streamingLinks) {
        return res.status(404).json({ error: "Episode streaming links not found" });
      }

      res.json(streamingLinks);
    } catch (error) {
      console.error("Error fetching episode streaming:", error);
      res.status(500).json({ error: "Failed to fetch episode streaming links" });
    }
  });

  app.get("/api/trending", async (req, res) => {
    try {
      const { animeSamaService } = await import("./anime-sama-api");
      const trending = await animeSamaService.getTrendingAnime();
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending anime:", error);
      res.status(500).json({ error: "Failed to fetch trending anime" });
    }
  });

  app.get("/api/catalogue", async (req, res) => {
    try {
      const { page = '1', genre, type } = req.query;
      const pageNum = parseInt(page as string);
      
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ error: "Invalid page number" });
      }

      const { animeSamaService } = await import("./anime-sama-api");
      const catalogue = await animeSamaService.getCatalogue(
        pageNum, 
        genre as string, 
        type as string
      );
      res.json(catalogue);
    } catch (error) {
      console.error("Error fetching catalogue:", error);
      res.status(500).json({ error: "Failed to fetch catalogue" });
    }
  });

  app.get("/api/genres", async (req, res) => {
    try {
      const { animeSamaService } = await import("./anime-sama-api");
      const genres = await animeSamaService.getGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ error: "Failed to fetch genres" });
    }
  });

  // Quiz routes
  app.get('/api/quizzes', async (req, res) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get('/api/quizzes/featured', async (req, res) => {
    try {
      const quiz = await storage.getFeaturedQuiz();
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching featured quiz:", error);
      res.status(500).json({ message: "Failed to fetch featured quiz" });
    }
  });

  // Chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getGlobalChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messageData = {
        content: req.body.content,
        userId,
        roomId: 1 // Global chat room
      };
      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}