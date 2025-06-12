import { 
  User, 
  Anime, 
  Quiz, 
  QuizResult, 
  Video, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  AnimeFavorite 
} from '../types';

// Configuration de l'API - remplacez par l'URL de votre serveur
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Anime endpoints
  async getAnimes(limit?: number): Promise<Anime[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<Anime[]>(`/animes${params}`);
  }

  async getTrendingAnimes(): Promise<Anime[]> {
    return this.request<Anime[]>('/animes/trending');
  }

  async searchAnimes(query: string): Promise<Anime[]> {
    return this.request<Anime[]>(`/animes/search?q=${encodeURIComponent(query)}`);
  }

  async getAnime(id: number): Promise<Anime> {
    return this.request<Anime>(`/animes/${id}`);
  }

  // Favorites endpoints
  async getUserFavorites(): Promise<AnimeFavorite[]> {
    return this.request<AnimeFavorite[]>('/favorites');
  }

  async addToFavorites(animeId: number): Promise<AnimeFavorite> {
    return this.request<AnimeFavorite>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ animeId }),
    });
  }

  async removeFromFavorites(animeId: number): Promise<void> {
    await this.request(`/favorites/${animeId}`, { method: 'DELETE' });
  }

  // Quiz endpoints
  async getQuizzes(): Promise<Quiz[]> {
    return this.request<Quiz[]>('/quizzes');
  }

  async getQuiz(id: number): Promise<Quiz> {
    return this.request<Quiz>(`/quizzes/${id}`);
  }

  async getFeaturedQuiz(): Promise<Quiz> {
    return this.request<Quiz>('/quizzes/featured');
  }

  async submitQuizResult(data: {
    quizId: number;
    score: number;
    timeSpent?: number;
  }): Promise<QuizResult> {
    return this.request<QuizResult>('/quiz-results', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserQuizResults(): Promise<QuizResult[]> {
    return this.request<QuizResult[]>('/quiz-results');
  }

  // User stats
  async getUserStats(): Promise<{
    totalQuizzes: number;
    totalAnime: number;
    totalXP: number;
    rank: number;
  }> {
    return this.request('/users/stats');
  }

  // Videos endpoints
  async getVideos(limit?: number): Promise<Video[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<Video[]>(`/videos${params}`);
  }

  async getPopularVideos(): Promise<Video[]> {
    return this.request<Video[]>('/videos/popular');
  }

  async getVideo(id: number): Promise<Video> {
    return this.request<Video>(`/videos/${id}`);
  }

  // Profile endpoints
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    profileImageUrl?: string;
  }): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();