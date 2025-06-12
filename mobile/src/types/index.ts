// Types basés sur le schéma de l'application web
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  bio?: string;
  level: number;
  xp: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Anime {
  id: number;
  malId?: number;
  title: string;
  imageUrl?: string;
  score?: string;
  year?: number;
  synopsis?: string;
  episodes?: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  xpReward: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
  id: number;
  userId: string;
  quizId: number;
  score: number;
  completedAt: string;
  timeSpent?: number;
  xpEarned: number;
}

export interface AnimeFavorite {
  id: number;
  userId: string;
  animeId: number;
  createdAt: string;
}

export interface Video {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: string;
  duration?: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}