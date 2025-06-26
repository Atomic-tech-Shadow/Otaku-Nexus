import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  authentic: boolean;
}

interface AnimeDetails {
  id: string;
  title: string;
  description: string;
  image: string;
  seasons: Season[];
  url: string;
}

interface Season {
  number: number;
  name: string;
  path: string;
  url: string;
  authentic: boolean;
}

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  url: string;
  server: string;
  authentic: boolean;
}

const AnimeSamaSimplePage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'search' | 'anime' | 'player'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [trendingAnimes, setTrendingAnimes] = useState<SearchResult[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>('VOSTFR');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('eps1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration API - Utiliser notre serveur local comme proxy
  const API_BASE_URL = 'http://localhost:5000';

  // Fonction API simplifiée
  const apiRequest = async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  };

  // Charger les animes trending au démarrage
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const response = await apiRequest('/api/trending');
        if (response && response.success && Array.isArray(response.data)) {
          setTrendingAnimes(response.data.slice(0, 12));
        }
      } catch (err) {
        console.error('Error loading trending:', err);
      }
    };
    loadTrending();
  }, []);

  // Recherche d'animes
  const searchAnimes = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`/api/search?query=${encodeURIComponent(query)}`);
      
      if (response && response.success && response.data && Array.isArray(response.data.results)) {
        setSearchResults(response.data.results);
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
      const response = await apiRequest(`/api/anime/${animeId}`);
      
      if (response && response.success && response.data) {
        setSelectedAnime(response.data);
        setCurrentView('anime');
        setSelectedSeason(null);
        setEpisodes([]);
      } else {
        throw new Error('Impossible de charger l\'anime');
      }
    } catch (err) {
      console.error('Erreur anime:', err);
      setError('Impossible de charger les détails de l\'anime.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les épisodes d'une saison avec serveurs multiples
  const loadSeasonEpisodes = async (season: Season) => {
    if (!selectedAnime) return;
    
    setLoading(true);
    setError(null);
    setCurrentView('player');
    
    try {
      const response = await apiRequest(`/api/seasons?animeId=${selectedAnime.id}&season=${season.number}&language=${selectedLanguage}`);
      
      if (response && response.success && response.data && response.data.episodes) {
        setEpisodes(response.data.episodes);
        setSelectedSeason(season);
        
        if (response.data.episodes.length > 0) {
          const firstEpisode = response.data.episodes[0];
          setSelectedEpisode(firstEpisode);
          setSelectedServer('eps1');
        }
      } else {
        throw new Error('Aucun épisode trouvé');
      }
    } catch (err) {
      console.error('Erreur épisodes:', err);
      setError('Impossible de charger les épisodes.');
    } finally {
      setLoading(false);
    }
  };

  // Changer de langue
  const changeLanguage = async (newLanguage: 'VF' | 'VOSTFR') => {
    if (!selectedSeason || !selectedAnime || selectedLanguage === newLanguage) {
      return;
    }
    
    setSelectedLanguage(newLanguage);
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`/api/seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${newLanguage}`);
      
      if (response && response.success && response.data && response.data.episodes && response.data.episodes.length > 0) {
        setEpisodes(response.data.episodes);
        setSelectedEpisode(response.data.episodes[0]);
      } else {
        throw new Error(`Aucun épisode ${newLanguage} disponible`);
      }
    } catch (err) {
      console.error('Erreur changement langue:', err);
      setError(`Impossible de charger les épisodes ${newLanguage}.`);
    } finally {
      setLoading(false);
    }
  };

  // Effet de recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && currentView === 'search') {
        searchAnimes(searchQuery);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentView]);

  // Récupérer l'URL vidéo basée sur le serveur sélectionné
  const getCurrentVideoUrl = async () => {
    if (!selectedEpisode || !selectedAnime || !selectedSeason) return null;
    
    try {
      // Charger les épisodes avec le serveur spécifique depuis l'API
      const response = await apiRequest(`/api/seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${selectedLanguage}&server=${selectedServer}`);
      
      if (response && response.success && response.data && response.data.episodes) {
        const episode = response.data.episodes.find((ep: Episode) => ep.episodeNumber === selectedEpisode.episodeNumber);
        return episode ? episode.url : selectedEpisode.url;
      }
      
      return selectedEpisode.url;
    } catch (err) {
      console.error('Erreur récupération URL:', err);
      return selectedEpisode.url;
    }
  };

  // Changer de serveur vidéo
  const changeServer = async (newServer: string) => {
    setSelectedServer(newServer);
    setLoading(true);
    
    try {
      // Recharger les épisodes avec le nouveau serveur
      if (selectedAnime && selectedSeason) {
        const response = await apiRequest(`/api/seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${selectedLanguage}`);
        
        if (response && response.success && response.data && response.data.episodes) {
          setEpisodes(response.data.episodes);
          
          // Garder le même épisode si possible
          if (selectedEpisode) {
            const episode = response.data.episodes.find((ep: Episode) => ep.episodeNumber === selectedEpisode.episodeNumber);
            if (episode) {
              setSelectedEpisode(episode);
            }
          }
        }
      }
    } catch (err) {
      console.error('Erreur changement serveur:', err);
      setError('Impossible de changer de serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
      {/* Header */}
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
                  placeholder="RECHERCHER..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded text-sm border border-gray-700 focus:border-cyan-500 focus:outline-none uppercase placeholder-gray-500"
                />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="text-white font-bold text-lg mr-2">🔍</div>
                <span className="text-white font-medium text-sm uppercase tracking-wide">
                  {currentView === 'anime' ? 'APERÇU' : selectedAnime?.title || 'ANIME'}
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
          {/* Animes trending */}
          {!searchQuery && trendingAnimes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-white text-lg font-bold mb-3 uppercase tracking-wide">TRENDING</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {trendingAnimes.map((anime, index) => (
                  <div
                    key={`trending-${anime.id}-${index}`}
                    onClick={() => loadAnimeDetails(anime.id)}
                    className="rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: '#1a1a1a' }}
                  >
                    <img
                      src={`https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/${anime.id}.jpg`}
                      alt={anime.title}
                      className="w-full aspect-[3/4] object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=Image+Non+Disponible';
                      }}
                    />
                    <div className="p-3">
                      <h3 className="text-white font-medium text-sm line-clamp-2">{anime.title}</h3>
                      <p className="text-gray-400 text-xs mt-1">Disponible</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Résultats de recherche */}
          {searchQuery && searchResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((anime, index) => (
                <div
                  key={`search-${anime.id}-${index}`}
                  onClick={() => loadAnimeDetails(anime.id)}
                  className="rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <img
                    src={`https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/${anime.id}.jpg`}
                    alt={anime.title}
                    className="w-full aspect-[3/4] object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=Image+Non+Disponible';
                    }}
                  />
                  <div className="p-3">
                    <h3 className="text-white font-medium text-sm line-clamp-2">{anime.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">Disponible</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message de recherche vide */}
          {searchQuery && searchResults.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-400">Aucun anime trouvé pour "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Page détails anime */}
      {currentView === 'anime' && selectedAnime && (
        <div className="p-0">
          {/* Image principale */}
          <div className="relative">
            <img
              src={`https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/${selectedAnime.id}.jpg`}
              alt={selectedAnime.title}
              className="w-full h-64 object-cover"
            />
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%)' }}
            />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-white text-2xl font-bold uppercase">{selectedAnime.title}</h1>
              
              <div className="mt-2 space-y-1">
                <div>
                  <span className="text-white font-medium">Avancement :</span>
                  <span className="text-gray-300 ml-2">Aucune donnée.</span>
                </div>
                <div>
                  <span className="text-white font-medium">Correspondance :</span>
                  <span className="text-gray-300 ml-2">Episode 1122 → Chapitre 1088</span>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2 p-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#2a2a2a' }}>
              <span>⭐</span> Favoris
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#2a2a2a' }}>
              <span>👁</span> Watchlist
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: '#2a2a2a' }}>
              <span>✓</span> Vu
            </button>
          </div>

          {/* Section ANIME avec sagas */}
          <div className="px-4 pb-4">
            <h2 className="text-white text-lg font-bold mb-4 uppercase tracking-wide">ANIME</h2>
            <div className="grid grid-cols-2 gap-3">
              {selectedAnime.seasons && selectedAnime.seasons.length > 0 ? (
                selectedAnime.seasons.map((season, index) => (
                  <button
                    key={`season-${selectedAnime.id}-${season.number}-${index}`}
                    onClick={() => loadSeasonEpisodes(season)}
                    className="relative overflow-hidden rounded-lg border-2 transition-all"
                    style={{ 
                      aspectRatio: '16/9',
                      borderColor: '#1e40af',
                      backgroundColor: '#1e40af'
                    }}
                  >
                    <img
                      src={`https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/${selectedAnime.id}.jpg`}
                      alt={season.name}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div 
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%)' }}
                    />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-white text-sm font-bold text-left">
                        {season.name}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-400">Chargement des saisons...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page lecteur */}
      {currentView === 'player' && selectedAnime && selectedSeason && (
        <div className="p-0">
          {/* Image avec titre */}
          <div className="relative">
            <img
              src={`https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/${selectedAnime.id}.jpg`}
              alt={selectedAnime.title}
              className="w-full h-48 object-cover"
            />
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%)' }}
            />
            <div className="absolute bottom-4 left-4">
              <h1 className="text-white text-2xl font-bold uppercase">{selectedAnime.title}</h1>
              <h2 className="text-gray-300 text-lg uppercase tracking-wider">{selectedSeason.name}</h2>
            </div>
          </div>

          {/* Interface de contrôle */}
          <div className="p-4 space-y-4">
            
            {/* Boutons de langue */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => changeLanguage('VOSTFR')}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedLanguage === 'VOSTFR'
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-transparent border-gray-600 text-gray-400'
                }`}
              >
                🇯🇵
              </button>
              <button
                onClick={() => changeLanguage('VF')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  selectedLanguage === 'VF'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                VF
              </button>
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              <select
                onChange={(e) => {
                  const episode = episodes.find(ep => ep.id === e.target.value);
                  if (episode) {
                    setSelectedEpisode(episode);
                  }
                }}
                className="w-full p-3 text-white rounded text-sm font-medium"
                style={{ backgroundColor: '#1e40af', border: '1px solid #3b82f6' }}
                defaultValue=""
              >
                <option value="" disabled>
                  EPISODE {selectedEpisode?.episodeNumber || 1}
                </option>
                {episodes.map((episode, index) => (
                  <option key={`episode-${episode.id}-${index}`} value={episode.id}>
                    EPISODE {episode.episodeNumber}
                  </option>
                ))}
              </select>

              <select
                value={selectedServer}
                onChange={(e) => changeServer(e.target.value)}
                className="w-full p-3 text-white rounded text-sm font-medium"
                style={{ backgroundColor: '#1e40af', border: '1px solid #3b82f6' }}
              >
                <option value="eps1">LECTEUR 1</option>
                <option value="eps2">LECTEUR 2</option>
                <option value="eps3">LECTEUR 3</option>
                <option value="eps4">LECTEUR 4</option>
              </select>
            </div>

            {/* Dernière sélection */}
            <div className="text-gray-400 text-sm">
              DERNIÈRE SÉLECTION : <span className="text-white italic">
                EPISODE {selectedEpisode?.episodeNumber || 1}
              </span>
            </div>

            {/* Boutons navigation */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  if (selectedEpisode) {
                    const currentIndex = episodes.findIndex(ep => ep.id === selectedEpisode.id);
                    if (currentIndex > 0) {
                      setSelectedEpisode(episodes[currentIndex - 1]);
                    }
                  }
                }}
                disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
                className="flex items-center justify-center w-14 h-14 text-white rounded-lg disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#1e40af' }}
              >
                ◀
              </button>
              
              <button
                className="flex items-center justify-center w-14 h-14 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#374151' }}
              >
                ⬇
              </button>
              
              <button
                onClick={() => {
                  if (selectedEpisode) {
                    const currentIndex = episodes.findIndex(ep => ep.id === selectedEpisode.id);
                    if (currentIndex < episodes.length - 1) {
                      setSelectedEpisode(episodes[currentIndex + 1]);
                    }
                  }
                }}
                disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1}
                className="flex items-center justify-center w-14 h-14 text-white rounded-lg disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#1e40af' }}
              >
                ▶
              </button>
            </div>

            {/* Message */}
            <div className="text-center py-4">
              <p className="text-white text-sm">
                <span className="italic">Pub insistante ou vidéo indisponible ?</span><br />
                <span className="font-bold">Changez de lecteur.</span>
              </p>
            </div>

            {/* Lecteur vidéo intégré - Style anime-sama exact */}
            <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: '#000' }}>
              <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-900 relative">
                {selectedEpisode && selectedEpisode.url ? (
                  <>
                    {/* Tentative d'affichage direct de la vidéo */}
                    <iframe
                      src={selectedEpisode.url}
                      className="w-full h-full"
                      allowFullScreen
                      frameBorder="0"
                      allow="autoplay; fullscreen; encrypted-media"
                      title={`${selectedAnime.title} - Episode ${selectedEpisode.episodeNumber}`}
                      style={{ 
                        border: 'none',
                        background: '#000'
                      }}
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                    
                    {/* Overlay de contrôle pour les erreurs */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center bg-black bg-opacity-75 p-4 rounded-lg max-w-sm">
                        <div className="mb-2">
                          <img 
                            src="https://cdn.statically.io/gh/Anime-Sama/IMG/img/autres/erreur_videos.jpg" 
                            alt="Erreur vidéo"
                            className="mx-auto max-w-xs opacity-0 hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <p className="text-white text-xs opacity-0 hover:opacity-100 transition-opacity">
                          Si la vidéo ne se charge pas, essayez un autre lecteur
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="mb-4">
                        <img 
                          src="https://cdn.statically.io/gh/Anime-Sama/IMG/img/autres/erreur_videos.jpg" 
                          alt="Erreur vidéo"
                          className="mx-auto max-w-xs"
                        />
                      </div>
                      <p className="text-white text-sm">
                        Sélectionnez un épisode pour commencer la lecture
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Informations de l'épisode en cours */}
              {selectedEpisode && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div className="text-white text-sm">
                    <p className="font-medium">{selectedAnime.title}</p>
                    <p className="text-gray-300">Episode {selectedEpisode.episodeNumber} • {selectedLanguage} • Serveur {selectedServer.toUpperCase()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white text-sm">Chargement...</p>
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

export default AnimeSamaSimplePage;