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
  
  // CORRECTION 6: Race Conditions - Variable de verrouillage
  const [languageChangeInProgress, setLanguageChangeInProgress] = useState(false);

  // CORRECTION 7: Cache et Performance - Cache simple en mémoire
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

  // Charger l'historique au démarrage
  useEffect(() => {
    const savedHistory = localStorage.getItem('animeWatchHistory');
    if (savedHistory) {
      setWatchHistory(JSON.parse(savedHistory));
    }
    // Charger les animes populaires au démarrage
    loadPopularAnimes();
  }, []);

  // CORRECTION 7: Charger les animes populaires avec cache
  const loadPopularAnimes = async () => {
    try {
      const cacheKey = 'trending_animes';
      
      // Utiliser le cache pour éviter les requêtes répétées
      const apiResponse = await getCachedData(cacheKey, async () => {
        const response = await fetch(`${API_BASE}/api/trending`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      }, 600000); // Cache pendant 10 minutes
      
      if (apiResponse.success && apiResponse.data) {
        setPopularAnimes(apiResponse.data.slice(0, 12)); // Limiter à 12 animes
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      console.error('Error loading popular animes:', err);
      setError('Impossible de charger les animes populaires');
      setPopularAnimes([]);
    }
  };

  const API_BASE = 'https://api-anime-sama.onrender.com';

  // CORRECTION 5: Fonction de retry automatique pour vidéos
  const loadVideoSourceWithRetry = (serverIndex: number, retryCount = 0) => {
    const maxRetries = 3;
    const availableSources = episodeDetails?.sources || [];
    
    if (retryCount < maxRetries) {
      console.warn(`Retry ${retryCount + 1}/${maxRetries} for server ${serverIndex + 1}`);
      setTimeout(() => {
        setSelectedServer(serverIndex); // Force reload
      }, 2000 * (retryCount + 1)); // Délai progressif
    } else if (serverIndex + 1 < availableSources.length) {
      console.log(`Switching to next server: ${serverIndex + 2}`);
      setSelectedServer(serverIndex + 1);
    } else {
      setError('Tous les serveurs vidéo ont échoué. Pub insistante ou vidéo indisponible ? Changez de lecteur.');
    }
  };

  // CORRECTION 5: Gestion d'erreurs vidéo avec fallback automatique
  const handleVideoError = (currentServerIndex: number) => {
    const sources = episodeDetails?.sources || [];
    
    if (currentServerIndex + 1 < sources.length) {
      console.log(`Video error detected, switching to server ${currentServerIndex + 2}`);
      setSelectedServer(currentServerIndex + 1);
    } else {
      setError('Aucune source vidéo disponible. Essayez un autre épisode.');
    }
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

  // Détecter les langues disponibles avec validation stricte des épisodes
  const detectAvailableLanguages = async (animeId: string, seasonNumber: number) => {
    const languages = [];
    
    console.log(`Detecting languages for anime: ${animeId}, season: ${seasonNumber}`);
    
    // Tester VOSTFR en premier
    try {
      const vostfrResponse = await fetch(`${API_BASE}/api/seasons?animeId=${animeId}&season=${seasonNumber}&language=vostfr`);
      const vostfrData = await vostfrResponse.json();
      console.log('VOSTFR test result:', vostfrData);
      
      // Validation stricte : vérifier que les épisodes existent ET ne sont pas vides
      const hasValidEpisodes = vostfrData.success && 
                              vostfrData.data && 
                              vostfrData.data.episodes && 
                              Array.isArray(vostfrData.data.episodes) && 
                              vostfrData.data.episodes.length > 0 &&
                              vostfrData.data.totalEpisodes > 0;
      
      if (hasValidEpisodes) {
        languages.push('VOSTFR');
      }
    } catch (err) {
      console.warn('VOSTFR test failed:', err);
    }
    
    // Tester VF avec la même validation stricte
    try {
      const vfResponse = await fetch(`${API_BASE}/api/seasons?animeId=${animeId}&season=${seasonNumber}&language=vf`);
      const vfData = await vfResponse.json();
      console.log('VF test result:', vfData);
      
      const hasValidEpisodes = vfData.success && 
                              vfData.data && 
                              vfData.data.episodes && 
                              Array.isArray(vfData.data.episodes) && 
                              vfData.data.episodes.length > 0 &&
                              vfData.data.totalEpisodes > 0;
      
      if (hasValidEpisodes) {
        languages.push('VF');
      }
    } catch (err) {
      console.warn('VF test failed:', err);
    }
    
    console.log('Available languages detected:', languages);
    
    // Si aucune langue trouvée, utiliser le fallback intelligent immédiatement
    if (languages.length === 0) {
      console.warn('No valid episodes found for any language, will use fallback methods');
      return ['FALLBACK']; // Marquer pour déclencher le fallback
    }
    
    return languages;
  };

  // Fonction de fallback intelligent pour épisodes vides
  const loadEpisodesWithIntelligentFallback = async (animeId: string, season: Season) => {
    console.log('Starting intelligent fallback for:', animeId, season.name);
    
    // Étape 1: Essayer endpoint content
    try {
      const contentResponse = await fetch(`${API_BASE}/api/content?animeId=${animeId}&type=episodes`);
      const contentData = await contentResponse.json();
      
      if (contentData.success && contentData.data && contentData.data.length > 0) {
        // Filtrer les épisodes pour cette saison
        const seasonEpisodes = contentData.data.filter((ep: any) => 
          !ep.seasonNumber || ep.seasonNumber === season.number
        );
        
        if (seasonEpisodes.length > 0) {
          console.log(`Found ${seasonEpisodes.length} episodes via content endpoint`);
          setEpisodes(seasonEpisodes);
          setSelectedSeason(season);
          setAvailableLanguages(['VOSTFR']);
          setSelectedLanguage('VOSTFR');
          
          const firstEpisode = seasonEpisodes[0];
          setSelectedEpisode(firstEpisode);
          setError(`Épisodes chargés via méthode alternative pour ${season.name}`);
          return;
        }
      }
    } catch (contentErr) {
      console.warn('Content endpoint failed:', contentErr);
    }
    
    // Étape 2: Essayer endpoint catalogue
    try {
      const catalogueResponse = await fetch(`${API_BASE}/api/catalogue?search=${animeId}`);
      const catalogueData = await catalogueResponse.json();
      
      if (catalogueData.success && catalogueData.data) {
        const animeInfo = catalogueData.data.find((a: any) => a.id === animeId);
        if (animeInfo && animeInfo.seasons && animeInfo.seasons[season.number - 1]) {
          const seasonInfo = animeInfo.seasons[season.number - 1];
          
          if (seasonInfo.episodeCount > 0) {
            // Générer des épisodes basés sur episodeCount
            const generatedEpisodes = Array.from({ length: seasonInfo.episodeCount }, (_, i) => ({
              id: `${animeId}-s${season.number}-e${i + 1}`,
              episodeNumber: i + 1,
              title: `Épisode ${i + 1}`,
              language: 'VOSTFR',
              url: '',
              available: true
            }));
            
            console.log(`Generated ${generatedEpisodes.length} episodes from catalogue info`);
            setEpisodes(generatedEpisodes);
            setSelectedSeason(season);
            setAvailableLanguages(['VOSTFR']);
            setSelectedLanguage('VOSTFR');
            
            const firstEpisode = generatedEpisodes[0];
            setSelectedEpisode(firstEpisode);
            setError(`${generatedEpisodes.length} épisodes générés pour ${season.name} (méthode catalogue)`);
            return;
          }
        }
      }
    } catch (catalogueErr) {
      console.warn('Catalogue endpoint failed:', catalogueErr);
    }
    
    // Si tout échoue
    throw new Error(`Aucun épisode disponible pour ${season.name}. Cet anime pourrait ne pas être encore disponible.`);
  };

  // Charger les épisodes d'une saison
  const loadSeasonEpisodes = async (season: Season) => {
    if (!selectedAnime) return;
    
    setLoading(true);
    setError(null);
    setCurrentView('player');
    
    // Reset des états pour éviter la confusion
    setEpisodes([]);
    setSelectedEpisode(null);
    setEpisodeDetails(null);
    
    try {
      console.log('Loading season episodes:', { animeId: selectedAnime.id, seasonNumber: season.number });
      
      const availLangs = await detectAvailableLanguages(selectedAnime.id, season.number);
      console.log('Available languages detected:', availLangs);
      
      // Si fallback détecté, utiliser directement le système intelligent
      if (availLangs.includes('FALLBACK')) {
        console.log('No standard episodes found, using intelligent fallback immediately');
        try {
          await loadEpisodesWithIntelligentFallback(selectedAnime.id, season);
          return;
        } catch (fallbackError) {
          console.error('Intelligent fallback failed:', fallbackError);
          throw fallbackError;
        }
      }
      
      setAvailableLanguages(availLangs);
      
      let languageToUse = selectedLanguage;
      if (!availLangs.includes(selectedLanguage)) {
        languageToUse = availLangs[0] as 'VF' | 'VOSTFR';
        setSelectedLanguage(languageToUse);
      }
      
      const language = languageToUse.toLowerCase();
      const requestUrl = `${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${season.number}&language=${language}`;
      console.log('Requesting episodes from:', requestUrl);
      
      const response = await fetch(requestUrl);
      console.log('Episodes response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse: ApiResponse<{
        animeId: string;
        season: number;
        language: string;
        episodes: Episode[];
        episodeCount: number;
      }> = await response.json();
      
      console.log('Episodes API response:', apiResponse);
      
      if (!apiResponse.success) {
        throw new Error(`API error: ${JSON.stringify(apiResponse)}`);
      }
      
      // CORRECTION 8: Épisodes Vides API - Fallback intelligent
      if (!apiResponse.data || !apiResponse.data.episodes || apiResponse.data.episodes.length === 0) {
        console.log('API returned empty episodes, attempting intelligent fallback...');
        
        // Tenter plusieurs langues et méthodes
        const languages = ['VOSTFR', 'VF'];
        let validEpisodes = [];
        
        for (const lang of languages) {
          try {
            const langCode = lang.toLowerCase() === 'vf' ? 'vf' : 'vostfr';
            const response = await fetch(`${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${season.number}&language=${langCode}`);
            const data = await response.json();
            
            if (data.success && data.data && data.data.episodes && data.data.episodes.length > 0) {
              validEpisodes = data.data.episodes;
              setSelectedLanguage(lang as 'VF' | 'VOSTFR');
              console.log(`Found ${validEpisodes.length} episodes in ${lang}`);
              break;
            }
          } catch (err) {
            console.warn(`Failed to fetch episodes in ${lang}:`, err);
          }
        }
        
        // Si aucun épisode trouvé, essayer endpoint content
        if (validEpisodes.length === 0) {
          try {
            const contentResponse = await fetch(`${API_BASE}/api/content?animeId=${selectedAnime.id}&type=episodes`);
            const contentData = await contentResponse.json();
            
            if (contentData.success && contentData.data && contentData.data.length > 0) {
              validEpisodes = contentData.data;
              console.log(`Found ${validEpisodes.length} episodes via content endpoint`);
            }
          } catch (contentErr) {
            console.warn('Content endpoint failed:', contentErr);
          }
        }
        
        // Dernière tentative avec catalogue
        if (validEpisodes.length === 0) {
          try {
            const catalogueResponse = await fetch(`${API_BASE}/api/catalogue?search=${selectedAnime.id}`);
            const catalogueData = await catalogueResponse.json();
            
            if (catalogueData.success && catalogueData.data) {
              const animeInfo = catalogueData.data.find((a: any) => a.id === selectedAnime.id);
              if (animeInfo && animeInfo.seasons && animeInfo.seasons[season.number - 1]) {
                const seasonInfo = animeInfo.seasons[season.number - 1];
                // Générer des épisodes basés sur episodeCount
                validEpisodes = Array.from({ length: seasonInfo.episodeCount }, (_, i) => ({
                  id: `${selectedAnime.id}-s${season.number}-e${i + 1}`,
                  episodeNumber: i + 1,
                  title: `Épisode ${i + 1}`,
                  language: 'VOSTFR',
                  url: '',
                  available: true
                }));
                console.log(`Generated ${validEpisodes.length} episodes from catalogue info`);
              }
            }
          } catch (catalogueErr) {
            console.warn('Catalogue endpoint failed:', catalogueErr);
          }
        }
        
        if (validEpisodes.length === 0) {
          throw new Error(`Aucun épisode disponible pour ${season.name}. Cet anime pourrait ne pas être encore disponible.`);
        }
        
        // Continuer avec les épisodes trouvés
        setEpisodes(validEpisodes);
        setSelectedSeason(season);
        
        const firstEpisode = validEpisodes[0];
        setSelectedEpisode(firstEpisode);
        await loadEpisodeSources(firstEpisode.id);
        
        setError(`Épisodes trouvés via méthode alternative pour ${season.name}`);
        return;
      }
      
      console.log('Episodes loaded successfully:', apiResponse.data.episodes.length);
      setEpisodes(apiResponse.data.episodes);
      setSelectedSeason(season);
      
      // Charger automatiquement le premier épisode
      const firstEpisode = apiResponse.data.episodes[0];
      console.log('Loading first episode:', firstEpisode);
      setSelectedEpisode(firstEpisode);
      await loadEpisodeSources(firstEpisode.id);
      
    } catch (err) {
      console.error('Erreur épisodes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Détails erreur épisodes:', errorMessage);
      setError(errorMessage);
      
      // Revenir à la vue anime si échec total
      setCurrentView('anime');
      setSelectedSeason(null);
      setEpisodes([]);
      setSelectedEpisode(null);
      setEpisodeDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // CORRECTION 7: Charger les sources d'un épisode avec cache et CORS améliorée
  const loadEpisodeSources = async (episodeId: string) => {
    setLoading(true);
    try {
      const cacheKey = `episode_${episodeId}`;
      
      // Utiliser le cache pour éviter les requêtes répétées
      const apiResponse = await getCachedData(cacheKey, async () => {
        const response = await fetch(`${API_BASE}/api/episode/${episodeId}`);
        return await response.json();
      }, 180000); // Cache pendant 3 minutes
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement des sources');
      }
      
      // Utiliser directement l'embed endpoint pour éviter CORS
      const embedUrl = `/api/embed/${episodeId}`;
      const optimizedData = {
        ...apiResponse.data,
        sources: apiResponse.data.sources.map((source: any, index: number) => ({
          ...source,
          url: index === 0 ? embedUrl : source.url,
          serverName: index === 0 ? `Lecteur Intégré - ${source.server}` : `Lecteur ${index + 1} - ${source.server}`,
          isEmbed: index === 0
        }))
      };
      
      setEpisodeDetails(optimizedData);
      setSelectedServer(0);
      
      // Sauvegarder dans l'historique de visionnage
      if (selectedAnime) {
        const newHistory = { ...watchHistory, [selectedAnime.id]: apiResponse.data.episodeNumber };
        setWatchHistory(newHistory);
        localStorage.setItem('animeWatchHistory', JSON.stringify(newHistory));
      }

    } catch (err) {
      console.error('Erreur sources:', err);
      setError('Impossible de charger les sources vidéo.');
      setEpisodeDetails(null);
    } finally {
      setLoading(false);
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

  // CORRECTION 6: Changer de langue avec protection race conditions
  const changeLanguage = async (newLanguage: 'VF' | 'VOSTFR') => {
    if (!selectedSeason || !selectedAnime || selectedLanguage === newLanguage) return;
    
    // Protection contre les race conditions
    if (languageChangeInProgress) return;
    setLanguageChangeInProgress(true);
    
    const previousLanguage = selectedLanguage;
    setSelectedLanguage(newLanguage);
    setLoading(true);
    setError(null);
    
    try {
      const language = newLanguage.toLowerCase();
      const cacheKey = `seasons_${selectedAnime.id}_${selectedSeason.number}_${language}`;
      
      // Utiliser le cache pour éviter les requêtes répétées
      const apiResponse = await getCachedData(cacheKey, async () => {
        const response = await fetch(`${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${language}`);
        return await response.json();
      });
      
      if (!apiResponse.success || apiResponse.data.episodes.length === 0) {
        throw new Error(`Aucun épisode ${newLanguage} disponible`);
      }
      
      setEpisodes(apiResponse.data.episodes);
      
      // Recharger le premier épisode avec la nouvelle langue
      const firstEpisode = apiResponse.data.episodes[0];
      setSelectedEpisode(firstEpisode);
      await loadEpisodeSources(firstEpisode.id);
      
    } catch (err) {
      console.error('Erreur changement langue:', err);
      setError(`Impossible de charger les épisodes ${newLanguage}.`);
      // Revenir à la langue précédente si échec
      setSelectedLanguage(previousLanguage);
    } finally {
      setLoading(false);
      setLanguageChangeInProgress(false);
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
    <MainLayout className="bg-black anime-sama-page">
      {/* Header exact anime-sama avec recherche intégrée */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: '#000000', borderBottom: '1px solid #333' }}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center flex-1">
            {currentView !== 'search' && (
              <button 
                onClick={() => {
                  if (currentView === 'player') {
                    setCurrentView('anime');
                  } else if (currentView === 'anime') {
                    setCurrentView('search');
                    setSelectedAnime(null);
                  }
                }}
                className="mr-3 p-2 rounded" 
                style={{ backgroundColor: '#1a1a1a' }}
              >
                <ArrowLeft size={18} className="text-white" />
              </button>
            )}
            
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
                            src={anime.image}
                            alt={anime.title}
                            className="w-full aspect-[3/4] object-cover group-hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=Image+Non+Disponible';
                              target.onerror = null; // Prevent infinite loop
                            }}
                          />
                          {watchHistory[anime.id] && (
                            <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                              Ep {watchHistory[anime.id]}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-3">
                          <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-cyan-400 transition-colors">
                            {anime.title}
                          </h3>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-gray-400 text-xs">{anime.status}</p>
                            <span className="text-cyan-400 text-xs">{anime.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message de recherche */}
              <div className="text-center py-12 border-t border-gray-800">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-white text-xl font-bold mb-2">Recherchez votre anime</h2>
                <p className="text-gray-400 text-sm">Tapez le nom de l'anime que vous souhaitez regarder</p>
              </div>
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
              {/* Informations d'avancement authentiques */}
              {selectedAnime.progressInfo && (
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-white font-semibold">Avancement :</span>
                    <span className="text-gray-400 ml-2">{selectedAnime.progressInfo.advancement}</span>
                  </div>
                  <div>
                    <span className="text-white font-semibold">Correspondance :</span>
                    <span className="text-gray-400 ml-2">{selectedAnime.progressInfo.correspondence}</span>
                  </div>
                  {selectedAnime.progressInfo.totalEpisodes && (
                    <p className="text-gray-400 text-xs">
                      {selectedAnime.progressInfo.totalEpisodes} épisodes disponibles
                    </p>
                  )}
                </div>
              )}
              
              {/* Indicateurs Films/Scans authentiques */}
              <div className="flex gap-3 mt-2">
                {selectedAnime.progressInfo?.hasFilms && (
                  <div className="text-blue-400 text-sm">📽️ Films disponibles</div>
                )}
                {selectedAnime.progressInfo?.hasScans && (
                  <div className="text-green-400 text-sm">📖 Scans manga disponibles</div>
                )}
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

          {/* Section ANIME avec sagas, films et scans */}
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
              
              {/* Films si disponibles */}
              {selectedAnime.progressInfo?.hasFilms && (
                <button
                  className="relative overflow-hidden rounded-lg border-2 transition-all"
                  style={{ 
                    aspectRatio: '16/9',
                    borderColor: '#dc2626',
                    backgroundColor: '#dc2626'
                  }}
                >
                  <img
                    src={selectedAnime.image}
                    alt="Films"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%)' }}
                  />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-white text-sm font-bold text-left">📽️ Films</div>
                  </div>
                </button>
              )}
              
              {/* Scans si disponibles */}
              {selectedAnime.progressInfo?.hasScans && (
                <button
                  className="relative overflow-hidden rounded-lg border-2 transition-all"
                  style={{ 
                    aspectRatio: '16/9',
                    borderColor: '#16a34a',
                    backgroundColor: '#16a34a'
                  }}
                >
                  <img
                    src={selectedAnime.image}
                    alt="Scans"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%)' }}
                  />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-white text-sm font-bold text-left">📖 Scans Manga</div>
                  </div>
                </button>
              )}
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
                value={selectedEpisode?.id || ""}
                onChange={(e) => {
                  const episode = episodes.find(ep => ep.id === e.target.value);
                  if (episode) {
                    setSelectedEpisode(episode);
                    loadEpisodeSources(episode.id);
                  }
                }}
                className="w-full p-3 text-white rounded text-sm font-medium"
                style={{ backgroundColor: '#1e40af', border: '1px solid #3b82f6' }}
              >
                {episodes.length > 0 ? (
                  <>
                    <option value="" disabled>
                      {selectedEpisode ? `EPISODE ${selectedEpisode.episodeNumber}` : 'Sélectionner un épisode'}
                    </option>
                    {episodes.map((episode) => (
                      <option key={episode.id} value={episode.id}>
                        EPISODE {episode.episodeNumber}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="" disabled>Chargement des épisodes...</option>
                )}
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
                      {source.quality && ` (${source.quality})`}
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
                {selectedEpisode ? `${selectedSeason?.name} - EPISODE ${selectedEpisode.episodeNumber}` : 'Aucun épisode sélectionné'}
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

            {/* Message d'information utilisateur simplifié */}
            <div className="text-center py-4">
              <p className="text-white text-sm">
                <span className="italic">Pub insistante ou vidéo indisponible ?</span><br />
                <span className="font-bold">Changez de lecteur.</span>
              </p>
            </div>

            {/* CORRECTION 5: Lecteur vidéo optimisé avec gestion d'erreurs améliorée */}
            {(() => {
              const currentSources = episodeDetails?.sources || [];
              const currentSource = currentSources[selectedServer];
              
              if (!currentSource) return null;
              
              return (
                <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: '#000', minHeight: '400px' }}>
                  <iframe
                    key={`${selectedEpisode?.id}-${selectedServer}`}
                    src={currentSource.url}
                    className="w-full h-64 md:h-80 lg:h-96"
                    allowFullScreen
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    title={`${episodeDetails?.title} - ${currentSource.server}`}
                    onLoad={() => {
                      setError(null);
                      console.log(`Successfully loaded server ${selectedServer + 1}`);
                    }}
                    onError={() => {
                      console.error(`Failed to load server ${selectedServer + 1}`);
                      handleVideoError(selectedServer);
                    }}
                  />
                  
                  {/* Indicateur serveur actuel */}
                  <div className="absolute top-2 left-2">
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Serveur {selectedServer + 1}/{currentSources.length} - {currentSource.server}
                    </div>
                  </div>
                  
                  {/* Bouton d'ouverture externe */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => {
                        window.open(currentSource.url, '_blank');
                      }}
                      className="bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-black/90 transition-colors"
                    >
                      ⧉ Nouvel onglet
                    </button>
                  </div>
                  
                  {/* Boutons navigation serveurs */}
                  {currentSources.length > 1 && (
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <button
                        onClick={() => {
                          if (selectedServer > 0) {
                            setSelectedServer(selectedServer - 1);
                          }
                        }}
                        disabled={selectedServer === 0}
                        className="bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-black/90 transition-colors disabled:opacity-50"
                      >
                        ← Serveur précédent
                      </button>
                      <button
                        onClick={() => {
                          if (selectedServer < currentSources.length - 1) {
                            setSelectedServer(selectedServer + 1);
                          }
                        }}
                        disabled={selectedServer === currentSources.length - 1}
                        className="bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-black/90 transition-colors disabled:opacity-50"
                      >
                        Serveur suivant →
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}




          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white text-sm">Chargement...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 p-3 rounded-lg z-50 status-message error">
          <p className="text-white text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-2 text-white hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
    </MainLayout>
  );
};

export default AnimeSamaPage;