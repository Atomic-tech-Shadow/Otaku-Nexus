import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import '../styles/anime-sama.css';

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
  progressInfo?: {
    advancement: string;
    correspondence: string;
    totalEpisodes?: number;
    hasFilms?: boolean;
    hasScans?: boolean;
  };
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
  embedUrl?: string;
  corsInfo?: {
    note: string;
    proxyEndpoint: string;
    embedEndpoint: string;
  };
  availableServers: string[];
  url: string;
}

interface VideoSource {
  url: string;
  proxyUrl?: string;
  embedUrl?: string;
  server: string;
  serverName?: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
  isEmbed?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: any;
}

const AnimeSamaPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'search' | 'anime' | 'player'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
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
  
  // Variables pour gestion des états et race conditions
  const [languageChangeInProgress, setLanguageChangeInProgress] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessfulLanguage, setLastSuccessfulLanguage] = useState('VOSTFR');
  const [lastEpisodeId, setLastEpisodeId] = useState('');
  const [videoSrc, setVideoSrc] = useState('');
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  
  // Configuration API - CORRECTION MAJEURE
  // URL de l'API déployée sur Render
  const API_BASE_URL = 'https://api-anime-sama.onrender.com';
  
  // Configuration robuste
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const REQUEST_TIMEOUT = 15000; // 15 secondes
  
  // États séparés par langue pour éviter les conflits
  const [episodesByLanguage, setEpisodesByLanguage] = useState<{
    VF: {[key: string]: Episode[]};
    VOSTFR: {[key: string]: Episode[]};
  }>({
    VF: {},
    VOSTFR: {}
  });
  
  const [currentVideoByLanguage, setCurrentVideoByLanguage] = useState<{
    VF: {episode: Episode | null, videoSrc: string} | null;
    VOSTFR: {episode: Episode | null, videoSrc: string} | null;
  }>({
    VF: null,
    VOSTFR: null
  });

  // Hook pour débounce les changements
  const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };

  // Cache robuste avec nettoyage par langue
  const cache = new Map();
  
  const getCachedData = async (key: string, fetcher: () => Promise<any>, ttl = 300000) => {
    if (cache.has(key)) {
      const { data, timestamp } = cache.get(key);
      if (Date.now() - timestamp < ttl) {
        return data;
      }
    }
    
    const data = await fetcher();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  };
  
  // CORRECTION CRITIQUE: Nettoyage cache par langue
  const clearLanguageCache = (language: string) => {
    console.log(`Nettoyage cache pour langue: ${language}`);
    
    // Vider cache Map
    for (const [key] of cache.entries()) {
      if (key.includes(language.toLowerCase()) || key.includes('episode') || key.includes('anime')) {
        cache.delete(key);
      }
    }
    
    // Vider localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('episode') || key.includes('anime') || key.includes(language.toLowerCase())) {
        localStorage.removeItem(key);
      }
    });
  };

  // Client HTTP robuste avec gestion d'erreurs
  const createApiClient = () => {
    const baseHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    return {
      async get(endpoint: string, params: Record<string, string> = {}): Promise<any> {
        const url = new URL(`${API_BASE_URL}${endpoint}`);
        
        // Ajout des paramètres + timestamp anti-cache
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
        url.searchParams.append('_t', Date.now().toString());
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        
        try {
          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: baseHeaders,
            cache: 'no-store',
            mode: 'cors',
            credentials: 'omit',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          return data;
          
        } catch (error: any) {
          clearTimeout(timeoutId);
          throw error;
        }
      }
    };
  };

  const apiClient = createApiClient();

  // CORRECTION CRITIQUE: Construction ID épisode avec langue
  const buildEpisodeIdWithLanguage = (animeId: string, episodeNumber: number, language: string, season: number | null = null) => {
    const langCode = language.toLowerCase(); // 'vf' ou 'vostfr'
    
    // Format standardisé selon la documentation de l'API
    if (season && season > 1) {
      return `${animeId}-saison${season}-episode-${episodeNumber}-${langCode}`;
    }
    return `${animeId}-episode-${episodeNumber}-${langCode}`;
  };

  // Charger l'historique au démarrage
  useEffect(() => {
    const savedHistory = localStorage.getItem('animeWatchHistory');
    if (savedHistory) {
      setWatchHistory(JSON.parse(savedHistory));
    }
    
    // Charger les animes populaires au démarrage
    loadPopularAnimes();
    
    // Gestionnaire global pour les promesses non capturées
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorReason = event.reason;
      
      console.warn('Unhandled promise rejection caught:', {
        reason: errorReason?.message || errorReason,
        stack: errorReason?.stack
      });
      
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Chargement des animes populaires avec API déployée - CORRECTION
  const loadPopularAnimes = async () => {
    try {
      const data = await apiClient.get('/api/trending');
      
      if (data.success && data.data && Array.isArray(data.data)) {
        const trendingAnimes = data.data.slice(0, 12);
        setPopularAnimes(trendingAnimes);
      } else {
        setPopularAnimes([]);
      }
      
    } catch (error: any) {
      console.log('Erreur chargement trending:', error);
      setPopularAnimes([]);
    }
  };

  // Recherche d'animes - CORRECTION
  const searchAnimes = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get('/api/search', { query });
      
      if (data.success && data.data) {
        setSearchResults(data.data);
      } else {
        throw new Error('Aucun résultat trouvé');
      }
      
    } catch (err: any) {
      console.error('Erreur recherche:', err);
      setError('Impossible de rechercher les animes');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement détails anime - CORRECTION
  const loadAnimeDetails = async (animeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get(`/api/anime/${animeId}`);
      
      if (data.success && data.data) {
        const animeData = data.data;
        
        // Convertir la structure de l'API en format interface
        const animeDetails: AnimeDetails = {
          id: animeData.id,
          title: animeData.title,
          description: animeData.description || '',
          image: animeData.image,
          genres: animeData.genres || [],
          status: animeData.status,
          year: animeData.year || '',
          url: animeData.url,
          progressInfo: animeData.progressInfo,
          seasons: animeData.seasons || []
        };
        
        setSelectedAnime(animeDetails);
        
        // Si il y a des saisons, charger la première
        if (animeDetails.seasons && animeDetails.seasons.length > 0) {
          const firstSeason = animeDetails.seasons[0];
          setSelectedSeason(firstSeason);
          await loadEpisodesForSeason(animeId, firstSeason);
        }
        
        setCurrentView('anime');
      } else {
        throw new Error('Anime non trouvé');
      }
      
    } catch (err: any) {
      console.error('Erreur chargement anime:', err);
      setError('Impossible de charger les détails de cet anime');
    } finally {
      setLoading(false);
    }
  };

  // CORRECTION MAJEURE: Chargement épisodes pour une saison
  const loadEpisodesForSeason = async (animeId: string, season: Season) => {
    try {
      // L'API n'a pas d'endpoint /api/seasons, on utilise les détails de l'anime
      // et on génère les épisodes basés sur episodeCount
      const episodeList: Episode[] = [];
      
      for (let i = 1; i <= season.episodeCount; i++) {
        const episodeId = buildEpisodeIdWithLanguage(animeId, i, selectedLanguage, season.number);
        
        episodeList.push({
          id: episodeId,
          title: `Episode ${i}`,
          episodeNumber: i,
          url: `${API_BASE_URL}/api/episode/${episodeId}`,
          language: selectedLanguage,
          available: true
        });
      }
      
      setEpisodes(episodeList);
      
      // Charger le premier épisode par défaut
      if (episodeList.length > 0) {
        const firstEpisode = episodeList[0];
        setSelectedEpisode(firstEpisode);
        await loadEpisodeDetails(firstEpisode.id);
      }
      
    } catch (error: any) {
      console.error('Erreur chargement épisodes:', error);
      setError('Impossible de charger les épisodes');
    }
  };

  // Chargement détails épisode - CORRECTION
  const loadEpisodeDetails = async (episodeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get(`/api/episode/${episodeId}`);
      
      if (data.success && data.data) {
        setEpisodeDetails(data.data);
        
        // Charger la première source vidéo
        if (data.data.sources && data.data.sources.length > 0) {
          setSelectedServer(0);
          updateVideoPlayer(data.data);
        }
        
        setCurrentView('player');
      } else {
        throw new Error('Episode non trouvé');
      }
      
    } catch (err: any) {
      console.error('Erreur chargement épisode:', err);
      setError('Impossible de charger cet épisode');
    } finally {
      setLoading(false);
    }
  };

  // CORRECTION: Mise à jour lecteur vidéo avec CORS
  const updateVideoPlayer = (episodeData: EpisodeDetails) => {
    if (episodeData.sources && episodeData.sources.length > 0) {
      const source = episodeData.sources[selectedServer] || episodeData.sources[0];
      
      // Utiliser l'embedUrl si disponible, sinon proxyUrl
      const videoUrl = source.embedUrl 
        ? `${API_BASE_URL}${source.embedUrl}`
        : `${API_BASE_URL}${source.proxyUrl}`;
      
      setVideoSrc(videoUrl);
      setLastEpisodeId(episodeData.id);
      
      console.log(`Lecteur mis à jour: ${episodeData.id} -> ${videoUrl}`);
    }
  };

  // Changement de langue - CORRECTION
  const handleLanguageChange = async (newLanguage: 'VF' | 'VOSTFR') => {
    if (languageChangeInProgress || newLanguage === selectedLanguage) {
      return;
    }

    console.log(`Changement langue: ${selectedLanguage} -> ${newLanguage}`);
    
    setLanguageChangeInProgress(true);
    setLoading(true);
    
    try {
      // Sauvegarder l'état actuel
      if (currentEpisode && videoSrc) {
        setCurrentVideoByLanguage(prev => ({
          ...prev,
          [selectedLanguage]: {
            episode: currentEpisode,
            videoSrc: videoSrc
          }
        }));
      }

      // Vider le cache
      clearLanguageCache(selectedLanguage);
      
      // Réinitialiser l'état
      setCurrentEpisode(null);
      setVideoSrc('');
      setEpisodes([]);
      setEpisodeDetails(null);
      setSelectedEpisode(null);
      
      // Attendre un délai pour éviter les race conditions
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mettre à jour la langue
      setSelectedLanguage(newLanguage);
      setLastSuccessfulLanguage(newLanguage);
      
      // Recharger les épisodes avec la nouvelle langue
      if (selectedAnime && selectedSeason) {
        await loadEpisodesForSeason(selectedAnime.id, selectedSeason);
      }
      
    } catch (error) {
      console.error('Erreur changement langue:', error);
      setSelectedLanguage(lastSuccessfulLanguage);
      setError(`Erreur changement langue: ${error}`);
    } finally {
      setLanguageChangeInProgress(false);
      setLoading(false);
    }
  };

  // Sélection d'épisode
  const selectEpisode = async (episode: Episode) => {
    if (selectedEpisode?.id === episode.id) return;
    
    setSelectedEpisode(episode);
    setCurrentEpisode(episode);
    await loadEpisodeDetails(episode.id);
  };

  // Changement de serveur
  const changeServer = (serverIndex: number) => {
    if (episodeDetails && episodeDetails.sources[serverIndex]) {
      setSelectedServer(serverIndex);
      updateVideoPlayer(episodeDetails);
    }
  };

  // Interface utilisateur
  return (
    <MainLayout>
      <div className="anime-sama-container">
        {/* Vue recherche */}
        {currentView === 'search' && (
          <div className="search-view">
            <div className="search-header">
              <h1>Anime-Sama Streaming</h1>
              <div className="search-box">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher un anime..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchAnimes(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Animes populaires */}
            {popularAnimes.length > 0 && searchQuery === '' && (
              <div className="popular-section">
                <h2>Animes Populaires</h2>
                <div className="anime-grid">
                  {popularAnimes.map((anime) => (
                    <div
                      key={anime.id}
                      className="anime-card"
                      onClick={() => loadAnimeDetails(anime.id)}
                    >
                      <img src={anime.image} alt={anime.title} />
                      <div className="anime-info">
                        <h3>{anime.title}</h3>
                        <span className="status">{anime.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Résultats de recherche */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <h2>Résultats de recherche</h2>
                <div className="anime-grid">
                  {searchResults.map((anime) => (
                    <div
                      key={anime.id}
                      className="anime-card"
                      onClick={() => loadAnimeDetails(anime.id)}
                    >
                      <img src={anime.image} alt={anime.title} />
                      <div className="anime-info">
                        <h3>{anime.title}</h3>
                        <span className="status">{anime.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && <div className="loading">Chargement...</div>}
            {error && <div className="error">{error}</div>}
          </div>
        )}

        {/* Vue détails anime */}
        {currentView === 'anime' && selectedAnime && (
          <div className="anime-view">
            <div className="anime-header">
              <button onClick={() => setCurrentView('search')} className="back-btn">
                <ArrowLeft /> Retour
              </button>
              <h1>{selectedAnime.title}</h1>
            </div>

            <div className="anime-details">
              <img src={selectedAnime.image} alt={selectedAnime.title} />
              <div className="anime-info">
                <p>{selectedAnime.description}</p>
                <div className="genres">
                  {selectedAnime.genres.map((genre, index) => (
                    <span key={index} className="genre">{genre}</span>
                  ))}
                </div>
                <p>Status: {selectedAnime.status}</p>
                {selectedAnime.year && <p>Année: {selectedAnime.year}</p>}
              </div>
            </div>

            {/* Sélection langue */}
            <div className="language-selector">
              <button
                className={selectedLanguage === 'VOSTFR' ? 'active' : ''}
                onClick={() => handleLanguageChange('VOSTFR')}
                disabled={languageChangeInProgress}
              >
                VOSTFR
              </button>
              <button
                className={selectedLanguage === 'VF' ? 'active' : ''}
                onClick={() => handleLanguageChange('VF')}
                disabled={languageChangeInProgress}
              >
                VF
              </button>
            </div>

            {/* Liste des épisodes */}
            {episodes.length > 0 && (
              <div className="episodes-list">
                <h3>Épisodes ({selectedLanguage})</h3>
                <div className="episodes-grid">
                  {episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className={`episode-card ${selectedEpisode?.id === episode.id ? 'selected' : ''}`}
                      onClick={() => selectEpisode(episode)}
                    >
                      <span>Épisode {episode.episodeNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && <div className="loading">Chargement...</div>}
            {error && <div className="error">{error}</div>}
          </div>
        )}

        {/* Vue lecteur */}
        {currentView === 'player' && selectedEpisode && episodeDetails && (
          <div className="player-view">
            <div className="player-header">
              <button onClick={() => setCurrentView('anime')} className="back-btn">
                <ArrowLeft /> Retour aux épisodes
              </button>
              <h2>{episodeDetails.animeTitle} - Épisode {episodeDetails.episodeNumber}</h2>
            </div>

            {/* Lecteur vidéo */}
            <div className="video-player" id="video-player">
              {videoSrc && (
                <iframe
                  src={videoSrc}
                  width="100%"
                  height="500px"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                />
              )}
            </div>

            {/* Sélection serveur */}
            {episodeDetails.sources && episodeDetails.sources.length > 1 && (
              <div className="server-selector">
                <h3>Serveurs disponibles:</h3>
                {episodeDetails.sources.map((source, index) => (
                  <button
                    key={index}
                    className={selectedServer === index ? 'active' : ''}
                    onClick={() => changeServer(index)}
                  >
                    {source.serverName || source.server} ({source.quality})
                  </button>
                ))}
              </div>
            )}

            {loading && <div className="loading">Chargement...</div>}
            {error && <div className="error">{error}</div>}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AnimeSamaPage;