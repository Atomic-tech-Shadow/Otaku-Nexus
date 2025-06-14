import { apiRequest } from "./queryClient";

// Anime API functions
export const animeApi = {
  getTrending: () => fetch("/api/anime/trending").then(res => res.json()),
  search: (query: string) => fetch(`/api/anime/search?q=${encodeURIComponent(query)}`).then(res => res.json()),
  getExternal: (query: string) => fetch(`/api/external/anime/search?q=${encodeURIComponent(query)}`).then(res => res.json()),
  getTopExternal: () => fetch("/api/external/anime/top").then(res => res.json()),
  create: (anime: any) => apiRequest("/api/anime", { method: "POST", body: anime }),
};

// Quiz API functions
export const quizApi = {
  getAll: () => fetch("/api/quizzes").then(res => res.json()),
  getFeatured: () => fetch("/api/quizzes/featured").then(res => res.json()),
  getById: (id: number) => fetch(`/api/quizzes/${id}`).then(res => res.json()),
  create: (quiz: any) => apiRequest("/api/quizzes", { method: "POST", body: quiz }),
  submitResult: (result: any) => apiRequest("/api/quiz-results", { method: "POST", body: result }),
  getResults: () => fetch("/api/quiz-results").then(res => res.json()),
};

// Video API functions
export const videoApi = {
  getAll: (limit?: number) => {
    const url = limit ? `/api/videos?limit=${limit}` : "/api/videos";
    return fetch(url).then(res => res.json());
  },
  getPopular: () => fetch("/api/videos/popular").then(res => res.json()),
  getById: (id: number) => fetch(`/api/videos/${id}`).then(res => res.json()),
  create: (video: any) => apiRequest("/api/videos", { method: "POST", body: video }).then(res => res.json()),
};

// Favorites API functions
export const favoritesApi = {
  getAll: () => fetch("/api/favorites").then(res => res.json()),
  add: (animeId: number, rating?: number) => apiRequest("/api/favorites", { method: "POST", body: { animeId, rating } }).then(res => res.json()),
  remove: (animeId: number) => apiRequest(`/api/favorites/${animeId}`, { method: "DELETE" }).then(res => res.json()),
};

// User API functions
export const userApi = {
  getStats: () => {
    const token = localStorage.getItem("auth_token");
    return fetch("/api/user/stats", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    }).then(res => res.json());
  },
  getProfile: () => {
    const token = localStorage.getItem("auth_token");
    return fetch("/api/auth/user", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    }).then(res => res.json());
  },
};

// Manga API functions
export const mangaApi = {
  getAll: (limit?: number) => {
    const url = limit ? `/api/manga?limit=${limit}` : "/api/manga";
    return fetch(url).then(res => res.json());
  },
  getPopular: (limit?: number) => {
    const url = limit ? `/api/manga/popular?limit=${limit}` : "/api/manga/popular";
    return fetch(url).then(res => res.json());
  },
  getLatest: (limit?: number) => {
    const url = limit ? `/api/manga/latest?limit=${limit}` : "/api/manga/latest";
    return fetch(url).then(res => res.json());
  },
  getById: (mangaId: string) => fetch(`/api/manga/${mangaId}`).then(res => res.json()),
  search: (query: string) => fetch(`/api/manga/search?q=${encodeURIComponent(query)}`).then(res => res.json()),
  getChapters: (mangaId: string) => fetch(`/api/manga/${mangaId}/chapters`).then(res => res.json()),
  getChapterPages: (chapterId: string) => fetch(`/api/manga/chapter/${chapterId}/pages`).then(res => res.json()),
  getProgress: (mangaId?: number) => {
    const url = mangaId ? `/api/manga/progress?mangaId=${mangaId}` : "/api/manga/progress";
    return fetch(url).then(res => res.json());
  },
  updateProgress: (progress: any) => apiRequest("/api/manga/progress", { method: "POST", body: progress }),
  getDownloads: () => fetch("/api/manga/downloads").then(res => res.json()),
  downloadChapter: (chapterId: number) => apiRequest(`/api/manga/download/${chapterId}`, { method: "POST", body: {} }),
};

// External APIs (for real-time data)
export const externalApi = {
  searchJikan: async (query: string) => {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
      if (!response.ok) throw new Error("Failed to fetch from Jikan API");
      return await response.json();
    } catch (error) {
      console.error("Jikan API error:", error);
      // Fallback to our internal API
      return await fetch(`/api/external/anime/search?q=${encodeURIComponent(query)}`).then(res => res.json());
    }
  },
  
  getTopAnime: async () => {
    try {
      const response = await fetch("https://api.jikan.moe/v4/top/anime?limit=10");
      if (!response.ok) throw new Error("Failed to fetch top anime from Jikan API");
      return await response.json();
    } catch (error) {
      console.error("Jikan API error:", error);
      // Fallback to our internal API
      return await fetch("/api/external/anime/top").then(res => res.json());
    }
  }
};

// Main API object for general HTTP requests
export const api = {
  get: async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: await response.json() };
  },
  
  post: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: await response.json() };
  }
};
