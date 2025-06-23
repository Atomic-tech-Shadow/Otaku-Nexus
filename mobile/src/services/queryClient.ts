import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration query client pour mobile synchronisée avec le web
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

// Persistance des queries importantes (comme le site web)
export const persistQueries = [
  'anime-sama',
  'userStats',
  'userProfile',
];

// Helper pour invalider les caches anime-sama
export const invalidateAnimeSamaQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['anime-sama'] });
};

// Helper pour prefetch les données importantes
export const prefetchCriticalData = async () => {
  try {
    // Prefetch catalogue si pas en cache (comme le site web au démarrage)
    const catalogueCache = queryClient.getQueryData(['anime-sama', 'catalogue']);
    if (!catalogueCache) {
      await queryClient.prefetchQuery({
        queryKey: ['anime-sama', 'catalogue'],
        staleTime: 60 * 60 * 1000, // 1 hour
      });
    }
  } catch (error) {
    console.log('Prefetch failed:', error);
  }
};

export default queryClient;