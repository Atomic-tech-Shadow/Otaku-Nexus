import express, { type Express, type Request, type Response, type NextFunction } from "express";
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
  registerSchema,
  loginSchema,
} from "./shared/schema";
import { setupAuth, isAuthenticated, generateToken, hashPassword, comparePassword } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // CORS headers for production
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Un utilisateur avec cet email existe déjà" });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(userData.password);
      const user = await storage.createUser({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash,
        xp: 0,
        level: 1,
        achievements: [],
        isAdmin: false,
      });

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          xp: user.xp,
          level: user.level,
          isAdmin: user.isAdmin,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          xp: user.xp,
          level: user.level,
          isAdmin: user.isAdmin,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      console.error("User fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Quiz routes
  app.post('/api/quizzes', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.json(quiz);
    } catch (error) {
      console.error("Quiz creation error:", error);
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.get('/api/quizzes', async (req: Request, res: Response) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Quizzes fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get('/api/quizzes/featured', async (req: Request, res: Response) => {
    try {
      const quiz = await storage.getFeaturedQuiz();
      res.json(quiz);
    } catch (error) {
      console.error("Featured quiz fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get('/api/quizzes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz non trouvé" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Quiz fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put('/api/quizzes/:id', isAuthenticated, async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const quiz = await storage.updateQuiz(id, updates);
      res.json(quiz);
    } catch (error) {
      console.error("Quiz update error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Quiz results routes
  app.get('/api/quiz-results', isAuthenticated, async (req: any, res: Response) => {
    try {
      const results = await storage.getUserQuizResults(req.user.userId);
      res.json(results);
    } catch (error) {
      console.error("Quiz results fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get('/api/quiz-results/:quizId', isAuthenticated, async (req: any, res: Response) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const results = await storage.getUserQuizResults(req.user.userId);
      const quizResults = results.filter(r => r.quizId === quizId);
      res.json(quizResults);
    } catch (error) {
      console.error("Quiz results fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get('/api/user/stats', isAuthenticated, async (req: any, res: Response) => {
    try {
      const stats = await storage.getUserStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      console.error("User stats fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post('/api/quiz-results', isAuthenticated, async (req: any, res: Response) => {
    try {
      const resultData = insertQuizResultSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });

      const result = await storage.createQuizResult(resultData);
      
      // Update user XP
      await storage.updateUserXP(req.user.userId, resultData.score * 10);

      res.json(result);
    } catch (error) {
      console.error("Quiz result creation error:", error);
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.get('/api/users/leaderboard', async (req: Request, res: Response) => {
    try {
      const leaderboard = await storage.getLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get('/api/users/:userId/quiz-results', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const results = await storage.getUserQuizResults(userId);
      res.json(results);
    } catch (error) {
      console.error("User quiz results fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res: Response) => {
    try {
      const profileData = updateUserProfileSchema.parse(req.body);
      const user = await storage.updateUserProfile(req.user.userId, profileData);
      res.json(user);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(400).json({ error: "Données invalides" });
    }
  });

  // Chat routes
  app.get('/api/chat/rooms', isAuthenticated, async (req: any, res: Response) => {
    try {
      const rooms = await storage.getUserChatRooms(req.user.userId);
      res.json(rooms);
    } catch (error) {
      console.error("Chat rooms fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get('/api/chat/rooms/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const room = await storage.getChatRoom(id);
      if (!room) {
        return res.status(404).json({ error: "Salon non trouvé" });
      }
      res.json(room);
    } catch (error) {
      console.error("Chat room fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get('/api/chat/rooms/:id/messages', async (req: Request, res: Response) => {
    try {
      const roomId = parseInt(req.params.id);
      const messages = await storage.getChatMessages(roomId);
      res.json(messages);
    } catch (error) {
      console.error("Chat messages fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post('/api/chat/rooms/:id/messages', isAuthenticated, async (req: any, res: Response) => {
    try {
      const roomId = parseInt(req.params.id);
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        roomId,
        userId: req.user.userId,
      });

      const message = await storage.sendChatMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Chat message creation error:", error);
      res.status(400).json({ error: "Données invalides" });
    }
  });

  // Admin routes
  app.get('/api/admin/posts', isAuthenticated, async (req: any, res: Response) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Accès refusé" });
      }
      const posts = await storage.getAdminPosts();
      res.json(posts);
    } catch (error) {
      console.error("Admin posts fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post('/api/admin/posts', isAuthenticated, async (req: any, res: Response) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Accès refusé" });
      }
      const postData = insertAdminPostSchema.parse({
        ...req.body,
        authorId: req.user.userId,
      });

      const post = await storage.createAdminPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Admin post creation error:", error);
      res.status(400).json({ error: "Données invalides" });
    }
  });

  // Posts routes for frontend
  app.get('/api/posts', async (req: Request, res: Response) => {
    try {
      const posts = await storage.getPublishedPosts();
      res.json(posts);
    } catch (error) {
      console.error("Posts fetch error:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Initialize database
  await storage.ensureAdminUser();
  await storage.ensureDefaultChatRoom();

  return createServer(app);
}