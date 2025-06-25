import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Shuffle, Grid3X3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import AnimeDetailPage from './anime-detail';

interface AnimeItem {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
  description?: string;
  genres?: string[];
  year?: string;
  progressInfo?: {
    advancement: string;
    correspondence: string;
    totalEpisodes: number;
    hasFilms: boolean;
    hasScans: boolean;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: any;
}

const AnimeSamaPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeItem[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<AnimeItem[]>([]);
  const [catalogueAnime, setCatalogueAnime] = useState<AnimeItem[]>([]);
  const [currentView, setCurrentView] = useState<'search' | 'trending' | 'catalogue' | 'detail'>('catalogue');
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadTrendingAnime();
    loadCatalogue();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchAnime(searchQuery);
      } else {
        setSearchResults([]);
        if (searchQuery.trim().length === 0) {
          setCurrentView('catalogue');
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchAnime = async (query: string) => {
    try {
      setSearchLoading(true);
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const apiResponse: ApiResponse<AnimeItem[]> = await response.json();
      
      if (apiResponse.success) {
        setSearchResults(apiResponse.data);
        setCurrentView('search');
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadTrendingAnime = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trending');
      const apiResponse: ApiResponse<AnimeItem[]> = await response.json();
      
      if (apiResponse.success) {
        setTrendingAnime(apiResponse.data.slice(0, 20));
      }
    } catch (err) {
      console.error('Trending error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogue = async () => {
    try {
      const response = await fetch('/api/catalogue?page=1');
      const apiResponse: ApiResponse<AnimeItem[]> = await response.json();
      
      if (apiResponse.success) {
        setCatalogueAnime(apiResponse.data.slice(0, 20));
      }
    } catch (err) {
      console.error('Catalogue error:', err);
    }
  };

  const loadRandomAnime = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/random');
      const apiResponse: ApiResponse<AnimeItem> = await response.json();
      
      if (apiResponse.success) {
        setSelectedAnimeId(apiResponse.data.id);
        setCurrentView('detail');
      }
    } catch (err) {
      console.error('Random error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimeClick = (animeId: string) => {
    setSelectedAnimeId(animeId);
    setCurrentView('detail');
  };

  const renderAnimeGrid = (animes: AnimeItem[], title: string) => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white px-4">{title}</h2>
      <div className="grid grid-cols-2 gap-3 px-4">
        {animes.map((anime, index) => (
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleAnimeClick(anime.id)}
            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="aspect-[3/4] bg-gray-700 relative">
              <img
                src={anime.image}
                alt={anime.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/200x280?text=Image+non+disponible';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="text-white text-sm font-semibold line-clamp-2">{anime.title}</h3>
                {anime.progressInfo && (
                  <p className="text-gray-300 text-xs mt-1">{anime.progressInfo.advancement}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (currentView === 'detail' && selectedAnimeId) {
    return <AnimeDetailPage animeId={selectedAnimeId} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Anime-Sama</h1>
          <button
            onClick={loadRandomAnime}
            disabled={loading}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Shuffle size={20} className="text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('catalogue')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              currentView === 'catalogue' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Grid3X3 size={16} />
            Catalogue
          </button>
          <button
            onClick={() => setCurrentView('trending')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              currentView === 'trending' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <TrendingUp size={16} />
            Tendances
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="py-6 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-lg">Chargement...</div>
          </div>
        ) : (
          <>
            {currentView === 'search' && searchResults.length > 0 && 
              renderAnimeGrid(searchResults, `Résultats pour "${searchQuery}"`)}
            
            {currentView === 'search' && searchResults.length === 0 && searchQuery.length >= 2 && !searchLoading && (
              <div className="text-center py-12">
                <p className="text-gray-400">Aucun résultat trouvé pour "{searchQuery}"</p>
              </div>
            )}
            
            {currentView === 'trending' && renderAnimeGrid(trendingAnime, 'Animes Tendances')}
            
            {currentView === 'catalogue' && renderAnimeGrid(catalogueAnime, 'Catalogue')}
          </>
        )}
      </div>
    </div>
  );
};

export default AnimeSamaPage;