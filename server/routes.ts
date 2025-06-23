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

  // Anime streaming routes with Anime-Sama API integration - Fixed endpoints
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

  app.get('/api/trending', async (req, res) => {
    try {
      const trending = await animeSamaService.getTrendingAnime();
      res.json({ success: true, data: trending, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error fetching trending anime:", error);
      res.status(500).json({ success: false, message: "Failed to fetch trending anime" });
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

  app.get('/api/health', async (req, res) => {
    try {
      res.json({ 
        success: true, 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Health check failed" });
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
  // CORRECTION 1: Endpoint CORS manquant - Ajouter /api/embed/:episodeId
  app.get('/api/embed/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;
      const episode = await animeSamaService.getEpisodeDetails(episodeId);
      
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }

      // CORRECTION 4: Headers CORS pour Vidéo
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // Redirection automatique vers la vidéo comme anime-sama.fr
      const embedHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirection vidéo</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background: #000; 
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        .redirect-message {
            text-align: center;
        }
        .spinner {
            border: 3px solid #333;
            border-top: 3px solid #1e40af;
            border-radius: 50%;
            width: 30px;
            height: 30px;
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
    <div class="redirect-message">
        ${episode.sources.length > 0 ? 
          `<div class="spinner"></div>
           <p>Redirection vers la vidéo...</p>
           <script>
             // Redirection immédiate vers la source vidéo
             window.location.href = "${episode.sources[0].url}";
           </script>` :
          `<p>Aucune source disponible pour cet épisode</p>`
        }
    </div>
</body>
</html>`;
      
      return res.status(200).send(embedHtml);
    } catch (error) {
      console.error("Error in embed endpoint:", error);
      res.status(500).send(`
        <html>
          <body style="background:#000;color:white;text-align:center;padding:20px;">
            <h2>Erreur de chargement</h2>
            <p>Impossible de charger l'épisode</p>
          </body>
        </html>
      `);
    }
  });

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

  // CORRECTION: Ajouter endpoints manquants pour fallback intelligent
  app.get('/api/catalogue', async (req, res) => {
    try {
      const { search } = req.query;
      const catalogue = await animeSamaService.getCatalogue();
      
      let results = catalogue;
      if (search) {
        results = catalogue.filter(anime => 
          anime.id.includes(search as string) || 
          anime.title.toLowerCase().includes((search as string).toLowerCase())
        );
      }
      
      res.json({ success: true, data: results, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error fetching catalogue:", error);
      res.status(500).json({ success: false, message: "Failed to fetch catalogue" });
    }
  });

  app.get('/api/content', async (req, res) => {
    try {
      const { animeId, type } = req.query;
      
      if (!animeId) {
        return res.status(400).json({ success: false, message: "animeId parameter required" });
      }

      // Essayer de récupérer l'anime pour obtenir les informations de saisons
      const anime = await animeSamaService.getAnimeById(animeId as string);
      
      if (!anime || !anime.seasons) {
        return res.json({ success: true, data: [], timestamp: new Date().toISOString() });
      }

      // Générer des épisodes basés sur les informations de saisons
      const episodes = [];
      for (const season of anime.seasons) {
        for (let i = 1; i <= season.episodeCount; i++) {
          episodes.push({
            id: `${animeId}-s${season.number}-e${i}`,
            episodeNumber: i,
            title: `Épisode ${i}`,
            language: 'VOSTFR',
            url: '',
            available: true,
            seasonNumber: season.number
          });
        }
      }

      res.json({ success: true, data: episodes, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ success: false, message: "Failed to fetch content" });
    }
  });

  // Route embed pour iframe direct - CORRECTION CORS CRITIQUE
  app.get('/api/embed/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;
      
      // Configuration CORS pour l'embed - CORRECTION 1
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('Content-Security-Policy', "frame-ancestors *");
      
      const episode = await animeSamaService.getEpisodeDetails(episodeId);
      
      if (!episode || !episode.sources.length) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Episode non trouvé</title>
              <style>
                body { margin: 0; padding: 0; background: #000; color: #fff; font-family: Arial, sans-serif; }
                .error-container { text-align: center; padding: 50px; }
                .retry-btn { background: #1e40af; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px; }
                .retry-btn:hover { background: #3b82f6; }
              </style>
            </head>
            <body>
              <div class="error-container">
                <h2>Episode non trouvé</h2>
                <p>L'épisode demandé n'est pas disponible.</p>
                <button class="retry-btn" onclick="window.parent.location.reload()">Réessayer</button>
              </div>
            </body>
          </html>
        `);
      }
      
      // Système de retry automatique avec plusieurs sources - CORRECTION 5
      const sources = episode.sources;
      const embedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Episode ${episode.episodeNumber} - ${episode.animeTitle}</title>
          <style>
            body { margin: 0; padding: 0; background: #000; font-family: Arial, sans-serif; }
            iframe { width: 100%; height: 100vh; border: none; display: block; }
            .loading { 
              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
              color: white; text-align: center; z-index: 10; 
            }
            .error-overlay { 
              position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
              background: rgba(0,0,0,0.9); color: white; text-align: center; 
              padding: 50px; display: none; z-index: 20; 
            }
            .retry-btn { 
              background: #1e40af; color: white; border: none; 
              padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px; 
            }
            .retry-btn:hover { background: #3b82f6; }
            .server-info { 
              position: absolute; top: 10px; left: 10px; 
              background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; 
              border-radius: 3px; font-size: 12px; z-index: 15; 
            }
          </style>
        </head>
        <body>
          <div class="loading" id="loading">
            <div>Chargement du lecteur...</div>
          </div>
          
          <div class="server-info" id="serverInfo">
            Serveur 1/${sources.length} - ${sources[0]?.server || 'Inconnu'}
          </div>
          
          <iframe id="videoFrame" src="${sources[0]?.url}" allowfullscreen></iframe>
          
          <div class="error-overlay" id="errorOverlay">
            <h3>Lecteur indisponible</h3>
            <p id="errorMessage">Impossible de charger la vidéo depuis ce serveur.</p>
            <button class="retry-btn" onclick="tryNextServer()">Essayer serveur suivant</button>
            <button class="retry-btn" onclick="window.parent.location.reload()">Recharger</button>
          </div>
          
          <script>
            const sources = ${JSON.stringify(sources)};
            let currentServerIndex = 0;
            let retryAttempts = 0;
            const maxRetries = 3;
            
            const videoFrame = document.getElementById('videoFrame');
            const loading = document.getElementById('loading');
            const errorOverlay = document.getElementById('errorOverlay');
            const serverInfo = document.getElementById('serverInfo');
            const errorMessage = document.getElementById('errorMessage');
            
            // Gestion d'erreurs vidéo avec retry automatique - CORRECTION 5
            function loadVideoSource(serverIndex) {
              if (serverIndex >= sources.length) {
                displayVideoError('Aucune source disponible');
                return;
              }
              
              currentServerIndex = serverIndex;
              const source = sources[serverIndex];
              
              // Mise à jour info serveur
              serverInfo.textContent = \`Serveur \${serverIndex + 1}/\${sources.length} - \${source.server}\`;
              
              // Configuration iframe
              videoFrame.src = source.url;
              videoFrame.style.display = 'block';
              errorOverlay.style.display = 'none';
              loading.style.display = 'block';
              
              // Timeout pour détecter les échecs de chargement
              const timeout = setTimeout(() => {
                console.warn(\`Timeout for server \${serverIndex + 1}\`);
                if (retryAttempts < maxRetries) {
                  retryAttempts++;
                  loadVideoSource(serverIndex);
                } else if (serverIndex + 1 < sources.length) {
                  retryAttempts = 0;
                  loadVideoSource(serverIndex + 1);
                } else {
                  displayVideoError('Tous les serveurs ont échoué');
                }
              }, 10000); // 10 secondes timeout
              
              // Succès de chargement
              videoFrame.onload = function() {
                clearTimeout(timeout);
                loading.style.display = 'none';
                retryAttempts = 0;
                console.log(\`Successfully loaded server \${serverIndex + 1}\`);
              };
              
              // Erreur de chargement
              videoFrame.onerror = function() {
                clearTimeout(timeout);
                console.error(\`Failed to load server \${serverIndex + 1}\`);
                if (retryAttempts < maxRetries) {
                  retryAttempts++;
                  setTimeout(() => loadVideoSource(serverIndex), 2000);
                } else if (serverIndex + 1 < sources.length) {
                  retryAttempts = 0;
                  loadVideoSource(serverIndex + 1);
                } else {
                  displayVideoError('Tous les serveurs ont échoué');
                }
              };
            }
            
            function displayVideoError(message) {
              loading.style.display = 'none';
              errorOverlay.style.display = 'block';
              errorMessage.textContent = message;
              videoFrame.style.display = 'none';
            }
            
            function tryNextServer() {
              if (currentServerIndex + 1 < sources.length) {
                retryAttempts = 0;
                loadVideoSource(currentServerIndex + 1);
              } else {
                errorMessage.textContent = 'Aucun autre serveur disponible';
              }
            }
            
            // Démarrer le chargement
            loadVideoSource(0);
          </script>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(embedHtml);
    } catch (error) {
      console.error("Embed error:", error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Erreur</title>
            <style>
              body { margin: 0; padding: 0; background: #000; color: #fff; font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .retry-btn { background: #1e40af; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px; }
              .retry-btn:hover { background: #3b82f6; }
            </style>
          </head>
          <body>
            <h2>Erreur du serveur</h2>
            <p>Impossible de charger l'épisode.</p>
            <button class="retry-btn" onclick="window.parent.location.reload()">Réessayer</button>
          </body>
        </html>
      `);
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