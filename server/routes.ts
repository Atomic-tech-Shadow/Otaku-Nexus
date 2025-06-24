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
  // Health check endpoint pour Render
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Anime-Sama API direct proxy routes - using https://api-anime-sama.onrender.com
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Query parameter required' });
      }
      
      const results = await animeSamaService.searchAnime(query);
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error in anime search:', error);
      res.status(500).json({ success: false, message: 'Search failed', error: error.message });
    }
  });

  app.get('/api/trending', async (req, res) => {
    try {
      const results = await animeSamaService.getTrendingAnime();
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching trending anime:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch trending anime', error: error.message });
    }
  });

  app.get('/api/anime/:id', async (req, res) => {
    try {
      const animeId = req.params.id;
      const anime = await animeSamaService.getAnimeById(animeId);
      
      if (!anime) {
        return res.status(404).json({ success: false, message: 'Anime not found' });
      }
      
      res.json({ success: true, data: anime });
    } catch (error) {
      console.error('Error fetching anime details:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch anime details', error: error.message });
    }
  });



  app.get('/api/episode/:id', async (req, res) => {
    try {
      const episodeId = req.params.id;
      const episode = await animeSamaService.getEpisodeDetails(episodeId);
      
      if (!episode) {
        return res.status(404).json({ success: false, message: 'Episode not found' });
      }
      
      res.json({ success: true, data: episode });
    } catch (error) {
      console.error('Error fetching episode details:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch episode details', error: error.message });
    }
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

  // Anime-Sama API routes
  app.get('/api/anime-sama/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Query parameter required' });
      }

      const results = await animeSamaService.searchAnime(query);
      res.json({ success: true, data: results, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error searching anime:', error);
      res.status(500).json({ success: false, message: 'Search failed' });
    }
  });

  app.get('/api/anime-sama/anime/:animeId', async (req, res) => {
    try {
      const { animeId } = req.params;
      const anime = await animeSamaService.getAnimeById(animeId);

      if (!anime) {
        return res.status(404).json({ success: false, message: 'Anime not found' });
      }

      res.json({ success: true, data: anime, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error fetching anime details:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch anime details' });
    }
  });



  app.get('/api/anime-sama/episode/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;
      const episodeDetails = await animeSamaService.getEpisodeDetails(episodeId);

      if (!episodeDetails) {
        return res.status(404).json({ success: false, message: 'Episode not found' });
      }

      res.json({ success: true, data: episodeDetails, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error fetching episode details:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch episode details' });
    }
  });



  app.get('/api/anime-sama/random', async (req, res) => {
    try {
      const randomAnime = await animeSamaService.getRandomAnime();

      if (!randomAnime) {
        return res.status(404).json({ success: false, message: 'No random anime found' });
      }

      res.json({ success: true, data: randomAnime, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error fetching random anime:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch random anime' });
    }
  });

  app.get('/api/anime-sama/catalogue', async (req, res) => {
    try {
      const { search } = req.query;
      let catalogue;
      
      if (search) {
        // Si paramètre search fourni, filtrer le catalogue
        const fullCatalogue = await animeSamaService.getCatalogue();
        catalogue = fullCatalogue.filter((anime: any) => 
          anime.id === search || 
          anime.title?.toLowerCase().includes((search as string).toLowerCase())
        );
      } else {
        catalogue = await animeSamaService.getCatalogue();
      }
      
      res.json({ success: true, data: catalogue, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error fetching catalogue:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch catalogue' });
    }
  });

  // Route pour le contenu des animes (fallback universel)
  app.get('/api/anime-sama/content', async (req, res) => {
    try {
      const { animeId, type } = req.query;
      
      if (!animeId) {
        return res.status(400).json({ success: false, message: 'animeId parameter required' });
      }

      // Utiliser getCatalogue pour obtenir les informations d'épisodes
      const catalogue = await animeSamaService.getCatalogue();
      const animeInfo = catalogue.find((anime: any) => anime.id === animeId);
      
      if (!animeInfo) {
        return res.status(404).json({ success: false, message: 'Anime not found in catalogue' });
      }

      let contentData = [];
      if (type === 'episodes' && animeInfo.seasons) {
        // Générer des épisodes basés sur les saisons du catalogue
        animeInfo.seasons.forEach((season: any, seasonIndex: number) => {
          if (season.episodeCount && season.episodeCount > 0) {
            for (let ep = 1; ep <= season.episodeCount; ep++) {
              contentData.push({
                id: `${animeId}-s${seasonIndex + 1}-e${ep}`,
                episodeNumber: ep,
                seasonNumber: seasonIndex + 1,
                title: `Épisode ${ep}`,
                url: `/api/episode/${animeId}-episode-${ep}-vostfr`,
                available: true
              });
            }
          }
        });
      }

      res.json({ 
        success: true, 
        data: contentData,
        meta: {
          animeId,
          type,
          totalEpisodes: contentData.length
        },
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error fetching anime content:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch anime content' });
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
      } catch (roomError) {
        console.log("Room creation info:", roomError.message);
      }

      const messageData = {
        content: content.trim(),
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

  // Anime streaming routes with Anime-Sama API integration
  app.get('/api/search', async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ success: false, message: "Query parameter required" });
      }
      const results = await animeSamaService.searchAnime(query as string);
      res.json({ success: true, data: results, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error searching anime:", error);
      res.status(500).json({ success: false, message: "Failed to search anime" });
    }
  });



  app.get('/api/random', async (req, res) => {
    try {
      const randomAnime = await animeSamaService.getRandomAnime();
      res.json({ success: true, data: randomAnime, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error fetching random anime:", error);
      res.status(500).json({ success: false, message: "Failed to fetch random anime" });
    }
  });

  app.get('/api/genres', async (req, res) => {
    try {
      const genres = await animeSamaService.getGenres();
      res.json({ success: true, data: genres, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ success: false, message: "Failed to fetch genres" });
    }
  });

  app.get('/api/anime/:animeId', async (req, res) => {
    try {
      const { animeId } = req.params;
      const anime = await animeSamaService.getAnimeById(animeId);
      if (!anime) {
        return res.status(404).json({ success: false, message: "Anime not found" });
      }
      res.json({ success: true, data: anime, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error fetching anime details:", error);
      res.status(500).json({ success: false, message: "Failed to fetch anime details" });
    }
  });

  app.get('/api/seasons', async (req, res) => {
    try {
      const { animeId, season, language = 'vostfr' } = req.query;
      if (!animeId || !season) {
        return res.status(400).json({ success: false, message: "animeId and season parameters required" });
      }
      const episodes = await animeSamaService.getSeasonEpisodes(
        animeId as string,
        parseInt(season as string),
        language as 'vf' | 'vostfr'
      );
      res.json({ 
        success: true, 
        data: {
          animeId: animeId as string,
          season: parseInt(season as string),
          language: language as string,
          episodes,
          episodeCount: episodes.length
        },
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error("Error fetching season episodes:", error);
      res.status(500).json({ success: false, message: "Failed to fetch season episodes" });
    }
  });

  app.get('/api/episode/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;
      const episode = await animeSamaService.getEpisodeDetails(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }

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

  // Route embed pour iframe direct - Version optimisée
  app.get('/api/embed/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;
      const episode = await animeSamaService.getEpisodeDetails(episodeId);

      if (!episode) {
        return res.status(404).send(`
          <html>
            <head><title>Episode non trouvé</title></head>
            <body style="background:#000;color:white;text-align:center;padding:50px;font-family:Arial,sans-serif;">
              <h2>Épisode non trouvé</h2>
              <p>L'épisode demandé n'existe pas ou n'est pas disponible.</p>
            </body>
          </html>
        `);
      }

      // Headers CORS optimisés pour anime-sama
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('Content-Security-Policy', "frame-ancestors *; script-src 'unsafe-inline' 'unsafe-eval' *; object-src *;");
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Referrer-Policy', 'no-referrer');

      // Sélectionner la meilleure source disponible
      let bestSource = null;
      if (episode.sources && episode.sources.length > 0) {
        // Prioriser les sources par qualité et serveur
        bestSource = episode.sources.find(s => s.quality === 'HD') || 
                    episode.sources.find(s => s.server === 'Sibnet') ||
                    episode.sources.find(s => s.server === 'Vidmoly') ||
                    episode.sources[0];
      }

      const embedHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lecteur Vidéo - ${episode.animeTitle} Episode ${episode.episodeNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: #000; 
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .video-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        iframe { 
            width: 100%; 
            height: 100%; 
            border: none; 
            display: block;
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            text-align: center;
        }
        .spinner {
            border: 2px solid #333;
            border-top: 2px solid #fff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error { 
            color: white; 
            text-align: center; 
            padding: 50px;
            max-width: 500px;
            margin: 0 auto;
        }
        .retry-btn {
            background: #1e40af;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 20px;
            font-size: 14px;
        }
        .retry-btn:hover { background: #3b82f6; }
    </style>
</head>
<body>
    <div class="video-container">
        ${bestSource ? `
          <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Chargement du lecteur...</p>
          </div>
          <iframe 
            id="videoFrame"
            src="${bestSource.url}" 
            allowfullscreen 
            frameborder="0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerpolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-top-navigation"
            style="display: none;"
            onload="document.getElementById('loading').style.display='none'; this.style.display='block';"
            onerror="showError()"
          ></iframe>
        ` : `
          <div class="error">
            <h2>Aucune source disponible</h2>
            <p>Cet épisode n'a pas de source vidéo disponible pour le moment.</p>
            <button class="retry-btn" onclick="window.location.reload()">Réessayer</button>
          </div>
        `}
    </div>
    
    <script>
        function showError() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('videoFrame').style.display = 'none';
            document.querySelector('.video-container').innerHTML = \`
                <div class="error">
                    <h2>Erreur de chargement</h2>
                    <p>Impossible de charger la vidéo. Cela peut être dû à des restrictions du serveur.</p>
                    <button class="retry-btn" onclick="window.location.reload()">Réessayer</button>
                </div>
            \`;
        }
        
        // Auto-hide loading après 30 secondes
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading && loading.style.display !== 'none') {
                showError();
            }
        }, 30000);
    </script>
</body>
</html>`;

      return res.status(200).send(embedHtml);
    } catch (error) {
      console.error("Error in embed endpoint:", error);
      res.status(500).send(`
        <html>
          <head><title>Erreur</title></head>
          <body style="background:#000;color:white;text-align:center;padding:50px;font-family:Arial,sans-serif;">
            <h2>Erreur de chargement</h2>
            <p>Une erreur inattendue s'est produite lors du chargement de l'épisode.</p>
            <button onclick="window.location.reload()" style="background:#1e40af;color:white;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;margin-top:20px;">
              Réessayer
            </button>
          </body>
        </html>
      `);
    }
  });

  // Route catalogue optimisée (dupliquée pour compatibilité)
  app.get('/api/catalogue', async (req, res) => {
    try {
      const { search } = req.query;
      let catalogue;
      
      if (search) {
        const fullCatalogue = await animeSamaService.getCatalogue();
        catalogue = fullCatalogue.filter((anime: any) => 
          anime.id === search || 
          anime.title?.toLowerCase().includes((search as string).toLowerCase())
        );
      } else {
        catalogue = await animeSamaService.getCatalogue();
      }
      
      res.json({ success: true, data: catalogue, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error fetching catalogue:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch catalogue' });
    }
  });

  // Route content optimisée (dupliquée pour compatibilité)
  app.get('/api/content', async (req, res) => {
    try {
      const { animeId, type } = req.query;
      
      if (!animeId) {
        return res.status(400).json({ success: false, message: 'animeId parameter required' });
      }

      const catalogue = await animeSamaService.getCatalogue();
      const animeInfo = catalogue.find((anime: any) => anime.id === animeId);
      
      if (!animeInfo) {
        return res.status(404).json({ success: false, message: 'Anime not found in catalogue' });
      }

      let contentData = [];
      if (type === 'episodes' && animeInfo.seasons) {
        animeInfo.seasons.forEach((season: any, seasonIndex: number) => {
          if (season.episodeCount && season.episodeCount > 0) {
            for (let ep = 1; ep <= season.episodeCount; ep++) {
              contentData.push({
                id: `${animeId}-s${seasonIndex + 1}-e${ep}`,
                episodeNumber: ep,
                seasonNumber: seasonIndex + 1,
                title: `Épisode ${ep}`,
                url: `/api/episode/${animeId}-episode-${ep}-vostfr`,
                available: true
              });
            }
          }
        });
      }

      res.json({ 
        success: true, 
        data: contentData,
        meta: {
          animeId,
          type,
          totalEpisodes: contentData.length
        },
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error fetching anime content:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch anime content' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}