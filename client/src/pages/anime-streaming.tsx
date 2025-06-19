import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
}

interface AnimeDetails {
  id: string;
  title: string;
  description: string;
  image: string;
  genres: string[];
  status: string;
  year: string;
  seasons: Season[];
  url: string;
}

interface Season {
  number: number;
  name: string;
  languages: string[];
  episodeCount: number;
  url: string;
}

interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
}

interface EpisodeDetails {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  sources: VideoSource[];
  availableServers: string[];
  url: string;
}

interface VideoSource {
  url: string;
  server: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: any;
}

const AnimeStreamingPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'search' | 'anime' | 'player'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>('VOSTFR');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [selectedServer, setSelectedServer] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'https://api-anime-sama.onrender.com';

  // Recherche d'animes
  const searchAnimes = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}`);
      const apiResponse: ApiResponse<SearchResult[]> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors de la recherche');
      }
      
      setSearchResults(apiResponse.data);
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
      const response = await fetch(`${API_BASE}/api/anime/${animeId}`);
      const apiResponse: ApiResponse<AnimeDetails> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement de l\'anime');
      }
      
      setSelectedAnime(apiResponse.data);
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

  // Charger les épisodes d'une saison
  const loadSeasonEpisodes = async (season: Season) => {
    if (!selectedAnime) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const language = selectedLanguage.toLowerCase();
      const response = await fetch(`${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${season.number}&language=${language}`);
      const apiResponse: ApiResponse<{
        animeId: string;
        season: number;
        language: string;
        episodes: Episode[];
        episodeCount: number;
      }> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement des épisodes');
      }
      
      setEpisodes(apiResponse.data.episodes);
      setSelectedSeason(season);
      setSelectedEpisode(null);
      setEpisodeDetails(null);
    } catch (err) {
      console.error('Erreur épisodes:', err);
      setError('Impossible de charger les épisodes.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les sources d'un épisode
  const loadEpisodeSources = async (episode: Episode) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/episode/${episode.id}`);
      const apiResponse: ApiResponse<EpisodeDetails> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement des sources');
      }
      
      setEpisodeDetails(apiResponse.data);
      setSelectedEpisode(episode);
      setSelectedServer(0);
      setCurrentView('player');
    } catch (err) {
      console.error('Erreur sources:', err);
      setError('Impossible de charger les sources vidéo.');
    } finally {
      setLoading(false);
    }
  };

  // Navigation entre épisodes
  const navigateEpisode = (direction: 'prev' | 'next') => {
    if (!selectedEpisode || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(ep => ep.id === selectedEpisode.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < episodes.length) {
      loadEpisodeSources(episodes[newIndex]);
    }
  };

  // Changer de langue
  const changeLanguage = (newLanguage: 'VF' | 'VOSTFR') => {
    setSelectedLanguage(newLanguage);
    if (selectedSeason) {
      loadSeasonEpisodes(selectedSeason);
    }
  };

  // Effet de recherche avec délai
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAnimes(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Obtenir les sources filtrées par langue
  const getFilteredSources = () => {
    if (!episodeDetails) return [];
    return episodeDetails.sources.filter(source => 
      source.language.toUpperCase() === selectedLanguage
    );
  };

  const filteredSources = getFilteredSources();
  const currentSource = filteredSources[selectedServer];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header fixe */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center p-3">
          {currentView !== 'search' ? (
            <button
              onClick={() => {
                if (currentView === 'player') {
                  setCurrentView('anime');
                } else if (currentView === 'anime') {
                  setCurrentView('search');
                  setSelectedAnime(null);
                  setSelectedSeason(null);
                  setEpisodes([]);
                }
              }}
              className="mr-3 p-2 rounded bg-gray-900 hover:bg-gray-800"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <Link href="/" className="mr-3">
              <button className="p-2 rounded bg-gray-900 hover:bg-gray-800">
                <ArrowLeft size={18} />
              </button>
            </Link>
          )}
          <h1 className="text-lg font-bold text-blue-400">Anime-Sama</h1>
        </div>
      </div>

      {/* Page de recherche */}
      {currentView === 'search' && (
        <div className="p-4">
          {/* Barre de recherche */}
          <div className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un anime..."
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-3 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => loadAnimeDetails(anime.id)}
                  className="bg-gray-900 rounded cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-52 md:h-64 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=Image+Non+Disponible';
                    }}
                  />
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2">{anime.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{anime.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* État initial */}
          {!searchQuery && (
            <div className="text-center py-16">
              <Search className="mx-auto mb-4 text-gray-600" size={48} />
              <h2 className="text-xl font-semibold mb-2">Recherchez votre anime</h2>
              <p className="text-gray-400">Tapez le nom de l'anime que vous souhaitez regarder</p>
            </div>
          )}
        </div>
      )}

      {/* Page détails anime */}
      {currentView === 'anime' && selectedAnime && (
        <div className="p-4">
          {/* Image et infos anime */}
          <div className="mb-6">
            <img
              src={selectedAnime.image}
              alt={selectedAnime.title}
              className="w-full h-52 md:h-64 object-cover rounded mb-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Image+Non+Disponible';
              }}
            />
            <h1 className="text-2xl font-bold mb-3 text-white">{selectedAnime.title}</h1>
            
            {/* Informations d'avancement */}
            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <span className="text-white font-medium">Avancement :</span>
                <span className="text-gray-400 ml-2">Aucune donnée.</span>
              </div>
              <div className="text-sm">
                <span className="text-white font-medium">Correspondance :</span>
                <span className="text-gray-400 ml-2">Episode 1122 → Chapitre 1088</span>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm">
                <span>⭐</span> Favoris
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm">
                <span>👁</span> Watchlist
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm">
                <span>✓</span> Vu
              </button>
            </div>
          </div>

          {/* Section ANIME avec sagas */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4 text-white">ANIME</h2>
            <div className="grid grid-cols-2 gap-3">
              {selectedAnime.seasons.map((season) => (
                <button
                  key={season.number}
                  onClick={() => loadSeasonEpisodes(season)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                    selectedSeason?.number === season.number
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-blue-700 bg-blue-900/20 hover:border-blue-600'
                  }`}
                  style={{ aspectRatio: '16/9' }}
                >
                  <img
                    src={selectedAnime.image}
                    alt={season.name}
                    className="w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-white text-sm font-bold text-left">{season.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interface de lecture style anime-sama */}
          {selectedSeason && (
            <div className="space-y-6">
              {/* Titre saison */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedAnime.title}</h2>
                <h3 className="text-lg text-gray-400 uppercase tracking-wider">{selectedSeason.name}</h3>
              </div>

              {/* Drapeaux VF/VOSTFR */}
              {selectedSeason.languages.length > 1 && (
                <div className="flex justify-center gap-4">
                  {selectedSeason.languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => changeLanguage(lang as 'VF' | 'VOSTFR')}
                      className={`flex items-center justify-center w-12 h-8 rounded border-2 text-xs font-bold ${
                        selectedLanguage === lang
                          ? 'bg-white text-black border-white'
                          : 'bg-gray-800 text-white border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {lang === 'VF' ? '🇫🇷' : '🇯🇵'} {lang}
                    </button>
                  ))}
                </div>
              )}

              {/* Sélecteurs épisode et lecteur */}
              {episodes.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sélecteur épisode */}
                    <div>
                      <select
                        onChange={(e) => {
                          const episode = episodes.find(ep => ep.id === e.target.value);
                          if (episode) {
                            loadEpisodeSources(episode);
                          }
                        }}
                        className="w-full p-3 bg-blue-900 text-white rounded border border-blue-700 text-center font-medium"
                        defaultValue=""
                      >
                        <option value="" disabled>EPISODE 1</option>
                        {episodes.map((episode) => (
                          <option key={episode.id} value={episode.id}>
                            EPISODE {episode.episodeNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sélecteur lecteur */}
                    <div>
                      <select
                        value={selectedServer}
                        onChange={(e) => setSelectedServer(Number(e.target.value))}
                        className="w-full p-3 bg-blue-900 text-white rounded border border-blue-700 text-center font-medium"
                      >
                        {filteredSources.map((source, index) => (
                          <option key={index} value={index}>
                            LECTEUR {index + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dernière sélection */}
                  {selectedEpisode && (
                    <div className="text-center text-gray-400 text-sm">
                      DERNIÈRE SÉLECTION : <span className="text-white">EPISODE {selectedEpisode.episodeNumber}</span>
                    </div>
                  )}

                  {/* Navigation épisodes */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => navigateEpisode('prev')}
                      disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
                      className="flex items-center justify-center w-12 h-12 bg-blue-800 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (selectedEpisode) {
                          loadEpisodeSources(selectedEpisode);
                        }
                      }}
                      className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded-full hover:bg-gray-700"
                    >
                      <RotateCcw size={20} />
                    </button>
                    
                    <button
                      onClick={() => navigateEpisode('next')}
                      disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1}
                      className="flex items-center justify-center w-12 h-12 bg-blue-800 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Message changement de lecteur */}
                  <div className="text-center">
                    <p className="text-white text-sm italic">
                      Pub insistante ou vidéo indisponible ?<br />
                      <span className="font-bold">Changez de lecteur.</span>
                    </p>
                  </div>

                  {/* Lecteur vidéo */}
                  {currentSource && (
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                      <iframe
                        src={currentSource.url}
                        className="w-full h-64 md:h-96 lg:h-[480px]"
                        allowFullScreen
                        frameBorder="0"
                        title={`${episodeDetails?.title} - ${currentSource.server}`}
                      />
                      {/* Overlay de loading/play */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}



      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-white text-sm">Chargement...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-600 text-white p-3 rounded z-50">
          <p className="text-sm">{error}</p>
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

export default AnimeStreamingPage;