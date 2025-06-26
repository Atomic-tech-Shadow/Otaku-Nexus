import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'wouter';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  type?: string;
  status?: string;
  image: string;
  description?: string;
  genres?: string[];
  year?: string;
}

interface AnimeDetails {
  id: string;
  title: string;
  description?: string;
  image: string;
  genres?: string[];
  status?: string;
  year?: string;
  episodes?: Episode[];
  url: string;
}

interface Episode {
  id: string;
  title?: string;
  episodeNumber: number;
  url: string;
  language?: string;
  available?: boolean;
}

interface EpisodeDetails {
  id: string;
  title?: string;
  animeTitle?: string;
  episodeNumber?: number;
  sources?: VideoSource[];
  availableServers?: string[];
  url?: string;
  streamingUrl?: string;
}

interface VideoSource {
  url: string;
  server?: string;
  quality?: string;
  language?: string;
  type?: string;
  serverIndex?: number;
}

const AnimeSamaPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'search' | 'anime' | 'player'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>('VOSTFR');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['VOSTFR']);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [selectedServer, setSelectedServer] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchHistory, setWatchHistory] = useState<{[key: string]: number}>({});
  const [videoProgress, setVideoProgress] = useState<{[key: string]: number}>({});
  const [lastWatched, setLastWatched] = useState<string | null>(null);
  const [popularAnimes, setPopularAnimes] = useState<SearchResult[]>([]);

  // Charger l'historique au démarrage
  useEffect(() => {
    const savedHistory = localStorage.getItem('animeWatchHistory');
    if (savedHistory) {
      setWatchHistory(JSON.parse(savedHistory));
    }
    // Charger les animes populaires au démarrage
    loadPopularAnimes();
  }, []);

  // Charger les animes populaires depuis l'API
  const loadPopularAnimes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/trending`, {
        method: 'GET',
        headers: API_HEADERS,
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      if (apiResponse.success && Array.isArray(apiResponse.data)) {
        setPopularAnimes(apiResponse.data.slice(0, 12));
      } else {
        setPopularAnimes([]);
      }
    } catch (err) {
      console.error('Error loading popular animes:', err);
      setError('Impossible de charger les animes populaires');
      setPopularAnimes([]);
    }
  };

  const API_BASE = 'https://api-anime-sama.onrender.com';

  // Configuration des headers CORS requis
  const API_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': window.location.origin
  };

  // Recherche d'animes
  const searchAnimes = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: API_HEADERS,
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      if (apiResponse.success && apiResponse.data && Array.isArray(apiResponse.data.results)) {
        setSearchResults(apiResponse.data.results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError('Impossible de rechercher les animes.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les détails d'un anime
  const loadAnimeDetails = async (animeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/anime/${animeId}`, {
        method: 'GET',
        headers: API_HEADERS,
        mode: 'cors'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Anime non trouvé');
        } else {
          throw new Error(`Erreur API: ${response.status}`);
        }
      }
      
      const data = await response.json();
      setSelectedAnime(data);
      setCurrentView('anime');
      setSelectedSeason(null);
      setEpisodes([]);
    } catch (err) {
      console.error('Erreur anime:', err);
      setError('Impossible de charger les détails de l\'anime.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction simplifiée pour obtenir les épisodes d'un anime
  const loadAnimeEpisodes = async (animeId: string) => {
    setLoading(true);
    setError(null);
    setCurrentView('player');
    
    try {
      const response = await fetch(`${API_BASE}/api/anime/${animeId}`, {
        method: 'GET',
        headers: API_HEADERS,
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const animeData = await response.json();
      
      // L'API retourne les épisodes dans les détails de l'anime
      if (animeData.episodes && Array.isArray(animeData.episodes)) {
        setEpisodes(animeData.episodes);
        // Charger automatiquement le premier épisode
        if (animeData.episodes.length > 0) {
          const firstEpisode = animeData.episodes[0];
          setSelectedEpisode(firstEpisode);
          await loadEpisodeSources(firstEpisode.id);
        }
      } else {
        setEpisodes([]);
        setError('Aucun épisode disponible pour cet anime');
      }
    } catch (err) {
      console.error('Erreur épisodes:', err);
      setError('Impossible de charger les épisodes.');
    } finally {
      setLoading(false);
    }
  };



  // Charger les sources d'un épisode
  const loadEpisodeSources = async (episodeId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/episode/${episodeId}`, {
        method: 'GET',
        headers: API_HEADERS,
        mode: 'cors'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Épisode non trouvé');
        } else {
          throw new Error(`Erreur API: ${response.status}`);
        }
      }
      
      const data = await response.json();
      setEpisodeDetails(data);
      setSelectedServer(0);
    } catch (err) {
      console.error('Erreur sources:', err);
      setError('Impossible de charger les sources vidéo. Vérifiez que l\'épisode est disponible.');
      setEpisodeDetails(null);
    }
  };

  // Navigation entre épisodes
  const navigateEpisode = async (direction: 'prev' | 'next') => {
    if (!selectedEpisode || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(ep => ep.id === selectedEpisode.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < episodes.length) {
      const newEpisode = episodes[newIndex];
      setSelectedEpisode(newEpisode);
      await loadEpisodeSources(newEpisode.id);
    }
  };



  // Effet de recherche avec délai optimisé
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && currentView === 'search') {
        searchAnimes(searchQuery);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentView]);

  const currentSources = episodeDetails?.sources || [];
  const currentSource = currentSources[selectedServer];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
      {/* Header exact anime-sama avec recherche intégrée */}
      <div className="sticky top-0 z-50" style={{ backgroundColor: '#000000', borderBottom: '1px solid #333' }}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center flex-1">
            <Link href="/" className="mr-3">
              <button className="p-2 rounded" style={{ backgroundColor: '#1a1a1a' }}>
                <ArrowLeft size={18} className="text-white" />
              </button>
            </Link>
            
            {currentView === 'search' ? (
              <div className="flex items-center flex-1">
                <div className="text-white font-bold text-lg mr-2">🔍</div>
                <input
                  type="text"
                  placeholder="Rechercher un anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded text-sm border border-gray-700 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="text-white font-bold text-lg mr-2">🔍</div>
                <span className="text-white font-medium text-sm uppercase tracking-wide">
                  {currentView === 'anime' ? 'APERÇU' : 
                   selectedAnime?.title || 'ANIME'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3">
            <div className="text-white text-xl">🇹🇬</div>
          </div>
        </div>
      </div>

      {/* Page de recherche */}
      {currentView === 'search' && (
        <div className="p-4">


          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => loadAnimeDetails(anime.id)}
                  className="rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <img
                    src={anime.image || `https://via.placeholder.com/300x400/1a1a1a/00bcd4?text=${encodeURIComponent(anime.title)}`}
                    alt={anime.title}
                    className="w-full aspect-[3/4] object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/300x400/1a1a1a/00bcd4?text=${encodeURIComponent(anime.title)}`;
                    }}
                  />
                  <div className="p-3">
                    <h3 className="text-white font-medium text-sm line-clamp-2">{anime.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-gray-400 text-xs">{anime.status}</p>
                      {watchHistory[anime.id] && (
                        <span className="text-cyan-400 text-xs bg-cyan-900/30 px-1 rounded">
                          Ep {watchHistory[anime.id]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchQuery && !searchResults.length && (
            <div>
              {/* Section Animes Populaires */}
              {popularAnimes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white text-lg font-bold">🔥 Animes Populaires</h2>
                    <button 
                      onClick={() => loadPopularAnimes()}
                      className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
                    >
                      Actualiser
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {popularAnimes.map((anime) => (
                      <div
                        key={anime.id}
                        onClick={() => loadAnimeDetails(anime.id)}
                        className="rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
                        style={{ backgroundColor: '#1a1a1a' }}
                      >
                        <div className="relative">
                          <img
                            src={anime.image || `https://via.placeholder.com/300x400/1a1a1a/00bcd4?text=${encodeURIComponent(anime.title)}`}
                            alt={anime.title}
                            className="w-full aspect-[3/4] object-cover group-hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/300x400/1a1a1a/00bcd4?text=${encodeURIComponent(anime.title)}`;
                              target.onerror = null; // Prevent infinite loop
                            }}
                          />
                          {watchHistory[anime.id] && (
                            <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded">
                              Ep {watchHistory[anime.id]}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">{anime.title}</h3>
                          <p className="text-gray-400 text-xs">{anime.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message d'accueil */}
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎌</div>
                <h2 className="text-white text-xl font-bold mb-2">Bienvenue sur Anime Sama</h2>
                <p className="text-gray-400 mb-6">Recherchez et regardez vos animes préférés</p>
                <div className="text-gray-500 text-sm">
                  Tapez le nom d'un anime dans la barre de recherche pour commencer
                </div>
              </div>
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-white text-lg font-medium mb-2">Aucun résultat</h3>
              <p className="text-gray-400">Essayez avec d'autres mots-clés</p>
            </div>
          )}

        </div>
      )}

      {/* Page de détail anime */}
      {currentView === 'anime' && selectedAnime && (
        <div className="p-4">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('search')}
              className="flex items-center text-cyan-400 hover:text-cyan-300 mb-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              Retour à la recherche
            </button>
            
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={selectedAnime.image}
                alt={selectedAnime.title}
                className="w-full md:w-64 aspect-[3/4] object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=Image+Non+Disponible';
                }}
              />
              
              <div className="flex-1">
                <h1 className="text-white text-2xl font-bold mb-4">{selectedAnime.title}</h1>
                <p className="text-gray-300 mb-4 leading-relaxed">{selectedAnime.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-gray-400 text-sm">Statut:</span>
                    <span className="text-white ml-2">{selectedAnime.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Année:</span>
                    <span className="text-white ml-2">{selectedAnime.year}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-400 text-sm">Genres:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAnime.genres && selectedAnime.genres.length > 0 ? (
                        selectedAnime.genres.map((genre, index) => (
                          <span key={index} className="bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded text-xs">
                            {genre}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">Genres non disponibles</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white text-lg font-semibold mb-3">Regarder l'anime</h3>
                  <button
                    onClick={() => loadAnimeEpisodes(selectedAnime.id)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    Commencer à regarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page de lecture */}
      {currentView === 'player' && selectedAnime && selectedSeason && (
        <div className="p-4">
          <div className="mb-4">
            <button
              onClick={() => setCurrentView('anime')}
              className="flex items-center text-cyan-400 hover:text-cyan-300 mb-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              Retour à {selectedAnime.title}
            </button>
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Lecteur vidéo */}
              <div className="flex-1">
                <div className="bg-black rounded-lg overflow-hidden mb-4">
                  {episodeDetails && currentSource ? (
                    <div className="aspect-video bg-black flex items-center justify-center">
                      <iframe
                        src={currentSource.url}
                        className="w-full h-full"
                        allowFullScreen
                        title={`${selectedAnime.title} - Episode ${selectedEpisode?.episodeNumber}`}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📺</div>
                        <p className="text-gray-400">
                          {loading ? 'Chargement...' : 'Sélectionnez un épisode pour commencer'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Contrôles de lecture */}
                {selectedEpisode && (
                  <div className="bg-gray-800 p-4 rounded-lg mb-4">
                    <h2 className="text-white text-lg font-semibold mb-2">
                      {selectedAnime.title} - Episode {selectedEpisode.episodeNumber}
                    </h2>
                    
                    {/* Information sur la langue */}
                    {selectedLanguage && (
                      <div className="mb-4">
                        <span className="text-gray-400 text-sm">Langue: </span>
                        <span className="text-cyan-400 text-sm">{selectedLanguage}</span>
                      </div>
                    )}
                    
                    {/* Sélecteur de serveur */}
                    {currentSources.length > 1 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {currentSources.map((source, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedServer(index)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              selectedServer === index
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {source.server} ({source.quality})
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Navigation épisodes */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigateEpisode('prev')}
                        disabled={!episodes.find(ep => ep.id === selectedEpisode.id) || episodes[0].id === selectedEpisode.id}
                        className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                      >
                        ← Précédent
                      </button>
                      <button
                        onClick={() => navigateEpisode('next')}
                        disabled={!episodes.find(ep => ep.id === selectedEpisode.id) || episodes[episodes.length - 1].id === selectedEpisode.id}
                        className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Liste des épisodes */}
              <div className="w-full lg:w-80">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white text-lg font-semibold mb-4">
                    Episodes ({selectedLanguage})
                  </h3>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {episodes.map((episode) => (
                      <button
                        key={episode.id}
                        onClick={() => {
                          setSelectedEpisode(episode);
                          loadEpisodeSources(episode.id);
                        }}
                        className={`w-full text-left p-3 rounded transition-colors ${
                          selectedEpisode?.id === episode.id
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="font-medium">Episode {episode.episodeNumber}</div>
                        {episode.title && (
                          <div className="text-sm opacity-75 mt-1">{episode.title}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mr-3"></div>
              <p className="text-white text-sm">Chargement...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 p-3 rounded-lg z-50" style={{ backgroundColor: '#dc2626' }}>
          <p className="text-white text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-2 text-white hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default AnimeSamaPage;