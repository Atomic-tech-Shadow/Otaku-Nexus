import { apiRequest } from "./queryClient";

// Anime API functions
export const animeApi = {
  getTrending: () => fetch("/api/anime/trending").then(res => res.json()),
  search: (query: string) => fetch(`/api/anime/search?q=${encodeURIComponent(query)}`).then(res => res.json()),
  getExternal: (query: string) => fetch(`/api/external/anime/search?q=${encodeURIComponent(query)}`).then(res => res.json()),
  getTopExternal: () => fetch("/api/external/anime/top").then(res => res.json()),
  create: (anime: any) => apiRequest("POST", "/api/anime", anime),
};

// Quiz API functions
export const quizApi = {
  getAll: () => fetch("/api/quizzes").then(res => res.json()),
  getFeatured: () => fetch("/api/quizzes/featured").then(res => res.json()),
  getById: (id: number) => fetch(`/api/quizzes/${id}`).then(res => res.json()),
  create: (quiz: any) => apiRequest("POST", "/api/quizzes", quiz),
  submitResult: (result: any) => apiRequest("POST", "/api/quiz-results", result),
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
  create: (video: any) => apiRequest("POST", "/api/videos", video),
};

// Favorites API functions
export const favoritesApi = {
  getAll: () => fetch("/api/favorites").then(res => res.json()),
  add: (animeId: number, rating?: number) => apiRequest("POST", "/api/favorites", { animeId, rating }),
  remove: (animeId: number) => apiRequest("DELETE", `/api/favorites/${animeId}`),
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
