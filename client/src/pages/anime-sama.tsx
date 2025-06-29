import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/main-layout';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: any;
}

const AnimeSamaPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popularAnimes, setPopularAnimes] = useState<SearchResult[]>([]);

  // Configuration API externe
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

  // Charger les animes populaires au démarrage
  const loadPopularAnimes = async () => {
    try {
      console.log('Chargement animes populaires...');
      const response = await fetch(`${API_BASE_URL}/api/trending`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Réponse trending status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse: ApiResponse<SearchResult[]> = await response.json();
      console.log('Données trending reçues:', apiResponse);
      
      if (apiResponse.success && Array.isArray(apiResponse.data)) {
        const animesWithImages = apiResponse.data.map(anime => ({
          ...anime,
          image: anime.image || 'https://via.placeholder.com/300x400?text=Anime',
          status: anime.status || 'Disponible',
          type: anime.type || 'Anime'
        }));
        setPopularAnimes(animesWithImages);
      }
    } catch (err) {
      console.error('Erreur trending:', err);
      setPopularAnimes([]);
    }
  };

  useEffect(() => {
    loadPopularAnimes();
  }, []);

  // Rechercher des animes
  const searchAnimes = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Recherche:', query);
      const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log('Réponse recherche status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse: ApiResponse<SearchResult[]> = await response.json();
      console.log('Données recherche reçues:', apiResponse);

      if (apiResponse.success && Array.isArray(apiResponse.data)) {
        const animesWithImages = apiResponse.data.map(anime => ({
          ...anime,
          image: anime.image || 'https://via.placeholder.com/300x400?text=Anime',
          status: anime.status || 'Disponible',
          type: anime.type || 'Anime'
        }));
        setSearchResults(animesWithImages);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de recherche';
      console.error('Erreur recherche:', errorMessage);
      setError('Impossible de rechercher les animes. Vérifiez votre connexion.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Naviguer vers la page anime dédiée
  const loadAnimeDetails = async (animeId: string) => {
    navigate(`/anime/${animeId}`);
  };

  // Gérer la recherche en temps réel
  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        searchAnimes(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Grille d'animes réutilisable
  const AnimeGrid: React.FC<{ animes: SearchResult[]; title: string }> = ({ animes, title }) => (
    <div className="glass-morphism rounded-2xl p-6 mb-6">
      <h2 className="text-xl font-semibold text-nexus-cyan mb-4">{title}</h2>
      
      {animes.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Aucun anime trouvé</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {animes.map((anime, index) => (
            <motion.div
              key={`${anime.id}-${index}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
              onClick={() => loadAnimeDetails(anime.id)}
            >
              <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
                <div className="aspect-[3/4] relative">
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x400?text=Anime';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-nexus-cyan/80 text-white text-xs px-2 py-1 rounded">
                    {anime.type}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                    {anime.title}
                  </h3>
                  <p className="text-gray-400 text-xs">{anime.status}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen text-white">
        {/* Header avec barre de recherche */}
        <div className="glass-morphism rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-nexus-cyan mb-4">Anime-Sama</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des animes..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-nexus-cyan transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="glass-morphism rounded-2xl p-6 mb-6">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Résultats de recherche */}
        {searchQuery && searchResults.length > 0 && (
          <AnimeGrid animes={searchResults} title={`Résultats pour "${searchQuery}"`} />
        )}

        {/* Animes populaires (si pas de recherche) */}
        {!searchQuery && popularAnimes.length > 0 && (
          <AnimeGrid animes={popularAnimes} title="Animes Populaires" />
        )}

        {/* Message si aucun résultat */}
        {searchQuery && !loading && searchResults.length === 0 && !error && (
          <div className="glass-morphism rounded-2xl p-6 text-center">
            <p className="text-gray-400">Aucun anime trouvé pour "{searchQuery}"</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AnimeSamaPage;