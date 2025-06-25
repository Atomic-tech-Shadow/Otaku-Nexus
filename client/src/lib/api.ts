import { apiRequest } from "./queryClient";



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
