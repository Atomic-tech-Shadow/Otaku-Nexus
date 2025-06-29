import express from "express";
import { createServer } from "http";
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

export async function registerRoutes(app: any) {
  // Health check endpoint
  app.get('/api/health', (req: any, res: any) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // CORS headers for production
  app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });

  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.post('/api/auth/register', async (req: any, res: any) => {
    try {
      const result = registerSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid data', details: result.error.errors });
      }

      const { email, password, firstName, lastName } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        isAdmin: false
      });

      const token = generateToken({ userId: user.id, email: user.email });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req: any, res: any) => {
    try {
      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      const { email, password } = result.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await comparePassword(password, user.passwordHash || '');
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res: any) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        bio: user.bio,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Quiz routes
  app.post('/api/quizzes', isAuthenticated, async (req: any, res: any) => {
    try {
      const result = insertQuizSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid quiz data' });
      }

      const quiz = await storage.createQuiz(result.data);
      res.status(201).json({ message: 'Quiz created successfully', quiz });
    } catch (error) {
      console.error('Create quiz error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/quizzes', async (req: any, res: any) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error('Get quizzes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/quizzes/featured', async (req: any, res: any) => {
    try {
      const featuredQuiz = await storage.getFeaturedQuiz();
      if (!featuredQuiz) {
        return res.status(404).json({ error: 'No featured quiz found' });
      }
      res.json(featuredQuiz);
    } catch (error) {
      console.error('Get featured quiz error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/quizzes/:id', async (req: any, res: any) => {
    try {
      const quizId = parseInt(req.params.id);
      if (isNaN(quizId)) {
        return res.status(400).json({ error: 'Invalid quiz ID' });
      }

      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      res.json(quiz);
    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/quizzes/:id', isAuthenticated, async (req: any, res: any) => {
    try {
      const quizId = parseInt(req.params.id);
      if (isNaN(quizId)) {
        return res.status(400).json({ error: 'Invalid quiz ID' });
      }

      const result = insertQuizSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid quiz data' });
      }

      const updatedQuiz = await storage.updateQuiz(quizId, result.data);
      res.json({ message: 'Quiz updated successfully', quiz: updatedQuiz });
    } catch (error) {
      console.error('Update quiz error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Quiz results routes
  app.get('/api/quiz-results', isAuthenticated, async (req: any, res: any) => {
    try {
      const results = await storage.getUserQuizResults(req.user.userId);
      res.json(results);
    } catch (error) {
      console.error('Get quiz results error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/quiz-results/:quizId', isAuthenticated, async (req: any, res: any) => {
    try {
      const quizId = parseInt(req.params.quizId);
      if (isNaN(quizId)) {
        return res.status(400).json({ error: 'Invalid quiz ID' });
      }

      const results = await storage.getUserQuizResults(req.user.userId);
      const quizResults = results.filter(r => r.quizId === quizId);
      
      res.json(quizResults);
    } catch (error) {
      console.error('Get quiz results error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/user/stats', isAuthenticated, async (req: any, res: any) => {
    try {
      const stats = await storage.getUserStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/quiz-results', isAuthenticated, async (req: any, res: any) => {
    try {
      const result = insertQuizResultSchema.safeParse({
        ...req.body,
        userId: req.user.userId
      });
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid quiz result data' });
      }

      const quizResult = await storage.createQuizResult(result.data);
      
      // Update user XP
      if (result.data.xpEarned > 0) {
        await storage.updateUserXP(req.user.userId, result.data.xpEarned);
      }

      res.status(201).json({ message: 'Quiz result saved successfully', result: quizResult });
    } catch (error) {
      console.error('Create quiz result error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Leaderboard route
  app.get('/api/users/leaderboard', async (req: any, res: any) => {
    try {
      const leaderboard = await storage.getLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/users/:userId/quiz-results', async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      const results = await storage.getUserQuizResults(userId);
      res.json(results);
    } catch (error) {
      console.error('Get user quiz results error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res: any) => {
    try {
      const result = updateUserProfileSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid profile data' });
      }

      const updatedUser = await storage.updateUserProfile(req.user.userId, result.data);
      res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Chat routes
  app.get('/api/chat/rooms', isAuthenticated, async (req: any, res: any) => {
    try {
      const rooms = await storage.getChatRooms(req.user.userId);
      res.json(rooms);
    } catch (error) {
      console.error('Get chat rooms error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/chat/rooms/:id', async (req: any, res: any) => {
    try {
      const roomId = parseInt(req.params.id);
      if (isNaN(roomId)) {
        return res.status(400).json({ error: 'Invalid room ID' });
      }

      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      res.json(room);
    } catch (error) {
      console.error('Get chat room error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/chat/rooms/:id/messages', async (req: any, res: any) => {
    try {
      const roomId = parseInt(req.params.id);
      if (isNaN(roomId)) {
        return res.status(400).json({ error: 'Invalid room ID' });
      }

      const messages = await storage.getChatMessages(roomId);
      res.json(messages);
    } catch (error) {
      console.error('Get chat messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/chat/rooms/:id/messages', isAuthenticated, async (req: any, res: any) => {
    try {
      const roomId = parseInt(req.params.id);
      if (isNaN(roomId)) {
        return res.status(400).json({ error: 'Invalid room ID' });
      }

      const result = insertChatMessageSchema.safeParse({
        ...req.body,
        userId: req.user.userId,
        roomId
      });

      if (!result.success) {
        return res.status(400).json({ error: 'Invalid message data' });
      }

      const message = await storage.sendChatMessage(result.data);
      res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin routes
  app.get('/api/admin/posts', isAuthenticated, async (req: any, res: any) => {
    try {
      const published = req.query.published === 'true';
      const posts = await storage.getAdminPosts(published);
      res.json(posts);
    } catch (error) {
      console.error('Get admin posts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admin/posts', isAuthenticated, async (req: any, res: any) => {
    try {
      const result = insertAdminPostSchema.safeParse({
        ...req.body,
        authorId: req.user.userId
      });

      if (!result.success) {
        return res.status(400).json({ error: 'Invalid post data' });
      }

      const post = await storage.createAdminPost(result.data);
      res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
      console.error('Create admin post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Public posts route
  app.get('/api/posts', async (req: any, res: any) => {
    try {
      const posts = await storage.getPublishedPosts();
      res.json(posts);
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // WebSocket server setup
  const server = createServer(app);

  return server;
}