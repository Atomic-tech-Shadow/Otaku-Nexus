import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { animeSamaService } from "./anime-sama-api";
import {
  insertQuizSchema,
  insertQuizResultSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertChatRoomMemberSchema,
  insertAdminPostSchema,
  updateUserProfileSchema,
  insertAnimeSchema,
  insertAnimeSeasonSchema,
  insertAnimeEpisodeSchema,
  insertAnimeFavoriteSchema,
  insertAnimeWatchingProgressSchema,
} from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth";

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

  // Leaderboard endpoint
  app.get('/api/users/leaderboard', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // User profile update endpoint
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Profile update request body:", req.body);
      const profileData = updateUserProfileSchema.parse(req.body);
      console.log("Parsed profile data:", profileData);
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      console.log("Updated user from DB:", updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
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
      const messages = await storage.getChatMessages(1);
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
        message: req.body.content,
        userId,
        roomId: 1 // Global chat room
      };
      const message = await storage.sendChatMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Accès refusé - Admin uniquement" });
      }
      next();
    } catch (error) {
      console.error("Admin auth error:", error);
      res.status(500).json({ message: "Erreur de vérification admin" });
    }
  };

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      const users = await storage.getUsersPaginated(limit, offset);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/quizzes', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.post('/api/admin/quizzes', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  app.put('/api/admin/quizzes/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const updates = req.body;
      const quiz = await storage.updateQuiz(quizId, updates);
      res.json(quiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  app.delete('/api/admin/quizzes/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      await storage.deleteQuiz(quizId);
      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  // Anime streaming routes with Anime-Sama API integration
  app.get('/api/anime/search', async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ message: "Query parameter required" });
      }
      const results = await animeSamaService.searchAnime(query as string);
      res.json(results);
    } catch (error) {
      console.error("Error searching anime:", error);
      res.status(500).json({ message: "Failed to search anime" });
    }
  });

  app.get('/api/anime/trending', async (req, res) => {
    try {
      const trending = await animeSamaService.getTrendingAnime();
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending anime:", error);
      res.status(500).json({ message: "Failed to fetch trending anime" });
    }
  });

  app.get('/api/anime/random', async (req, res) => {
    try {
      const randomAnime = await animeSamaService.getRandomAnime();
      res.json(randomAnime);
    } catch (error) {
      console.error("Error fetching random anime:", error);
      res.status(500).json({ message: "Failed to fetch random anime" });
    }
  });

  app.get('/api/anime/:animeId', async (req, res) => {
    try {
      const { animeId } = req.params;
      const anime = await animeSamaService.getAnimeById(animeId);
      if (!anime) {
        return res.status(404).json({ message: "Anime not found" });
      }
      res.json(anime);
    } catch (error) {
      console.error("Error fetching anime details:", error);
      res.status(500).json({ message: "Failed to fetch anime details" });
    }
  });

  app.get('/api/anime/:animeId/seasons/:season/episodes', async (req, res) => {
    try {
      const { animeId, season } = req.params;
      const { language = 'vostfr' } = req.query;
      const episodes = await animeSamaService.getSeasonEpisodes(
        animeId,
        parseInt(season),
        language as 'vf' | 'vostfr'
      );
      res.json(episodes);
    } catch (error) {
      console.error("Error fetching season episodes:", error);
      res.status(500).json({ message: "Failed to fetch season episodes" });
    }
  });

  app.get('/api/episode/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;
      const episode = await animeSamaService.getEpisodeDetails(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      res.json(episode);
    } catch (error) {
      console.error("Error fetching episode details:", error);
      res.status(500).json({ message: "Failed to fetch episode details" });
    }
  });

  app.get('/api/anime/catalogue', async (req, res) => {
    try {
      const catalogue = await animeSamaService.getCatalogue();
      res.json(catalogue);
    } catch (error) {
      console.error("Error fetching anime catalogue:", error);
      res.status(500).json({ message: "Failed to fetch anime catalogue" });
    }
  });

  app.get('/api/anime/genres', async (req, res) => {
    try {
      const genres = await animeSamaService.getGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}