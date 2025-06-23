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

      // Iframe intégrée comme sur anime-sama.fr - lecture directe dans le cadre
      const embedHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lecteur Vidéo</title>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background: #000; 
            overflow: hidden;
        }
        iframe { 
            width: 100%; 
            height: 100vh; 
            border: none; 
            display: block;
        }
        .error { 
            color: white; 
            text-align: center; 
            padding: 50px; 
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>
    ${episode.sources.length > 0 ? 
      `<iframe src="${episode.sources[0].url}" allowfullscreen frameborder="0"></iframe>` :
      `<div class="error">Aucune source disponible pour cet épisode</div>`
    }
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

  // Proxy anti-blocage avancé pour anime-sama.fr
  app.get('/api/proxy/:encodedUrl', async (req, res) => {
    try {
      const targetUrl = decodeURIComponent(req.params.encodedUrl);
      
      // Validation de sécurité étendue
      const allowedDomains = [
        'anime-sama.fr',
        'streaming.anime-sama.fr',
        'player.anime-sama.fr',
        'embed.anime-sama.fr'
      ];
      
      const isAllowed = allowedDomains.some(domain => targetUrl.includes(domain));
      if (!isAllowed) {
        return res.status(403).json({ message: "Domain not allowed" });
      }
      
      // Headers complets pour bypass anime-sama.fr restrictions
      const proxyHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://anime-sama.fr/',
        'Origin': 'https://anime-sama.fr',
        'Accept': '*/*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'iframe',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'X-Requested-With': 'XMLHttpRequest'
      };
      
      let response;
      let content;
      
      // Tentative 1: Fetch standard
      try {
        response = await fetch(targetUrl, {
          headers: proxyHeaders,
          timeout: 15000,
          redirect: 'follow'
        });
        
        content = await response.text();
      } catch (fetchError) {
        console.log('Standard fetch failed, trying alternative method');
        
        // Tentative 2: Avec axios si disponible
        // Tentative 2: Simulation browser avec headers spéciaux
        const https = require('https');
        const http = require('http');
        const { URL } = require('url');
        
        const parsedUrl = new URL(targetUrl);
        const module = parsedUrl.protocol === 'https:' ? https : http;
        
        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'GET',
          headers: proxyHeaders,
          timeout: 15000
        };
        
        const nodeResponse = await new Promise((resolve, reject) => {
          const req = module.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ data, statusCode: res.statusCode }));
          });
          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Request timeout')));
          req.setTimeout(15000);
          req.end();
        });
        
        if (nodeResponse.statusCode >= 200 && nodeResponse.statusCode < 300) {
          content = nodeResponse.data;
          response = { ok: true, headers: { get: () => 'text/html' } };
        } else {
          throw new Error('All proxy methods failed');
        }
      }
      
      // Modification du contenu pour supprimer les restrictions
      if (content && typeof content === 'string') {
        content = content
          // Supprimer les scripts de blocage anime-sama
          .replace(/(?:checkOrigin|blockAccess|preventEmbed)\s*\([^)]*\)\s*;?/gi, '')
          .replace(/(?:if\s*\([^)]*(?:location|origin|referrer)[^)]*\))\s*{[^}]*}/gi, '')
          .replace(/(?:document\.referrer|window\.location\.origin)/gi, '"https://anime-sama.fr"')
          // Forcer les permissions iframe
          .replace(/<iframe([^>]*?)>/gi, '<iframe$1 sandbox="allow-scripts allow-same-origin allow-forms allow-presentation">')
          // Supprimer les vérifications CORS
          .replace(/Access-Control-Allow-Origin[^;]*/gi, 'Access-Control-Allow-Origin: *')
          // Injecter CSS anti-blocage
          .replace('</head>', `
            <style>
              .blocked-content, .connection-error, .access-denied, .iframe-blocked {
                display: none !important;
              }
              video, iframe[src*="player"] {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
              }
            </style>
            </head>
          `);
      }
      
      // Headers CORS complets
      res.set({
        'Content-Type': response.headers?.get?.('content-type') || 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Referer',
        'Access-Control-Allow-Credentials': 'true',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': 'frame-ancestors *',
        'Referrer-Policy': 'no-referrer-when-downgrade'
      });
      
      res.send(content);
      
    } catch (error) {
      console.error("Advanced proxy error:", error);
      
      // Page d'erreur personnalisée avec retry automatique
      const errorPage = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Connexion en cours...</title>
            <style>
              body { background: #000; color: #fff; font-family: Arial; text-align: center; padding: 50px; }
              .loader { border: 2px solid #333; border-top: 2px solid #00ffff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <h2>Connexion à anime-sama.fr</h2>
            <div class="loader"></div>
            <p>Tentative de connexion en cours...</p>
            <script>
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            </script>
          </body>
        </html>
      `;
      
      res.status(200).send(errorPage);
    }
  });

  // Endpoint embed avancé avec contournement anime-sama.fr
  app.get('/api/embed/:episodeId', async (req, res) => {
    try {
      const { episodeId } = req.params;
      
      // Méthode 1: API directe avec retry
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const episodeData = await animeSamaService.getEpisodeDetails(episodeId);
          if (episodeData && episodeData.sources?.length > 0) {
            return res.json({
              success: true,
              data: {
                ...episodeData,
                sources: episodeData.sources.map(source => ({
                  ...source,
                  embedUrl: `/api/proxy/${encodeURIComponent(source.embedUrl || source.url)}`,
                  proxyUrl: `/api/proxy/${encodeURIComponent(source.url)}`
                }))
              },
              source: 'direct'
            });
          }
        } catch (directError) {
          console.log(`Direct API attempt ${attempt} failed:`, directError.message);
          if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Méthode 2: Génération embed intelligente avec URLs proxy
      const episodeParts = episodeId.split('-');
      let animeId = episodeParts[0];
      if (episodeParts[1] === 'piece') animeId = 'one-piece';
      
      const episodeMatch = episodeId.match(/episode-(\d+)/);
      const episodeNum = episodeMatch ? episodeMatch[1] : '1';
      const language = episodeId.includes('-vf') ? 'vf' : 'vostfr';
      
      // URLs multiples pour maximiser les chances de connexion
      const baseUrls = [
        `https://anime-sama.fr/catalogue/${animeId}/`,
        `https://player.anime-sama.fr/${animeId}/${episodeNum}/${language}`,
        `https://streaming.anime-sama.fr/embed/${animeId}-${episodeNum}-${language}`,
        `https://anime-sama.fr/player/${animeId}/${episodeNum}/${language}`
      ];
      
      const embedData = {
        id: episodeId,
        title: `Episode ${episodeNum}`,
        animeTitle: animeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        episodeNumber: parseInt(episodeNum),
        language: language.toUpperCase(),
        sources: baseUrls.map((url, index) => ({
          url: url,
          embedUrl: `/api/proxy/${encodeURIComponent(url)}`,
          proxyUrl: `/api/proxy/${encodeURIComponent(url)}`,
          server: `Serveur ${index + 1}`,
          quality: index === 0 ? 'HD' : 'SD',
          language: language.toUpperCase(),
          type: 'embed',
          serverIndex: index,
          fallback: true
        })),
        embedUrl: `/api/proxy/${encodeURIComponent(baseUrls[0])}`,
        availableServers: baseUrls.map((_, index) => `Serveur ${index + 1}`),
        url: episodeId,
        corsInfo: {
          note: 'Proxy avancé avec contournement anime-sama.fr',
          proxyEndpoint: `/api/proxy/`,
          embedEndpoint: `/api/embed/`,
          bypassMode: 'active'
        }
      };
      
      res.json({
        success: true,
        data: embedData,
        source: 'proxy-enhanced'
      });
      
    } catch (error) {
      console.error('Advanced embed error:', error);
      
      // Fallback d'urgence avec lecteur universel
      const emergencyData = {
        id: req.params.episodeId,
        title: 'Episode',
        sources: [{
          url: `https://anime-sama.fr/`,
          embedUrl: `/api/proxy/${encodeURIComponent('https://anime-sama.fr/')}`,
          server: 'Lecteur Universel',
          quality: 'Auto',
          language: 'FR',
          type: 'universal',
          serverIndex: 0
        }],
        embedUrl: `/api/proxy/${encodeURIComponent('https://anime-sama.fr/')}`,
        availableServers: ['Lecteur Universel']
      };
      
      res.json({
        success: true,
        data: emergencyData,
        source: 'emergency-fallback'
      });
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