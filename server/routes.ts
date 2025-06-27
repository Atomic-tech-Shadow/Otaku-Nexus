import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import {
  insertQuizSchema,
  insertQuizResultSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertChatRoomMemberSchema,
  insertAdminPostSchema,
  updateUserProfileSchema,
} from "@shared/schema";
import { setupAuth, isAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint pour Render
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });



  

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

  app.get('/api/quizzes/:id', async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      if (isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
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
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Ensure default chat room exists
      let defaultRoomId = 1;
      try {
        // Check if room exists, if not create it
        await storage.ensureDefaultChatRoom();
      } catch (roomError: any) {
        console.log("Room creation info:", roomError.message);
      }

      const messageData = {
        message: content.trim(),
        userId,
        roomId: defaultRoomId
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

  // Quiz results route
  app.post('/api/quiz-results', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { quizId, score, totalQuestions, xpEarned } = req.body;

      // Create quiz result
      const quizResult = await storage.createQuizResult({
        userId,
        quizId,
        score,
        totalQuestions,
        xpEarned: xpEarned || 0
      });

      // Update user XP
      if (xpEarned > 0) {
        await storage.updateUserXP(userId, xpEarned);
      }

      res.json(quizResult);
    } catch (error) {
      console.error("Error creating quiz result:", error);
      res.status(500).json({ message: "Failed to save quiz result" });
    }
  });

  // Anime-Sama API Proxy Routes
  const ANIME_API_BASE = 'https://api-anime-sama.onrender.com';

  // Search animes
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      const response = await fetch(`${ANIME_API_BASE}/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching animes:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to search animes",
        data: []
      });
    }
  });

  // Get trending animes
  app.get('/api/trending', async (req, res) => {
    try {
      const response = await fetch(`${ANIME_API_BASE}/api/trending`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching trending animes:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch trending animes",
        data: []
      });
    }
  });

  // Get anime details with seasons
  app.get('/api/anime/:id', async (req, res) => {
    try {
      const animeId = req.params.id;
      const response = await fetch(`${ANIME_API_BASE}/api/anime/${animeId}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Enrichir les données avec plus de saisons pour certains animes populaires
      if (data.success && data.data) {
        const animeData = data.data;
        
        // Générer plus de saisons pour les animes à long terme
        const extendedSeasons = generateExtendedSeasons(animeId as string, animeData.seasons);
        animeData.seasons = extendedSeasons;
        
        res.json(data);
      } else {
        res.json(data);
      }
    } catch (error) {
      console.error("Error fetching anime details:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch anime details",
        data: null
      });
    }
  });

  // Fonction pour générer des saisons supplémentaires pour les animes populaires
  function generateExtendedSeasons(animeId: string, originalSeasons: any[]) {
    const seasonConfigs: {[key: string]: {count: number, episodesPerSeason: number}} = {
      'one-piece': { count: 21, episodesPerSeason: 50 },
      'naruto': { count: 5, episodesPerSeason: 25 },
      'naruto-shippuden': { count: 10, episodesPerSeason: 25 },
      'dragon-ball-z': { count: 7, episodesPerSeason: 20 },
      'bleach': { count: 16, episodesPerSeason: 25 },
      'hunter-x-hunter': { count: 6, episodesPerSeason: 25 },
      'attack-on-titan': { count: 4, episodesPerSeason: 12 },
      'my-hero-academia': { count: 7, episodesPerSeason: 13 },
      'demon-slayer': { count: 4, episodesPerSeason: 11 },
      'death-note': { count: 1, episodesPerSeason: 37 },
      'tokyo-ghoul': { count: 4, episodesPerSeason: 12 }
    };

    const config = seasonConfigs[animeId];
    if (!config) {
      return originalSeasons; // Retourner les saisons originales si pas de config spéciale
    }

    const seasons = [];
    for (let i = 1; i <= config.count; i++) {
      seasons.push({
        number: i,
        name: `Saison ${i}`,
        languages: ['VF', 'VOSTFR'],
        episodeCount: config.episodesPerSeason,
        url: `https://anime-sama.fr/catalogue/${animeId}/`
      });
    }

    return seasons;
  }

  // Get season episodes avec serveurs multiples configurés
  app.get('/api/seasons', async (req, res) => {
    try {
      const { animeId, season, language, server } = req.query;
      
      if (!animeId || !season || !language) {
        return res.status(400).json({ 
          success: false,
          message: "animeId, season, and language parameters are required" 
        });
      }

      try {
        const response = await fetch(`${ANIME_API_BASE}/api/seasons?animeId=${animeId}&season=${season}&language=${language}`);
        if (response.ok) {
          const data = await response.json();
          
          // Si l'API externe fonctionne, utiliser ses données
          if (data.success && data.data && Array.isArray(data.data)) {
            return res.json({
              success: true,
              data: data.data.map((episode: any) => ({
                id: episode.id || `${animeId}-episode-${episode.episodeNumber}-${String(language).toLowerCase()}`,
                title: episode.title || `Épisode ${episode.episodeNumber}`,
                episodeNumber: episode.episodeNumber,
                url: episode.url || `https://anime-sama.fr/catalogue/${animeId}/`,
                language: episode.language || language,
                available: episode.available !== false
              })),
              meta: {
                animeId,
                seasonNumber: parseInt(season as string),
                language,
                source: "anime-sama.fr"
              }
            });
          }
        }
      } catch (apiError) {
        console.log("API externe indisponible, utilisation du fallback local");
      }

      // Fallback local : générer des épisodes basiques
      const seasonNumber = parseInt(season as string);
      const episodeCount = getEpisodeCountForAnime(animeId as string, seasonNumber);
      
      const episodes = [];
      for (let i = 1; i <= episodeCount; i++) {
        episodes.push({
          id: `${animeId}-episode-${i}-${String(language).toLowerCase()}`,
          title: `Épisode ${i}`,
          episodeNumber: i,
          url: `https://anime-sama.fr/catalogue/${animeId}/`,
          language: language as string,
          available: true
        });
      }
      
      res.json({
        success: true,
        data: episodes,
        meta: {
          animeId,
          seasonNumber,
          language,
          totalEpisodes: episodeCount,
          source: "fallback-local"
        }
      });
      
    } catch (error) {
      console.error("Error fetching season episodes:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch episodes",
        data: []
      });
    }
  });

  // Fonction helper pour déterminer le nombre d'épisodes par anime
  function getEpisodeCountForAnime(animeId: string, season: number): number {
    const animeEpisodeCounts: { [key: string]: { [season: number]: number } } = {
      'chainsaw-man': { 1: 12 },
      'demon-slayer': { 1: 26, 2: 11, 3: 11 },
      'naruto': { 1: 220 },
      'one-piece': { 1: 1000 },
      'attack-on-titan': { 1: 25, 2: 12, 3: 22, 4: 16 },
      'my-hero-academia': { 1: 13, 2: 25, 3: 25, 4: 25, 5: 25, 6: 25 }
    };
    
    return animeEpisodeCounts[animeId]?.[season] || 12; // 12 épisodes par défaut
  }

  // Get episode sources with multiple servers
  app.get('/api/episode/:animeId/:seasonNumber/:episodeNumber', async (req, res) => {
    try {
      const { animeId, seasonNumber, episodeNumber } = req.params;
      const { language = 'VOSTFR', server = 'eps1' } = req.query;
      
      // Construire l'URL pour récupérer les sources multiples
      const response = await fetch(`${ANIME_API_BASE}/api/seasons?animeId=${animeId}&season=${seasonNumber}&language=${language}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.episodes) {
        const episode = data.data.episodes.find((ep: any) => ep.episodeNumber === parseInt(episodeNumber));
        
        if (episode) {
          // Retourner l'épisode avec les informations du serveur
          res.json({
            success: true,
            data: {
              id: episode.id,
              title: episode.title,
              episodeNumber: episode.episodeNumber,
              url: episode.url,
              server: episode.server || server,
              authentic: episode.authentic,
              animeTitle: animeId,
              language: language
            }
          });
        } else {
          throw new Error('Episode not found');
        }
      } else {
        throw new Error('No episodes data');
      }
    } catch (error) {
      console.error("Error fetching episode sources:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch episode sources",
        data: null
      });
    }
  });

  // Get episode sources (legacy endpoint)
  app.get('/api/episode/:id', async (req, res) => {
    try {
      const episodeId = req.params.id;
      const response = await fetch(`${ANIME_API_BASE}/api/episode/${episodeId}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching episode sources:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch episode sources",
        data: { sources: [] }
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}