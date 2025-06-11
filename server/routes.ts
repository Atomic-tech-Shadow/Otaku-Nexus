import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertAnimeSchema,
  insertAnimeFavoriteSchema,
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes are now handled in setupAuth

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
      const animes = await storage.getAnimes(limit);
      res.json(animes);
    } catch (error) {
      console.error("Error fetching animes:", error);
      res.status(500).json({ message: "Failed to fetch animes" });
    }
  });

  app.get('/api/anime/trending', async (req, res) => {
    try {
      // First try to get from database
      let animes = await storage.getTrendingAnimes();
      
      // If no data in database, fetch from Jikan API
      if (animes.length === 0) {
        try {
          const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
          if (response.ok) {
            const data = await response.json();
            const jikanAnimes = data.data;
            
            // Save to database and return
            const savedAnimes = [];
            for (const anime of jikanAnimes) {
              try {
                const savedAnime = await storage.createAnime({
                  malId: anime.mal_id,
                  title: anime.title,
                  synopsis: anime.synopsis,
                  imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                  score: anime.score?.toString(),
                  year: anime.year,
                  status: anime.status,
                  episodes: anime.episodes
                });
                savedAnimes.push(savedAnime);
              } catch (err) {
                // Skip if already exists
                console.log(`Anime ${anime.title} already exists or error:`, err);
              }
            }
            animes = savedAnimes.length > 0 ? savedAnimes : await storage.getTrendingAnimes();
          }
        } catch (apiError) {
          console.error("Error fetching from Jikan API:", apiError);
        }
      }
      
      res.json(animes);
    } catch (error) {
      console.error("Error fetching trending animes:", error);
      res.status(500).json({ message: "Failed to fetch trending animes" });
    }
  });

  app.get('/api/anime/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      // First search local database
      let animes = await storage.searchAnimes(query);
      
      // If no local results, search Jikan API
      if (animes.length === 0) {
        try {
          const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
          if (response.ok) {
            const data = await response.json();
            const jikanAnimes = data.data;
            
            // Save to database
            const savedAnimes = [];
            for (const anime of jikanAnimes) {
              try {
                const savedAnime = await storage.createAnime({
                  malId: anime.mal_id,
                  title: anime.title,
                  synopsis: anime.synopsis,
                  imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                  score: anime.score?.toString(),
                  year: anime.year,
                  status: anime.status,
                  episodes: anime.episodes
                });
                savedAnimes.push(savedAnime);
              } catch (err) {
                // Skip if already exists
              }
            }
            animes = savedAnimes.length > 0 ? savedAnimes : jikanAnimes.map(anime => ({
              id: anime.mal_id,
              malId: anime.mal_id,
              title: anime.title,
              synopsis: anime.synopsis,
              imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
              score: anime.score?.toString(),
              year: anime.year,
              status: anime.status,
              episodes: anime.episodes
            }));
          }
        } catch (apiError) {
          console.error("Error fetching from Jikan API:", apiError);
        }
      }
      
      res.json(animes);
    } catch (error) {
      console.error("Error searching animes:", error);
      res.status(500).json({ message: "Failed to search animes" });
    }
  });

  app.post('/api/anime', async (req, res) => {
    try {
      const animeData = insertAnimeSchema.parse(req.body);
      const anime = await storage.createAnime(animeData);
      res.json(anime);
    } catch (error) {
      console.error("Error creating anime:", error);
      res.status(500).json({ message: "Failed to create anime" });
    }
  });

  // Anime favorites routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favoriteData = insertAnimeFavoriteSchema.parse({
        ...req.body,
        userId,
      });
      const favorite = await storage.addToFavorites(favoriteData);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete('/api/favorites/:animeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const animeId = parseInt(req.params.animeId);
      await storage.removeFromFavorites(userId, animeId);
      res.json({ message: "Removed from favorites" });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
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
      let quiz = await storage.getFeaturedQuiz();
      
      // If no quiz exists, generate one from anime data
      if (!quiz) {
        const animes = await storage.getAnimes(20);
        if (animes.length > 0) {
          const selectedAnimes = animes.slice(0, 5);
          const questions = selectedAnimes.map((anime, index) => ({
            question: `Quel est le score de "${anime.title}" ?`,
            options: [
              anime.score || "8.5",
              (parseFloat(anime.score || "8.5") + 0.5).toString(),
              (parseFloat(anime.score || "8.5") - 0.5).toString(),
              (parseFloat(anime.score || "8.5") + 1).toString()
            ].sort(() => Math.random() - 0.5),
            correctAnswer: 0,
            explanation: `${anime.title} a un score de ${anime.score || "N/A"} sur MyAnimeList.`
          }));
          
          // Add more question types
          if (selectedAnimes.length > 1) {
            questions.push({
              question: `Combien d'épisodes compte "${selectedAnimes[1].title}" ?`,
              options: [
                selectedAnimes[1].episodes?.toString() || "12",
                "24", "13", "26"
              ].sort(() => Math.random() - 0.5),
              correctAnswer: 0,
              explanation: `${selectedAnimes[1].title} compte ${selectedAnimes[1].episodes || "un nombre inconnu d'"} épisodes.`
            });
          }
          
          quiz = await storage.createQuiz({
            title: "Quiz Anime du Jour",
            description: "Testez vos connaissances sur les animes populaires !",
            difficulty: "medium",
            questions: questions,
            xpReward: 25
          });
        }
      }
      
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching featured quiz:", error);
      res.status(500).json({ message: "Failed to fetch featured quiz" });
    }
  });

  app.get('/api/quizzes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post('/api/quizzes', isAuthenticated, async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // Quiz results routes
  app.get('/api/quiz-results', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const results = await storage.getUserQuizResults(userId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      res.status(500).json({ message: "Failed to fetch quiz results" });
    }
  });

  app.post('/api/quiz-results', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const resultData = insertQuizResultSchema.parse({
        ...req.body,
        userId,
      });

      const result = await storage.createQuizResult(resultData);

      // Update user XP
      if (resultData.xpEarned && resultData.xpEarned > 0) {
        await storage.updateUserXP(userId, resultData.xpEarned);
      }

      res.json(result);
    } catch (error) {
      console.error("Error creating quiz result:", error);
      res.status(500).json({ message: "Failed to create quiz result" });
    }
  });

  // Video routes
  app.get('/api/videos', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const videos = await storage.getVideos(limit);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get('/api/videos/popular', async (req, res) => {
    try {
      const videos = await storage.getPopularVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching popular videos:", error);
      res.status(500).json({ message: "Failed to fetch popular videos" });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.post('/api/videos', isAuthenticated, async (req, res) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  // External API integration for anime data (Jikan API)
  app.get('/api/external/anime/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching from Jikan API:", error);
      res.status(500).json({ message: "Failed to search anime from external API" });
    }
  });

  app.get('/api/external/anime/top', async (req, res) => {
    try {
      const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=10');
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching top anime from Jikan API:", error);
      res.status(500).json({ message: "Failed to fetch top anime from external API" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = updateUserProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Chat routes
  app.get('/api/chat/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const rooms = await storage.getUserChatRooms(userId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.get('/api/chat/rooms/public', async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching public chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch public chat rooms" });
    }
  });

  app.post('/api/chat/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const roomData = insertChatRoomSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const room = await storage.createChatRoom(roomData);
      res.json(room);
    } catch (error) {
      console.error("Error creating chat room:", error);
      res.status(500).json({ message: "Failed to create chat room" });
    }
  });

  app.get('/api/chat/rooms/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getChatMessages(roomId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/rooms/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const roomId = parseInt(req.params.id);
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        roomId,
        userId,
      });
      const message = await storage.sendChatMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending chat message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.post('/api/chat/rooms/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const roomId = parseInt(req.params.id);
      const membership = await storage.joinChatRoom({ roomId, userId });
      res.json(membership);
    } catch (error) {
      console.error("Error joining chat room:", error);
      res.status(500).json({ message: "Failed to join chat room" });
    }
  });

  // User profile update route
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = updateUserProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Endpoint temporaire pour voir votre ID utilisateur
  app.get('/api/debug/my-id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userInfo = req.user;
      res.json({ userId, userInfo });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user ID" });
    }
  });

  // Admin routes - Accès restreint à l'utilisateur spécifique
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const user = await storage.getUser(req.user.id);
      const adminEmail = process.env.ADMIN_USER_ID || "sorokomarco@gmail.com";

      // Vérifier si l'utilisateur est l'admin spécifique
      if (user?.email !== adminEmail) {
        return res.status(403).json({ message: "Accès refusé - Admin uniquement" });
      }
      next();
    } catch (error) {
      console.error("Admin auth error:", error);
      res.status(500).json({ message: "Erreur de vérification admin" });
    }
  };

  app.get('/api/admin/posts', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const published = req.query.published ? req.query.published === 'true' : undefined;
      const posts = await storage.getAdminPosts(published);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin posts:", error);
      res.status(500).json({ message: "Failed to fetch admin posts" });
    }
  });

  app.get('/api/admin/posts/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getAdminPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching admin post:", error);
      res.status(500).json({ message: "Failed to fetch admin post" });
    }
  });

  app.post('/api/admin/posts', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const postData = insertAdminPostSchema.parse({
        ...req.body,
        authorId: userId,
      });
      const post = await storage.createAdminPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating admin post:", error);
      res.status(500).json({ message: "Failed to create admin post" });
    }
  });

  app.put('/api/admin/posts/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const post = await storage.updateAdminPost(id, updates);
      res.json(post);
    } catch (error) {
      console.error("Error updating admin post:", error);
      res.status(500).json({ message: "Failed to update admin post" });
    }
  });

  app.delete('/api/admin/posts/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAdminPost(id);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting admin post:", error);
      res.status(500).json({ message: "Failed to delete admin post" });
    }
  });

  // Public posts for non-admin users
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await storage.getPublicPosts(); // Only published, non-admin-only posts
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get all chat messages
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getChatMessages(1);
      // Ensure unique IDs for React keys
      const messagesWithUniqueIds = messages.map((message: any, index: number) => ({
        ...message,
        id: `${message.id}-${index}-${Date.now()}`
      }));
      res.json(messagesWithUniqueIds);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Send chat message
  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Content is required" });
      }

      const messageData = {
        content: content.trim(),
        roomId: 1, // Default room
        userId,
      };
      
      const message = await storage.sendChatMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending chat message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}