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
  const [trendingAnimes, setTrendingAnimes] = useState<SearchResult[]>([]);
  const [catalogueAnimes, setCatalogueAnimes] = useState<SearchResult[]>([]);
  const [randomAnime, setRandomAnime] = useState<SearchResult | null>(null);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>('VOSTFR');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [selectedServer, setSelectedServer] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'https://api-anime-sama.onrender.com';

  // Charger les anime populaires via l'API trending
  const loadTrendingAnimes = async () => {
    setLoadingTrending(true);
    try {
      // Utiliser l'endpoint trending de l'API
      const response = await fetch(`${API_BASE}/api/trending`);
      const apiResponse: ApiResponse<SearchResult[]> = await response.json();
      
      if (apiResponse.success && apiResponse.data) {
        setTrendingAnimes(apiResponse.data.slice(0, 8));
      } else {
        // Fallback: charger le catalogue si trending ne fonctionne pas
        const catalogueResponse = await fetch(`${API_BASE}/api/catalogue?page=1`);
        const catalogueApiResponse: ApiResponse<SearchResult[]> = await catalogueResponse.json();
        
        if (catalogueApiResponse.success && catalogueApiResponse.data) {
          setTrendingAnimes(catalogueApiResponse.data.slice(0, 8));
        }
      }
    } catch (error) {
      console.error('Erreur chargement trending:', error);
      // Dernier recours: recherche d'anime populaires
      await loadPopularAnimesFallback();
    } finally {
      setLoadingTrending(false);
    }
  };

  // Fallback pour les anime populaires
  const loadPopularAnimesFallback = async () => {
    const popularAnimes = [
      'naruto', 'one piece', 'attack on titan', 'demon slayer', 
      'dragon ball', 'bleach', 'hunter x hunter', 'jujutsu kaisen'
    ];
    
    const trendingResults: SearchResult[] = [];
    
    for (const anime of popularAnimes.slice(0, 6)) {
      try {
        const response = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(anime)}`);
        const apiResponse: ApiResponse<SearchResult[]> = await response.json();
        
        if (apiResponse.success && apiResponse.data && apiResponse.data.length > 0) {
          trendingResults.push(apiResponse.data[0]);
        }
      } catch (error) {
        console.log(`Erreur pour ${anime}:`, error);
      }
    }
    
    setTrendingAnimes(trendingResults);
  };

  // Recherche d'animes avec amélioration
  const searchAnimes = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse: ApiResponse<SearchResult[]> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors de la recherche');
      }
      
      // S'assurer que data est un tableau
      const results = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      setSearchResults(results);
      
      if (results.length === 0) {
        console.log('Aucun résultat trouvé pour:', query);
      }
      
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError(`Erreur de recherche: ${err instanceof Error ? err.message : 'Connexion impossible'}`);
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
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Anime non trouvé`);
      }
      
      const apiResponse: ApiResponse<AnimeDetails> = await response.json();
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Données anime incomplètes');
      }
      
      console.log('Détails anime chargés:', apiResponse.data);
      setSelectedAnime(apiResponse.data);
      setCurrentView('anime');
      
      // Réinitialiser les sélections
      setSelectedSeason(null);
      setEpisodes([]);
      setSelectedEpisode(null);
      
    } catch (err) {
      console.error('Erreur détails anime:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Impossible de charger l\'anime'}`);
    } finally {
      setLoading(false);
    }
  };

  // Charger les épisodes d'une saison
  const loadSeasonEpisodes = async (season: Season) => {
    if (!selectedAnime) return;
    
    setLoading(true);
    setError(null);
    setSelectedSeason(season);
    
    try {
      const languageParam = selectedLanguage.toLowerCase();
      const response = await fetch(`${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${season.number}&language=${languageParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Saison non disponible`);
      }
      
      const apiResponse: ApiResponse<{episodes: Episode[], episodeCount: number}> = await response.json();
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Données épisodes incomplètes');
      }
      
      console.log('Épisodes chargés:', apiResponse.data);
      
      // L'API retourne un objet avec episodes et episodeCount
      const episodes = apiResponse.data.episodes || apiResponse.data;
      setEpisodes(Array.isArray(episodes) ? episodes : []);
      
    } catch (err) {
      console.error('Erreur épisodes:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Impossible de charger les épisodes'}`);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les sources d'un épisode
  const loadEpisodeSources = async (episode: Episode) => {
    setLoading(true);
    setError(null);
    setSelectedEpisode(episode);
    
    try {
      console.log('Chargement des sources pour épisode:', episode.id);
      const response = await fetch(`${API_BASE}/api/episode/${episode.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Épisode non disponible`);
      }
      
      const apiResponse: ApiResponse<EpisodeDetails> = await response.json();
      console.log('Réponse API sources:', apiResponse);
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Sources d\'épisode incomplètes');
      }
      
      const episodeData = apiResponse.data;
      console.log('Sources chargées:', episodeData.sources);
      
      // Valider que nous avons des sources
      if (!episodeData.sources || episodeData.sources.length === 0) {
        throw new Error('Aucune source disponible pour cet épisode');
      }
      
      setEpisodeDetails(episodeData);
      setSelectedServer(0);
      setCurrentView('player');
      
    } catch (err) {
      console.error('Erreur sources épisode:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Impossible de charger les sources'}`);
    } finally {
      setLoading(false);
    }
  };

  // Navigation épisodes
  const navigateEpisode = (direction: 'next' | 'prev') => {
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

  // Charger le catalogue via l'API
  const loadCatalogueAnimes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/catalogue?page=1`);
      const apiResponse: ApiResponse<SearchResult[]> = await response.json();
      
      if (apiResponse.success && apiResponse.data) {
        setCatalogueAnimes(apiResponse.data.slice(0, 12));
      }
    } catch (error) {
      console.error('Erreur chargement catalogue:', error);
    }
  };

  // Charger un anime aléatoire
  const loadRandomAnime = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/random`);
      const apiResponse: ApiResponse<SearchResult> = await response.json();
      
      if (apiResponse.success && apiResponse.data) {
        setRandomAnime(apiResponse.data);
      }
    } catch (error) {
      console.error('Erreur chargement anime aléatoire:', error);
    }
  };

  // Charger toutes les données au montage
  useEffect(() => {
    loadTrendingAnimes();
    loadCatalogueAnimes();
    loadRandomAnime();
  }, []);

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

          {/* Contenu principal (si pas de recherche) */}
          {!searchQuery && !searchResults.length && (
            <div className="space-y-8">
              {/* Anime aléatoire - Section mise en avant */}
              {randomAnime && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">🎲 Anime Aléatoire</h2>
                    <button
                      onClick={loadRandomAnime}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      Nouveau
                    </button>
                  </div>
                  
                  <div 
                    onClick={() => loadAnimeDetails(randomAnime.id)}
                    className="relative bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-700/50 cursor-pointer hover:border-blue-500 transition-all p-4"
                  >
                    <div className="flex gap-4">
                      <img
                        src={randomAnime.image}
                        alt={randomAnime.title}
                        className="w-24 h-32 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-anime.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{randomAnime.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">{randomAnime.status}</p>
                        <span className="inline-block px-2 py-1 bg-blue-600 text-xs rounded">
                          Découvrir maintenant
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Anime populaires */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">🔥 Anime Populaires</h2>
                
                {loadingTrending ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <div className="text-gray-400">Chargement des anime populaires...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {trendingAnimes.map((anime) => (
                      <div
                        key={anime.id}
                        onClick={() => loadAnimeDetails(anime.id)}
                        className="bg-gray-900 rounded cursor-pointer hover:bg-gray-800 transition-colors"
                      >
                        <img
                          src={anime.image}
                          alt={anime.title}
                          className="w-full h-48 object-cover rounded-t"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-anime.jpg';
                          }}
                        />
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-white truncate">{anime.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">{anime.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Catalogue */}
              {catalogueAnimes.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-white mb-4">📚 Catalogue</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catalogueAnimes.map((anime) => (
                      <div
                        key={anime.id}
                        onClick={() => loadAnimeDetails(anime.id)}
                        className="bg-gray-900 rounded cursor-pointer hover:bg-gray-800 transition-colors"
                      >
                        <img
                          src={anime.image}
                          alt={anime.title}
                          className="w-full h-48 object-cover rounded-t"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-anime.jpg';
                          }}
                        />
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-white truncate">{anime.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">{anime.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Résultats de recherche</h2>
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
            </div>
          )}

          {/* Message si pas de résultats */}
          {!loading && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto mb-4 text-gray-600" size={48} />
              <h3 className="text-lg font-medium text-white mb-2">Aucun résultat trouvé</h3>
              <p className="text-gray-400">
                Essayez avec un autre titre d'anime
              </p>
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
            
            {selectedAnime.description && (
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{selectedAnime.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedAnime.genres.map((genre, index) => (
                <span key={index} className="px-2 py-1 bg-blue-600 text-xs rounded">{genre}</span>
              ))}
            </div>
            
            <div className="text-sm text-gray-400 space-y-1">
              <p>Status: {selectedAnime.status}</p>
              <p>Année: {selectedAnime.year}</p>
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

          {/* Interface de lecture exacte anime-sama */}
          {selectedSeason && (
            <div className="space-y-4">
              {/* Image anime en haut */}
              <div className="relative">
                <img
                  src={selectedAnime.image}
                  alt={selectedAnime.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute bottom-4 left-4">
                  <h1 className="text-2xl font-bold text-white drop-shadow-lg">{selectedAnime.title}</h1>
                  <h2 className="text-lg text-gray-300 uppercase tracking-wider drop-shadow-lg">{selectedSeason.name}</h2>
                </div>
              </div>

              {/* Drapeaux VF/VOSTFR exactes */}
              <div className="flex gap-2">
                {selectedSeason.languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang as 'VF' | 'VOSTFR')}
                    className={`flex items-center justify-center w-12 h-10 rounded ${
                      selectedLanguage === lang
                        ? lang === 'VF' 
                          ? 'bg-blue-600 border-2 border-white'
                          : 'bg-red-600 border-2 border-white'
                        : 'bg-gray-700 border border-gray-600'
                    }`}
                  >
                    <span className="text-white font-bold text-xs">
                      {lang === 'VF' ? '🇫🇷' : '🇯🇵'}
                    </span>
                    <span className="text-white font-bold text-xs ml-1">{lang}</span>
                  </button>
                ))}
              </div>

              {/* Sélecteurs style anime-sama */}
              {episodes.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Dropdown épisode */}
                    <select
                      onChange={(e) => {
                        const episode = episodes.find(ep => ep.id === e.target.value);
                        if (episode) {
                          loadEpisodeSources(episode);
                        }
                      }}
                      className="w-full p-3 bg-blue-900 text-white rounded border border-blue-700 text-sm font-medium appearance-none"
                      defaultValue=""
                    >
                      <option value="" disabled>EPISODE 1</option>
                      {episodes.map((episode) => (
                        <option key={episode.id} value={episode.id}>
                          EPISODE {episode.episodeNumber}
                        </option>
                      ))}
                    </select>

                    {/* Dropdown lecteur */}
                    <select
                      value={selectedServer}
                      onChange={(e) => setSelectedServer(Number(e.target.value))}
                      className="w-full p-3 bg-blue-900 text-white rounded border border-blue-700 text-sm font-medium appearance-none"
                    >
                      {filteredSources.length > 0 ? (
                        filteredSources.map((source, index) => (
                          <option key={index} value={index}>
                            LECTEUR {index + 1}
                          </option>
                        ))
                      ) : (
                        <option value={0}>LECTEUR 1</option>
                      )}
                    </select>
                  </div>

                  {/* Dernière sélection */}
                  <div className="text-gray-400 text-sm">
                    DERNIÈRE SÉLECTION : <span className="text-white italic">
                      {selectedEpisode ? `EPISODE ${selectedEpisode.episodeNumber}` : 'EPISODE 1'}
                    </span>
                  </div>

                  {/* Boutons navigation */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => navigateEpisode('prev')}
                      disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
                      className="flex items-center justify-center w-14 h-14 bg-blue-800 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (selectedEpisode) {
                          loadEpisodeSources(selectedEpisode);
                        }
                      }}
                      disabled={!selectedEpisode}
                      className="flex items-center justify-center w-14 h-14 bg-blue-800 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
                    >
                      <RotateCcw size={20} />
                    </button>
                    
                    <button
                      onClick={() => navigateEpisode('next')}
                      disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1}
                      className="flex items-center justify-center w-14 h-14 bg-blue-800 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Page lecteur */}
      {currentView === 'player' && episodeDetails && currentSource && (
        <div className="p-4">
          {/* Breadcrumb navigation */}
          <nav className="mb-4 text-sm text-gray-400">
            <button 
              onClick={() => setCurrentView('search')} 
              className="hover:text-blue-400 transition-colors"
            >
              Accueil
            </button>
            <span className="mx-2">{'>'}</span>
            <button 
              onClick={() => setCurrentView('anime')} 
              className="hover:text-blue-400 transition-colors"
            >
              {episodeDetails.animeTitle}
            </button>
            <span className="mx-2">{'>'}</span>
            <span className="text-white">Episode {episodeDetails.episodeNumber}</span>
          </nav>

          {/* Titre et informations */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">{episodeDetails.animeTitle}</h1>
            <h2 className="text-lg text-blue-400">Episode {episodeDetails.episodeNumber}</h2>
            {episodeDetails.title && episodeDetails.title !== `Episode ${episodeDetails.episodeNumber}` && (
              <h3 className="text-gray-300 mt-1">{episodeDetails.title}</h3>
            )}
          </div>

          {/* Sélecteur de serveur */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Serveur de streaming:
            </label>
            <div className="flex flex-wrap gap-2">
              {filteredSources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedServer(index)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    selectedServer === index
                      ? 'bg-blue-600 text-white border-2 border-blue-400'
                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  {source.server} ({source.quality})
                </button>
              ))}
            </div>
          </div>

          {/* Lecteur vidéo */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={currentSource.url}
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
              title={`${episodeDetails.animeTitle} - Episode ${episodeDetails.episodeNumber}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          {/* Navigation épisodes */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => navigateEpisode('prev')}
              disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft size={18} />
              Episode précédent
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-400">Serveur actuel</div>
              <div className="text-white font-medium">{currentSource.server}</div>
              <div className="text-xs text-gray-500">{currentSource.quality} • {currentSource.language}</div>
            </div>

            <button
              onClick={() => navigateEpisode('next')}
              disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Episode suivant
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Informations techniques */}
          <div className="mt-4 p-3 bg-gray-900 rounded text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-400">
              <div>
                <span className="block text-white font-medium">Serveur</span>
                {currentSource.server}
              </div>
              <div>
                <span className="block text-white font-medium">Qualité</span>
                {currentSource.quality}
              </div>
              <div>
                <span className="block text-white font-medium">Langue</span>
                {currentSource.language}
              </div>
              <div>
                <span className="block text-white font-medium">Type</span>
                {currentSource.type}
              </div>
            </div>
          </div>
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