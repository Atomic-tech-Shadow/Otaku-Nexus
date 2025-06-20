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
      
      // Ajouter les solutions CORS
      const enhancedEpisode = {
        success: true,
        data: {
          ...episode,
          sources: episode.sources.map(source => ({
            ...source,
            proxyUrl: `/api/proxy/${encodeURIComponent(source.url)}`,
            embedUrl: `/api/embed/${episodeId}`
          })),
          embedUrl: `/api/embed/${episodeId}`,
          corsInfo: {
            note: "Original URLs may have CORS restrictions. Use proxyUrl or embedUrl for direct access.",
            proxyEndpoint: "/api/proxy/[url]",
            embedEndpoint: "/api/embed/[episodeId]"
          }
        },
        timestamp: new Date().toISOString()
      };
      
      res.json(enhancedEpisode);
    } catch (error) {
      console.error("Error fetching episode details:", error);
      res.status(500).json({ message: "Failed to fetch episode details" });
    }
  });

  // Route proxy pour contourner CORS
  app.get('/api/proxy/:encodedUrl', async (req, res) => {
    try {
      const targetUrl = decodeURIComponent(req.params.encodedUrl);
      
      // Validation de sécurité - only allow anime-sama URLs
      if (!targetUrl.includes('anime-sama.fr') && !targetUrl.includes('streaming.anime-sama.fr')) {
        return res.status(403).json({ message: "URL not allowed" });
      }
      
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://anime-sama.fr/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      // Copier les headers appropriés
      res.set({
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
      const content = await response.text();
      res.send(content);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ message: "Proxy failed" });
    }
  });

  // Route embed pour iframe direct
  app.get('/api/embed/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;
      const episode = await animeSamaService.getEpisodeDetails(episodeId);
      
      if (!episode || !episode.sources.length) {
        return res.status(404).send(`
          <html>
            <body style="background: #000; color: #fff; text-align: center; padding: 50px;">
              <h2>Episode non trouvé</h2>
              <p>L'épisode demandé n'est pas disponible.</p>
            </body>
          </html>
        `);
      }
      
      const source = episode.sources[0];
      const embedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Episode ${episode.episodeNumber} - ${episode.animeTitle}</title>
          <style>
            body { margin: 0; padding: 0; background: #000; }
            iframe { width: 100%; height: 100vh; border: none; }
            .fallback { color: white; text-align: center; padding: 50px; }
          </style>
        </head>
        <body>
          <iframe src="${source.url}" allowfullscreen></iframe>
          <div class="fallback" style="display: none;">
            <h3>Lecteur indisponible</h3>
            <p>Tentative de chargement...</p>
            <a href="${source.url}" target="_blank" style="color: #1e40af;">
              Ouvrir dans un nouvel onglet
            </a>
          </div>
          <script>
            // Fallback si iframe ne charge pas
            setTimeout(() => {
              const iframe = document.querySelector('iframe');
              const fallback = document.querySelector('.fallback');
              if (!iframe.contentWindow) {
                iframe.style.display = 'none';
                fallback.style.display = 'block';
              }
            }, 5000);
          </script>
        </body>
        </html>
      `;
      
      res.set('Content-Type', 'text/html');
      res.send(embedHtml);
    } catch (error) {
      console.error("Embed error:", error);
      res.status(500).send('<html><body style="color: red;">Erreur de chargement</body></html>');
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