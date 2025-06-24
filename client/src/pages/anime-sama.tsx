import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Download, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
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
}

const AnimeSamaPage: React.FC = () => {
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

  // Recherche d'animes
  const searchAnimes = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/anime-sama/search?q=${encodeURIComponent(query)}`);
      const result: ApiResponse<SearchResult[]> = await response.json();
      
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setError('Recherche échouée');
        setSearchResults([]);
      }
    } catch (error) {
      setError('Erreur de recherche');
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
      const response = await fetch(`/api/anime-sama/anime/${animeId}`);
      const result: ApiResponse<AnimeDetails> = await response.json();
      
      if (result.success) {
        setSelectedAnime(result.data);
        setCurrentView('anime');
        
        // Charger la première saison
        if (result.data.seasons && result.data.seasons.length > 0) {
          const firstSeason = result.data.seasons[0];
          setSelectedSeason(firstSeason);
          await loadSeasonEpisodes(firstSeason);
        }
      } else {
        setError('Anime non trouvé');
      }
    } catch (error) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Charger les épisodes d'une saison
  const loadSeasonEpisodes = async (season: Season) => {
    if (!selectedAnime) return;
    
    setLoading(true);
    try {
      const language = selectedLanguage.toLowerCase() as 'vf' | 'vostfr';
      const response = await fetch(`/api/anime-sama/seasons?animeId=${selectedAnime.id}&season=${season.number}&language=${language}`);
      const result: ApiResponse<{ episodes: Episode[] }> = await response.json();
      
      if (result.success) {
        setEpisodes(result.data.episodes);
      } else {
        setError('Épisodes non disponibles');
      }
    } catch (error) {
      setError('Erreur de chargement des épisodes');
    } finally {
      setLoading(false);
    }
  };

  // Charger les sources d'un épisode
  const loadEpisodeSources = async (episodeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/anime-sama/episode/${episodeId}`);
      const result: ApiResponse<EpisodeDetails> = await response.json();
      
      if (result.success && result.data) {
        setEpisodeDetails(result.data);
        setSelectedServer(0);
        setCurrentView('player');
      } else {
        setError('Sources vidéo non disponibles');
      }
    } catch (error) {
      setError('Erreur de chargement des sources');
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner un épisode
  const selectEpisode = async (episode: Episode) => {
    setSelectedEpisode(episode);
    await loadEpisodeSources(episode.id);
  };

  // Changer de langue
  const changeLanguage = async (newLanguage: 'VF' | 'VOSTFR') => {
    setSelectedLanguage(newLanguage);
    if (selectedSeason) {
      await loadSeasonEpisodes(selectedSeason);
    }
  };

  return (
    <MainLayout>
      <div className="anime-sama-container">
        {/* Vue Recherche */}
        {currentView === 'search' && (
          <div className="search-view">
            <div className="search-header">
              <h1>Anime-Sama</h1>
              <div className="search-bar">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher un anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAnimes(searchQuery)}
                />
                <button onClick={() => searchAnimes(searchQuery)} disabled={loading}>
                  Rechercher
                </button>
              </div>
            </div>

            {loading && <div className="loading">Recherche en cours...</div>}
            {error && <div className="error">{error}</div>}

            <div className="search-results">
              {searchResults.map((anime) => (
                <div key={anime.id} className="anime-card" onClick={() => loadAnimeDetails(anime.id)}>
                  <img src={anime.image} alt={anime.title} />
                  <div className="anime-info">
                    <h3>{anime.title}</h3>
                    <p>{anime.type} - {anime.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vue Anime */}
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
                  {selectedAnime.genres?.map((genre, index) => (
                    <span key={index} className="genre">{genre}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sélecteur de langue */}
            <div className="language-selector">
              <button 
                className={selectedLanguage === 'VF' ? 'active' : ''}
                onClick={() => changeLanguage('VF')}
              >
                VF
              </button>
              <button 
                className={selectedLanguage === 'VOSTFR' ? 'active' : ''}
                onClick={() => changeLanguage('VOSTFR')}
              >
                VOSTFR
              </button>
            </div>

            {/* Liste des épisodes */}
            <div className="episodes-list">
              <h3>Épisodes ({selectedLanguage})</h3>
              {loading && <div className="loading">Chargement des épisodes...</div>}
              {error && <div className="error">{error}</div>}
              <div className="episodes-grid">
                {episodes.map((episode) => (
                  <div 
                    key={episode.id} 
                    className="episode-card"
                    onClick={() => selectEpisode(episode)}
                  >
                    <span>Épisode {episode.episodeNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vue Lecteur */}
        {currentView === 'player' && episodeDetails && (
          <div className="player-view">
            <div className="player-header">
              <button onClick={() => setCurrentView('anime')} className="back-btn">
                <ArrowLeft /> Retour
              </button>
              <h2>{episodeDetails.animeTitle} - Épisode {episodeDetails.episodeNumber}</h2>
            </div>

            {loading && <div className="loading">Chargement du lecteur...</div>}
            {error && <div className="error-message">{error}</div>}

            {episodeDetails.sources && episodeDetails.sources.length > 0 && (
              <div className="video-player">
                {/* Sélecteur de serveur */}
                <div className="server-selector">
                  {episodeDetails.sources.map((source, index) => (
                    <button
                      key={index}
                      className={selectedServer === index ? 'active' : ''}
                      onClick={() => setSelectedServer(index)}
                    >
                      {source.server} ({source.quality})
                    </button>
                  ))}
                </div>

                {/* Lecteur vidéo iframe */}
                <div className="video-container">
                  <iframe
                    src={`/api/embed/${episodeDetails.id}`}
                    allowFullScreen
                    frameBorder="0"
                    width="100%"
                    height="500px"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AnimeSamaPage;