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

// Configuration API Anime interne

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

  // Anime API Routes - Internal data
  const POPULAR_ANIMES = [
    {
      id: "demon-slayer",
      title: "Demon Slayer",
      image: "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/demon-slayer.jpg",
      url: "https://anime-sama.fr/catalogue/demon-slayer/",
      type: "anime",
      status: "Disponible",
      genres: ["Action", "Surnaturel"],
      year: "2019"
    },
    {
      id: "naruto",
      title: "Naruto",
      image: "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/naruto.jpg",
      url: "https://anime-sama.fr/catalogue/naruto/",
      type: "anime",
      status: "Disponible",
      genres: ["Action", "Aventure"],
      year: "2002"
    },
    {
      id: "one-piece",
      title: "One Piece",
      image: "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/one-piece.jpg",
      url: "https://anime-sama.fr/catalogue/one-piece/",
      type: "anime",
      status: "En cours",
      genres: ["Action", "Aventure"],
      year: "1999"
    },
    {
      id: "attack-on-titan",
      title: "L'Attaque des Titans",
      image: "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/attack-on-titan.jpg",
      url: "https://anime-sama.fr/catalogue/attack-on-titan/",
      type: "anime",
      status: "Terminé",
      genres: ["Action", "Drame"],
      year: "2013"
    },
    {
      id: "my-hero-academia",
      title: "My Hero Academia",
      image: "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/my-hero-academia.jpg",
      url: "https://anime-sama.fr/catalogue/my-hero-academia/",
      type: "anime",
      status: "En cours",
      genres: ["Action", "École"],
      year: "2016"
    },
    {
      id: "jujutsu-kaisen",
      title: "Jujutsu Kaisen",
      image: "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/jujutsu-kaisen.jpg",
      url: "https://anime-sama.fr/catalogue/jujutsu-kaisen/",
      type: "anime",
      status: "En cours",
      genres: ["Action", "Surnaturel"],
      year: "2020"
    }
  ];

  // Search animes
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      const filteredAnimes = POPULAR_ANIMES.filter(anime => 
        anime.title.toLowerCase().includes(query.toLowerCase()) ||
        anime.id.toLowerCase().includes(query.toLowerCase())
      );
      
      res.json({
        success: true,
        query: query,
        count: filteredAnimes.length,
        results: filteredAnimes
      });
    } catch (error) {
      console.error("Error searching animes:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to search animes",
        results: []
      });
    }
  });

  // Get trending animes
  app.get('/api/trending', async (req, res) => {
    try {
      res.json({
        success: true,
        count: POPULAR_ANIMES.length,
        results: POPULAR_ANIMES
      });
    } catch (error) {
      console.error("Error fetching trending animes:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch trending animes",
        results: []
      });
    }
  });

  // Get anime details with seasons
  app.get('/api/anime/:id', async (req, res) => {
    try {
      const animeId = req.params.id;
      
      const anime = POPULAR_ANIMES.find(a => a.id === animeId);
      if (!anime) {
        return res.status(404).json({ 
          success: false, 
          message: "Anime not found" 
        });
      }

      // Return anime details with seasons
      res.json({
        success: true,
        data: {
          ...anime,
          description: `Synopsis de ${anime.title}. Cet anime populaire est disponible en streaming avec plusieurs saisons et épisodes.`,
          seasons: [
            {
              number: 1,
              name: "Saison 1",
              languages: ["VF", "VOSTFR"],
              episodeCount: 12,
              url: `https://anime-sama.fr/catalogue/${animeId}/saison1/`
            }
          ]
        }
      });
    } catch (error) {
      console.error("Error fetching anime details:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch anime details",
        data: null
      });
    }
  });

  // Get seasons for specific anime - Internal data
  app.get('/api/seasons', async (req, res) => {
    try {
      const { animeId, season, language } = req.query;
      
      if (!animeId || !season || !language) {
        return res.status(400).json({ 
          success: false,
          message: "animeId, season, and language parameters are required" 
        });
      }

      const anime = POPULAR_ANIMES.find(a => a.id === animeId);
      if (!anime) {
        return res.status(404).json({ 
          success: false, 
          message: "Anime not found" 
        });
      }

      // Generate sample episodes for the anime
      const episodes = Array.from({ length: 12 }, (_, i) => ({
        id: `${animeId}-episode-${i + 1}-${language}`,
        title: `${anime.title} - Épisode ${i + 1}`,
        episodeNumber: i + 1,
        url: `https://anime-sama.fr/catalogue/${animeId}/saison${season}/${language}/episode-${i + 1}`,
        language: language,
        available: true
      }));

      res.json({
        success: true,
        data: {
          animeId,
          seasonNumber: parseInt(season as string),
          language,
          totalEpisodes: episodes.length,
          episodes
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

  // Get episode details - Internal data  
  app.get('/api/episode/:id', async (req, res) => {
    try {
      const episodeId = req.params.id;
      
      // Parse episode ID: animeId-episode-number-language
      const parts = episodeId.split('-');
      if (parts.length < 4) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid episode ID format" 
        });
      }

      const animeId = parts[0] + (parts[1] !== 'episode' ? '-' + parts[1] : '');
      const episodeNumber = parts[parts.indexOf('episode') + 1];
      const language = parts[parts.length - 1];

      const anime = POPULAR_ANIMES.find(a => a.id === animeId);
      if (!anime) {
        return res.status(404).json({ 
          success: false, 
          message: "Anime not found" 
        });
      }

      res.json({
        success: true,
        data: {
          id: episodeId,
          title: `${anime.title} - Épisode ${episodeNumber}`,
          animeTitle: anime.title,
          episodeNumber: parseInt(episodeNumber),
          sources: [
            {
              url: `https://anime-sama.fr/player/${episodeId}`,
              server: "StreamTape",
              quality: "1080p",
              language: language.toUpperCase(),
              type: "video/mp4",
              serverIndex: 1
            }
          ],
          description: `Regarder ${anime.title} épisode ${episodeNumber} en ${language.toUpperCase()}`,
          thumbnail: anime.image
        }
      });
    } catch (error) {
      console.error("Error fetching episode sources:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch episode sources",
        data: { sources: [] }
      });
    }
  });

  // Embed endpoint pour intégrer les vidéos de manière sécurisée
  app.get('/api/embed/', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Erreur - URL manquante</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; text-align: center; padding: 50px; }
              .error { color: #ef4444; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="error">URL requise pour l'intégration vidéo</div>
          </body>
          </html>
        `);
      }

      // Décoder l'URL
      const decodedUrl = decodeURIComponent(url);
      
      // Vérifier si l'URL provient d'anime-sama et ajuster le comportement
      const isAnimeSamaUrl = decodedUrl.includes('anime-sama.fr');
      
      // Page HTML d'intégration avec le lecteur vidéo
      let embedHtml;
      
      if (isAnimeSamaUrl) {
        // Pour les URLs d'anime-sama qui ne sont pas accessibles directement
        embedHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Lecteur Anime-Sama</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                background: #1a1a1a; 
                color: white;
                font-family: Arial, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 20px;
              }
              .message-container {
                text-align: center;
                max-width: 500px;
              }
              .icon {
                font-size: 48px;
                margin-bottom: 20px;
              }
              h2 {
                color: #007bff;
                margin-bottom: 15px;
              }
              p {
                line-height: 1.6;
                margin-bottom: 10px;
                color: #ccc;
              }
              .url-info {
                background: #333;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                margin: 15px 0;
                word-break: break-all;
              }
              .suggestion {
                background: #2a2a2a;
                padding: 15px;
                border-radius: 5px;
                margin-top: 20px;
                border-left: 4px solid #007bff;
              }
            </style>
          </head>
          <body>
            <div class="message-container">
              <div class="icon">🎬</div>
              <h2>Lecteur Anime-Sama</h2>
              <p>Cette vidéo provient d'Anime-Sama.fr et nécessite un accès direct au site pour fonctionner.</p>
              
              <div class="url-info">
                URL: ${decodedUrl}
              </div>
              
              <div class="suggestion">
                <strong>💡 Solution recommandée :</strong><br>
                Visitez directement <a href="https://anime-sama.fr" target="_blank" style="color: #007bff;">anime-sama.fr</a> 
                pour regarder cet épisode avec leurs lecteurs externes optimisés.
              </div>
              
              <p style="margin-top: 20px; font-size: 14px; color: #888;">
                Les lecteurs vidéo d'Anime-Sama sont indépendants et externes pour une meilleure qualité de streaming.
              </p>
            </div>
          </body>
          </html>
        `;
      } else {
        // Pour les autres URLs (lecteurs externes)
        embedHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Lecteur Vidéo</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                background: #000; 
                overflow: hidden; 
                font-family: Arial, sans-serif;
              }
              .container { 
                width: 100vw; 
                height: 100vh; 
                position: relative; 
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
                font-size: 16px;
                z-index: 10;
                text-align: center;
              }
              .spinner {
                border: 3px solid #333;
                border-top: 3px solid #007bff;
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
            </style>
          </head>
          <body>
            <div class="container">
              <div class="loading" id="loading">
                <div class="spinner"></div>
                <div>Chargement du lecteur...</div>
              </div>
              <iframe 
                id="videoFrame"
                src="${decodedUrl}"
                allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                onload="document.getElementById('loading').style.display='none'"
              ></iframe>
            </div>
            
            <script>
              // Masquer le loader après un délai maximum
              setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
              }, 8000);
              
              // Gestion des erreurs d'iframe
              document.getElementById('videoFrame').onerror = function() {
                document.getElementById('loading').innerHTML = 
                  '<div style="color: #ef4444;">Erreur de chargement du lecteur</div>';
              };
            </script>
          </body>
          </html>
        `;
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
      res.send(embedHtml);
      
    } catch (error) {
      console.error("Error in embed endpoint:", error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Erreur du lecteur</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; text-align: center; padding: 50px; }
            .error { color: #ef4444; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="error">Erreur lors du chargement du lecteur vidéo</div>
        </body>
        </html>
      `);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}