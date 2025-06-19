import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Download } from 'lucide-react';
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

  // Détecter les langues disponibles pour une saison
  const detectAvailableLanguages = async (animeId: string, seasonNumber: number) => {
    const languages = [];
    
    // Tester VF
    try {
      const vfResponse = await fetch(`${API_BASE}/api/seasons?animeId=${animeId}&season=${seasonNumber}&language=vf`);
      const vfData = await vfResponse.json();
      if (vfData.success && vfData.data.episodes.length > 0) {
        languages.push('VF');
      }
    } catch (err) {
      console.log('VF non disponible');
    }
    
    // Tester VOSTFR
    try {
      const vostfrResponse = await fetch(`${API_BASE}/api/seasons?animeId=${animeId}&season=${seasonNumber}&language=vostfr`);
      const vostfrData = await vostfrResponse.json();
      if (vostfrData.success && vostfrData.data.episodes.length > 0) {
        languages.push('VOSTFR');
      }
    } catch (err) {
      console.log('VOSTFR non disponible');
    }
    
    return languages;
  };

  // Charger les épisodes d'une saison
  const loadSeasonEpisodes = async (season: Season) => {
    if (!selectedAnime) return;
    
    setLoading(true);
    setError(null);
    setCurrentView('player');
    
    try {
      // Détecter les langues disponibles
      const availLangs = await detectAvailableLanguages(selectedAnime.id, season.number);
      setAvailableLanguages(availLangs);
      console.log('Langues disponibles:', availLangs);
      
      // Ajuster la langue sélectionnée si nécessaire
      let languageToUse = selectedLanguage;
      if (!availLangs.includes(selectedLanguage)) {
        languageToUse = availLangs[0] as 'VF' | 'VOSTFR';
        setSelectedLanguage(languageToUse);
      }
      
      const language = languageToUse.toLowerCase();
      console.log(`Chargement épisodes ${selectedAnime.id} saison ${season.number} langue ${language}`);
      
      const response = await fetch(`${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${season.number}&language=${language}`);
      const apiResponse: ApiResponse<{
        animeId: string;
        season: number;
        language: string;
        episodes: Episode[];
        episodeCount: number;
      }> = await response.json();
      
      console.log('Réponse épisodes:', apiResponse);
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement des épisodes');
      }
      
      setEpisodes(apiResponse.data.episodes);
      setSelectedSeason(season);
      
      // Charger automatiquement le premier épisode
      if (apiResponse.data.episodes.length > 0) {
        const firstEpisode = apiResponse.data.episodes[0];
        setSelectedEpisode(firstEpisode);
        await loadEpisodeSources(firstEpisode.id);
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
      console.log('Chargement des sources pour épisode:', episodeId);
      const response = await fetch(`${API_BASE}/api/episode/${episodeId}`);
      const apiResponse: ApiResponse<EpisodeDetails> = await response.json();
      
      console.log('Réponse API sources:', apiResponse);
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement des sources');
      }
      
      setEpisodeDetails(apiResponse.data);
      setSelectedServer(0);
      console.log('Sources chargées:', apiResponse.data.sources);
    } catch (err) {
      console.error('Erreur sources:', err);
      // Créer des sources de test pour le développement
      const mockSources: EpisodeDetails = {
        id: episodeId,
        title: `Episode ${selectedEpisode?.episodeNumber || 1}`,
        animeTitle: selectedAnime?.title || '',
        episodeNumber: selectedEpisode?.episodeNumber || 1,
        sources: [
          {
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            server: 'Vidmoly',
            quality: 'HD',
            language: selectedLanguage,
            type: 'iframe',
            serverIndex: 1
          },
          {
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            server: 'SendVid',
            quality: 'HD',
            language: selectedLanguage,
            type: 'iframe',
            serverIndex: 2
          },
          {
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            server: 'Sibnet',
            quality: 'HD',
            language: selectedLanguage,
            type: 'iframe',
            serverIndex: 3
          }
        ],
        availableServers: ['Vidmoly', 'SendVid', 'Sibnet'],
        url: ''
      };
      setEpisodeDetails(mockSources);
      setSelectedServer(0);
      setError('Utilisation des sources de test - Vérifiez votre API.');
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

  // Les sources viennent directement de l'API avec la bonne langue
  const currentSources = episodeDetails?.sources || [];
  const currentSource = currentSources[selectedServer];

  console.log('Sources chargées:', currentSources);
  console.log('Source actuelle:', currentSource);
  console.log('Serveur sélectionné:', selectedServer);

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
                    src={anime.image}
                    alt={anime.title}
                    className="w-full aspect-[3/4] object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=Image+Non+Disponible';
                    }}
                  />
                  <div className="p-3">
                    <h3 className="text-white font-medium text-sm line-clamp-2">{anime.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{anime.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchQuery && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-white text-2xl font-bold mb-2">Recherchez votre anime</h2>
              <p className="text-gray-400">Tapez le nom de l'anime que vous souhaitez regarder</p>
            </div>
          )}
        </div>
      )}

      {/* Page détails anime - APERÇU */}
      {currentView === 'anime' && selectedAnime && (
        <div className="p-0">
          {/* Image principale */}
          <div className="relative">
            <img
              src={selectedAnime.image}
              alt={selectedAnime.title}
              className="w-full h-64 object-cover"
            />
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)' }}
            />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-white text-2xl font-bold mb-2">{selectedAnime.title}</h1>
              <div className="text-sm space-y-1">
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
              {selectedAnime.seasons.map((season) => (
                <button
                  key={season.number}
                  onClick={() => loadSeasonEpisodes(season)}
                  className="relative overflow-hidden rounded-lg border-2 transition-all"
                  style={{ 
                    aspectRatio: '16/9',
                    borderColor: selectedSeason?.number === season.number ? '#3b82f6' : '#1e40af',
                    backgroundColor: '#1e40af'
                  }}
                >
                  <img
                    src={selectedAnime.image}
                    alt={season.name}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%)' }}
                  />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-white text-sm font-bold text-left">{season.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page lecteur - Interface exacte anime-sama */}
      {currentView === 'player' && selectedAnime && selectedSeason && (
        <div className="p-0">
          {/* Image avec titre superposé */}
          <div className="relative">
            <img
              src={selectedAnime.image}
              alt={selectedAnime.title}
              className="w-full h-48 object-cover"
            />
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%)' }}
            />
            <div className="absolute bottom-4 left-4">
              <h1 className="text-white text-2xl font-bold">{selectedAnime.title}</h1>
              <h2 className="text-gray-300 text-lg uppercase tracking-wider">{selectedSeason.name}</h2>
            </div>
          </div>

          {/* Interface de contrôle */}
          <div className="p-4 space-y-4">
            {/* Drapeaux VF/VOSTFR basés sur les langues disponibles */}
            <div className="flex gap-2">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang as 'VF' | 'VOSTFR')}
                  className="flex items-center justify-center w-12 h-10 rounded border-2"
                  style={{
                    backgroundColor: selectedLanguage === lang ? 
                      (lang === 'VF' ? '#1e40af' : '#dc2626') : '#374151',
                    borderColor: selectedLanguage === lang ? '#ffffff' : '#6b7280'
                  }}
                >
                  <span className="text-white font-bold text-xs">
                    {lang === 'VF' ? '🇫🇷' : '🇯🇵'}
                  </span>
                </button>
              ))}
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              <select
                onChange={(e) => {
                  const episode = episodes.find(ep => ep.id === e.target.value);
                  if (episode) {
                    setSelectedEpisode(episode);
                    loadEpisodeSources(episode.id);
                  }
                }}
                className="w-full p-3 text-white rounded text-sm font-medium"
                style={{ backgroundColor: '#1e40af', border: '1px solid #3b82f6' }}
                defaultValue=""
              >
                <option value="" disabled>EPISODE 1</option>
                {episodes.map((episode) => (
                  <option key={episode.id} value={episode.id}>
                    EPISODE {episode.episodeNumber}
                  </option>
                ))}
              </select>

              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(Number(e.target.value))}
                className="w-full p-3 text-white rounded text-sm font-medium"
                style={{ backgroundColor: '#1e40af', border: '1px solid #3b82f6' }}
              >
                {currentSources.length > 0 ? (
                  currentSources.map((source, index) => (
                    <option key={index} value={index}>
                      LECTEUR {index + 1} - {source.server}
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

            {/* Message d'information sur la langue */}
            {currentSources.length > 0 && episodeDetails && (
              <div className="text-center">
                {episodeDetails.sources.every(s => s.language.toUpperCase() !== selectedLanguage) ? (
                  <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-2">
                    <p className="text-yellow-200 text-xs">
                      Aucune source {selectedLanguage} disponible. Affichage des sources {episodeDetails.sources[0]?.language || 'disponibles'}.
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Boutons navigation */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigateEpisode('prev')}
                disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
                className="flex items-center justify-center w-14 h-14 text-white rounded-lg disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#1e40af' }}
              >
                ◀
              </button>
              
              <button
                onClick={() => {
                  if (selectedEpisode) {
                    loadEpisodeSources(selectedEpisode.id);
                  }
                }}
                className="flex items-center justify-center w-14 h-14 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#374151' }}
              >
                <Download size={20} />
              </button>
              
              <button
                onClick={() => navigateEpisode('next')}
                disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1}
                className="flex items-center justify-center w-14 h-14 text-white rounded-lg disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#1e40af' }}
              >
                ▶
              </button>
            </div>

            {/* Message exact */}
            <div className="text-center py-4">
              <p className="text-white text-sm">
                <span className="italic">Pub insistante ou vidéo indisponible ?</span><br />
                <span className="font-bold">Changez de lecteur.</span>
              </p>
            </div>

            {/* Lecteur vidéo */}
            {currentSource && (
              <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: '#000' }}>
                <iframe
                  src={currentSource.url}
                  className="w-full h-64 md:h-80 lg:h-96"
                  allowFullScreen
                  frameBorder="0"
                  title={`${episodeDetails?.title} - ${currentSource.server}`}
                />

              </div>
            )}
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

export default AnimeSamaPage;