import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';

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

const AnimeSearchPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAnime = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Recherche anime:', query);
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const apiResponse: ApiResponse<SearchResult[]> = await response.json();
      console.log('Résultats recherche:', apiResponse);
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors de la recherche');
      }
      
      setSearchResults(apiResponse.data);
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError('Impossible de rechercher les animes. Vérifiez votre connexion.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAnime(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAnimeClick = (animeId: string) => {
    setLocation(`/anime/${animeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center p-4">
          <Link href="/" className="mr-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
            >
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          <h1 className="text-lg font-semibold">Recherche d'anime</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Barre de recherche */}
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un anime (ex: naruto, one piece, demon slayer...)"
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Instructions */}
        {!searchQuery && (
          <div className="text-center py-12">
            <Search className="mx-auto mb-4 text-gray-500" size={48} />
            <h2 className="text-xl font-semibold mb-2">Recherchez votre anime</h2>
            <p className="text-gray-400">
              Tapez le nom de l'anime que vous souhaitez regarder
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Exemples populaires : naruto, one piece, attack on titan</p>
            </div>
          </div>
        )}

        {/* Résultats de recherche */}
        {searchResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Résultats ({searchResults.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((anime) => (
                <motion.div
                  key={anime.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnimeClick(anime.id)}
                  className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-750 transition-colors"
                >
                  <div className="relative aspect-[3/4]">
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=Image+Non+Disponible';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="font-semibold text-sm line-clamp-2">{anime.title}</h4>
                      <p className="text-xs text-gray-300 mt-1">{anime.status}</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="bg-cyan-500 rounded-full p-2">
                        <Play size={12} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Aucun résultat */}
        {searchQuery.trim() && searchResults.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
            <p className="text-gray-400">
              Aucun anime trouvé pour "{searchQuery}"
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Essayez avec un autre terme de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeSearchPage;