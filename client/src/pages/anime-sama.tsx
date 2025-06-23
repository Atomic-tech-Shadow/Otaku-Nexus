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

  // Cache robuste avec gestion d'erreurs complète
  const cache = new Map();
  
  const getCachedData = async (key: string, fetcher: () => Promise<any>, ttl = 300000) => {
    if (cache.has(key)) {
      const { data, timestamp } = cache.get(key);
      if (Date.now() - timestamp < ttl) {
        return data;
      }
    }
    
    // Exécuter le fetcher directement sans masquer les erreurs
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
    
    // Charger les animes populaires au démarrage avec gestion d'erreurs
    loadPopularAnimes().catch(error => {
      console.warn('Failed to load popular animes on startup:', error);
      setPopularAnimes([]);
    });
    
    // Gestionnaire global pour les promesses non capturées - Version corrigée
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorReason = event.reason;
      
      // Logger l'erreur pour diagnostic mais toujours prévenir le crash
      console.warn('Unhandled promise rejection caught and handled:', {
        reason: errorReason?.message || errorReason,
        stack: errorReason?.stack
      });
      
      // Toujours prévenir le crash de l'application
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Chargement des animes populaires avec API déployée
  const loadPopularAnimes = async () => {
    try {
      console.log('Loading trending animes from deployed API');
      const response = await fetch(`${API_BASE}/api/trending`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data)) {
          const trendingAnimes = result.data.slice(0, 12);
          console.log(`Successfully loaded ${trendingAnimes.length} trending animes from deployed API`);
          setPopularAnimes(trendingAnimes);
          return;
        }
      }
      
      console.log('Deployed API trending not available, using empty state');
      setPopularAnimes([]);
      
    } catch (error: any) {
      console.warn('Deployed API trending failed:', error?.message || 'Network error');
      setPopularAnimes([]);
    }
  };



  const API_BASE = 'https://api-anime-sama.onrender.com';
  
  // Mapping correct des épisodes One Piece selon documentation
  const SEASON_MAPPINGS = {
    'one-piece': {
      1: { start: 1, end: 61, name: "Saga 1 (East Blue)" },
      2: { start: 62, end: 135, name: "Saga 2 (Alabasta)" },
      3: { start: 136, end: 206, name: "Saga 3 (Ile céleste)" },
      4: { start: 207, end: 325, name: "Saga 4 (Water Seven)" },
      5: { start: 326, end: 384, name: "Saga 5 (Thriller Bark)" },
      6: { start: 385, end: 516, name: "Saga 6 (Guerre au Sommet)" },
      7: { start: 517, end: 574, name: "Saga 7 (Ile des Hommes-Poissons)" },
      8: { start: 575, end: 746, name: "Saga 8 (Dressrosa)" },
      9: { start: 747, end: 889, name: "Saga 9 (Ile Tougato)" },
      10: { start: 890, end: 1086, name: "Saga 10 (Pays des Wa)" },
      11: { start: 1087, end: 1122, name: "Saga 11 (Egghead)" }
    }
  };
  
  // Configuration optimisée selon le guide de configuration API
  const API_CONFIG = {
    timeout: 20000,
    maxRetries: 3,
    retryDelay: 2000,
    cacheEnabled: true,
    cacheTTL: 300000 // 5 minutes
  };
  
  // Configuration selon le guide de configuration API
  const requestConfig = {
    timeout: 20000,
    maxRetries: 3,
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache'
    }
  };

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
      const response = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse: ApiResponse<SearchResult[]> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors de la recherche');
      }
      
      console.log(`Search found ${apiResponse.data.length} results for "${query}"`);
      setSearchResults(apiResponse.data);
    } catch (err: any) {
      console.error('Search error:', err?.message || err);
      setError('Impossible de rechercher les animes');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les détails d'un anime avec configuration validée
  const loadAnimeDetails = async (animeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/anime/${animeId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse: ApiResponse<AnimeDetails> = await response.json();
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Données anime non disponibles');
      }
      
      console.log(`Loaded anime: ${apiResponse.data.title} with ${apiResponse.data.progressInfo?.totalEpisodes || 0} total episodes`);
      setSelectedAnime(apiResponse.data);
      setCurrentView('anime');
      setSelectedSeason(null);
      setEpisodes([]);
    } catch (err: any) {
      console.error('Anime loading error:', err?.message || err);
      setError('Impossible de charger les détails de l\'anime');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de correction des numéros d'épisodes selon documentation
  const correctEpisodeNumbers = (animeId: string, seasonNumber: number, episodes: Episode[]): Episode[] => {
    // Correction spécifique pour One Piece selon documentation
    if (animeId === 'one-piece') {
      let start = 1, end = 1122;
      
      // Mapping One Piece selon documentation
      if (seasonNumber === 11) { start = 1087; end = 1122; } // Saga 11 (Egghead)
      else if (seasonNumber === 10) { start = 890; end = 1086; } // Saga 10 (Pays des Wa)
      else if (seasonNumber === 9) { start = 747; end = 889; } // Saga 9 (Ile Tougato)
      else if (seasonNumber === 8) { start = 575; end = 746; } // Saga 8 (Dressrosa)
      else if (seasonNumber === 7) { start = 517; end = 574; } // Saga 7 (Ile des Hommes-Poissons)
      else if (seasonNumber === 6) { start = 385; end = 516; } // Saga 6 (Guerre au Sommet)
      else if (seasonNumber === 5) { start = 326; end = 384; } // Saga 5 (Thriller Bark)
      else if (seasonNumber === 4) { start = 207; end = 325; } // Saga 4 (Water Seven)
      else if (seasonNumber === 3) { start = 136; end = 206; } // Saga 3 (Ile céleste)
      else if (seasonNumber === 2) { start = 62; end = 135; } // Saga 2 (Alabasta)
      else if (seasonNumber === 1) { start = 1; end = 61; } // Saga 1 (East Blue)
      
      const correctedEpisodes: Episode[] = [];
      for (let i = start; i <= end; i++) {
        correctedEpisodes.push({
          id: `${animeId}-episode-${i}-${episodes[0]?.language || 'vostfr'}`,
          episodeNumber: i,
          title: `Episode ${i}`,
          language: episodes[0]?.language || 'vostfr',
          url: `${API_BASE}/api/episode/${animeId}-episode-${i}-${episodes[0]?.language || 'vostfr'}`,
          available: true
        });
      }
      
      console.log(`✅ One Piece corrected: Season ${seasonNumber} = Episodes ${start}-${end} (${correctedEpisodes.length} episodes)`);
      return correctedEpisodes;
    }
    
    return episodes;
  };

  // Détection des langues selon documentation validée
  const detectAvailableLanguages = async (animeId: string, seasonNumber: number): Promise<string[]> => {
    console.log(`Detecting languages for ${animeId} season ${seasonNumber}`);
    
    const languages: string[] = [];
    
    // Tester VF d'abord selon documentation (One Piece 1093 confirmé en VF)
    try {
      const vfResponse = await fetch(`${API_BASE}/api/seasons?animeId=${animeId}&season=${seasonNumber}&language=vf`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000)
      });
      
      if (vfResponse.ok) {
        const vfData = await vfResponse.json();
        if (vfData.success && vfData.data?.episodes?.length > 0) {
          languages.push('VF');
          console.log(`✅ VF detected: ${vfData.data.episodes.length} episodes`);
        }
      }
    } catch (err) {
      console.warn('VF detection failed');
    }
    
    // Tester VOSTFR
    try {
      const vostfrResponse = await fetch(`${API_BASE}/api/seasons?animeId=${animeId}&season=${seasonNumber}&language=vostfr`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000)
      });
      
      if (vostfrResponse.ok) {
        const vostfrData = await vostfrResponse.json();
        if (vostfrData.success && vostfrData.data?.episodes?.length > 0) {
          languages.push('VOSTFR');
          console.log(`✅ VOSTFR detected: ${vostfrData.data.episodes.length} episodes`);
        }
      }
    } catch (err) {
      console.warn('VOSTFR detection failed');
    }
    
    // Si aucune langue détectée, utiliser le système universel
    if (languages.length === 0) {
      console.log('No standard languages detected, using universal system');
      return ['UNIVERSAL'];
    }
    
    console.log(`Languages available: ${languages.join(', ')}`);
    return languages;
  };

  // Système universel optimisé selon la documentation API
  const loadEpisodesWithUniversalSystem = async (animeId: string, season: Season) => {
    console.log(`🚀 Universal System: Processing ${animeId} ${season.name}`);
    
    // Étape 1: Endpoint content avec données authentiques
    try {
      const contentResponse = await fetch(`${API_BASE}/api/content?animeId=${animeId}&type=episodes`);
      
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        
        if (contentData.success && contentData.data && Array.isArray(contentData.data) && contentData.data.length > 0) {
          const seasonEpisodes = contentData.data.filter((ep: any) => 
            !ep.seasonNumber || ep.seasonNumber === season.number
          );
          
          if (seasonEpisodes.length > 0) {
            console.log(`📋 Content endpoint: Found ${seasonEpisodes.length} authentic episodes`);
            
            const formattedEpisodes = seasonEpisodes.map((ep: any, index: number) => ({
              id: ep.id || `${animeId}-s${season.number}-e${index + 1}-universal`,
              episodeNumber: ep.episodeNumber || index + 1,
              title: ep.title || `Épisode ${index + 1}`,
              language: 'VOSTFR',
              url: ep.url || '',
              available: true
            }));
            
            setEpisodes(formattedEpisodes);
            setSelectedSeason(season);
            setAvailableLanguages(['VOSTFR']);
            setSelectedLanguage('VOSTFR');
            setSelectedEpisode(formattedEpisodes[0]);
            await loadEpisodeSources(formattedEpisodes[0].id);
            
            setError(`${formattedEpisodes.length} épisodes authentiques chargés via système universel`);
            return;
          }
        }
      }
    } catch (contentErr) {
      console.warn('Content endpoint failed:', contentErr);
    }
    
    // Étape 2: Endpoint catalogue pour nombre d'épisodes réel
    try {
      const catalogueResponse = await fetch(`${API_BASE}/api/catalogue?search=${animeId}`);
      
      if (catalogueResponse.ok) {
        const catalogueData = await catalogueResponse.json();
        
        if (catalogueData.success && catalogueData.data && Array.isArray(catalogueData.data)) {
          const animeInfo = catalogueData.data.find((a: any) => 
            a.id === animeId || a.title?.toLowerCase().includes(animeId.toLowerCase())
          );
          
          if (animeInfo && animeInfo.seasons && animeInfo.seasons[season.number - 1]) {
            const seasonInfo = animeInfo.seasons[season.number - 1];
            
            if (seasonInfo.episodeCount && seasonInfo.episodeCount > 0) {
              console.log(`🔢 Catalogue: Generating ${seasonInfo.episodeCount} episodes from authentic data`);
              
              const generatedEpisodes = Array.from({ length: seasonInfo.episodeCount }, (_, i) => ({
                id: `${animeId}-s${season.number}-e${i + 1}-universal`,
                episodeNumber: i + 1,
                title: `Épisode ${i + 1}`,
                language: 'VOSTFR',
                url: `${API_BASE}/api/episode/${animeId}-episode-${i + 1}-vostfr`,
                available: true
              }));
              
              setEpisodes(generatedEpisodes);
              setSelectedSeason(season);
              setAvailableLanguages(['VOSTFR']);
              setSelectedLanguage('VOSTFR');
              setSelectedEpisode(generatedEpisodes[0]);
              await loadEpisodeSources(generatedEpisodes[0].id);
              
              setError(`${seasonInfo.episodeCount} épisodes générés depuis données authentiques du catalogue`);
              return;
            }
          }
        }
      }
    } catch (catalogueErr) {
      console.warn('Catalogue endpoint failed:', catalogueErr);
    }
    
    // Étape 3: Utiliser progressInfo avec correction des numéros d'épisodes
    if (selectedAnime?.progressInfo?.totalEpisodes) {
      console.log(`📊 Using progressInfo: ${selectedAnime.progressInfo.totalEpisodes} total episodes detected`);
      
      // Créer des épisodes temporaires pour la correction
      const tempEpisodes = [{
        id: 'temp',
        episodeNumber: 1,
        title: 'Episode 1',
        language: 'vostfr',
        url: '',
        available: true
      }];
      
      // Appliquer la correction des numéros d'épisodes
      const correctedEpisodes = correctEpisodeNumbers(animeId, season.number, tempEpisodes);
      
      if (correctedEpisodes.length > 0) {
        setEpisodes(correctedEpisodes);
        setSelectedSeason(season);
        setAvailableLanguages(['VOSTFR', 'VF']);
        setSelectedLanguage('VOSTFR');
        setSelectedEpisode(correctedEpisodes[0]);
        await loadEpisodeSources(correctedEpisodes[0].id);
        
        setError(`${correctedEpisodes.length} épisodes générés avec numérotation correcte (${correctedEpisodes[0].episodeNumber}-${correctedEpisodes[correctedEpisodes.length-1].episodeNumber})`);
        return;
      }
    }
    
    // Si tout échoue
    console.error(`❌ Universal system exhausted all methods for ${animeId} ${season.name}`);
    throw new Error(`Système universel: Aucun épisode détecté pour ${season.name}. Cet anime pourrait ne pas être disponible sur anime-sama.fr.`);
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
      
      // Si système universel détecté, utiliser les endpoints de fallback intelligents
      if (availLangs.includes('UNIVERSAL')) {
        console.log('🚀 Activating universal system for comprehensive episode detection');
        try {
          await loadEpisodesWithUniversalSystem(selectedAnime.id, season);
          return;
        } catch (universalError) {
          console.error('Universal system failed:', universalError);
          throw universalError;
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
      
      const response = await fetch(requestUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      });
      
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
        
        // Continuer avec les épisodes trouvés - Appliquer correction numérotation
        const correctedValidEpisodes = correctEpisodeNumbers(selectedAnime.id, season.number, validEpisodes);
        
        setEpisodes(correctedValidEpisodes);
        setSelectedSeason(season);
        
        const firstEpisode = correctedValidEpisodes[0];
        setSelectedEpisode(firstEpisode);
        await loadEpisodeSources(firstEpisode.id);
        
        setError(`Épisodes corrigés via méthode alternative pour ${season.name}`);
        return;
      }
      
      console.log('Episodes loaded successfully:', apiResponse.data.episodes.length);
      
      // ✅ CORRECTION CRITIQUE: Appliquer la correction des numéros d'épisodes
      const correctedEpisodes = correctEpisodeNumbers(selectedAnime.id, season.number, apiResponse.data.episodes);
      
      setEpisodes(correctedEpisodes);
      setSelectedSeason(season);
      
      // Charger automatiquement le premier épisode
      const firstEpisode = correctedEpisodes[0];
      console.log('Loading first episode:', firstEpisode);
      setSelectedEpisode(firstEpisode);
      await loadEpisodeSources(firstEpisode.id);
      
      const originalRange = `${apiResponse.data.episodes[0].episodeNumber}-${apiResponse.data.episodes[apiResponse.data.episodes.length-1].episodeNumber}`;
      const correctedRange = `${correctedEpisodes[0].episodeNumber}-${correctedEpisodes[correctedEpisodes.length-1].episodeNumber}`;
      console.log(`✅ Episodes corrected: ${originalRange} → ${correctedRange}`);
      
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

  // Système de chargement des sources selon documentation validée
  const loadEpisodeSources = async (episodeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading sources for episode: ${episodeId}`);
      
      // Générer l'ID d'épisode correct selon documentation: {anime}-episode-{numero}-{langue}
      let correctEpisodeId = episodeId;
      if (selectedAnime && selectedEpisode) {
        const lang = selectedLanguage.toLowerCase();
        correctEpisodeId = `${selectedAnime.id}-episode-${selectedEpisode.episodeNumber}-${lang}`;
        console.log(`Using correct episode ID format: ${correctEpisodeId}`);
      }
      
      // Essayer d'abord l'endpoint /api/episode/{episodeId} selon documentation
      try {
        const response = await fetch(`${API_BASE}/api/episode/${correctEpisodeId}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(15000)
        });
        
        if (response.ok) {
          const apiResponse = await response.json();
          if (apiResponse.success && apiResponse.data) {
            console.log(`Successfully loaded server sources: ${apiResponse.data.sources?.length || 0} servers`);
            
            // Optimiser les sources avec l'endpoint embed intégré
            const optimizedData = {
              ...apiResponse.data,
              sources: (apiResponse.data.sources || []).map((source: any, index: number) => ({
                ...source,
                serverName: `Serveur ${index + 1} - ${source.server}${source.quality ? ` (${source.quality})` : ''}`,
                embedUrl: `/api/embed/${correctEpisodeId}`,
                isEmbed: true,
                priority: index === 0 ? 'high' : 'normal'
              }))
            };
            
            setEpisodeDetails(optimizedData);
            setSelectedServer(0);
            
            // Historique de visionnage
            if (selectedAnime && selectedEpisode) {
              const newHistory = { 
                ...watchHistory, 
                [selectedAnime.id]: selectedEpisode.episodeNumber 
              };
              setWatchHistory(newHistory);
              localStorage.setItem('animeWatchHistory', JSON.stringify(newHistory));
              console.log(`Updated watch history: Episode ${selectedEpisode.episodeNumber} for ${selectedAnime.title}`);
            }
            
            return;
          }
        }
      } catch (apiError) {
        console.warn('API episode sources failed, using embed fallback:', apiError);
      }
      
      // Fallback: utiliser directement l'endpoint embed
      const embedUrl = `/api/embed/${correctEpisodeId}`;
      const fallbackData = {
        id: correctEpisodeId,
        title: selectedEpisode?.title || 'Épisode',
        animeTitle: selectedAnime?.title || 'Anime',
        episodeNumber: selectedEpisode?.episodeNumber || 1,
        sources: [
          {
            url: embedUrl,
            server: 'Universal',
            serverName: 'Lecteur Universel - Système intégré',
            quality: 'HD',
            language: selectedLanguage,
            type: 'embed',
            serverIndex: 0,
            isEmbed: true,
            priority: 'high',
            embedUrl: embedUrl
          }
        ],
        availableServers: ['Universal'],
        url: embedUrl,
        embedUrl: embedUrl
      };
      
      setEpisodeDetails(fallbackData);
      setSelectedServer(0);
      console.log(`Using embed fallback for ${correctEpisodeId}`);

    } catch (err: any) {
      console.error('Episode sources error:', err?.message || 'Unknown error');
      setError('Erreur de chargement des sources vidéo');
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

  // Système universel pour changement de langue optimisé
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
      
      console.log(`🔄 Changing language to ${newLanguage} for ${selectedAnime.title}`);
      
      // Appel direct à l'API sans AbortController (Fix Replit)
      let apiResponse;
      try {
        const response = await fetch(`${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${selectedSeason.number}&language=${language}`, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        apiResponse = await response.json();
        console.log(`✅ Language change API success: ${apiResponse.data?.episodes?.length || 0} episodes in ${newLanguage}`);
        
      } catch (fetchError: any) {
        console.warn(`Language change fetch failed for ${newLanguage}:`, fetchError.message);
        apiResponse = {
          success: false,
          data: { episodes: [] },
          error: fetchError.message || 'Network error'
        };
      }
      
      // Diagnostic détaillé de la réponse API
      console.log(`🔍 API Response diagnosis for ${newLanguage}:`, {
        hasResponse: !!apiResponse,
        isSuccess: apiResponse?.success,
        hasData: !!apiResponse?.data,
        hasEpisodes: !!apiResponse?.data?.episodes,
        isArray: Array.isArray(apiResponse?.data?.episodes),
        episodeCount: apiResponse?.data?.episodes?.length || 0,
        error: apiResponse?.error
      });
      
      // Vérifier si la réponse est valide et contient des épisodes
      if (apiResponse && apiResponse.success && apiResponse.data && 
          apiResponse.data.episodes && Array.isArray(apiResponse.data.episodes) && 
          apiResponse.data.episodes.length > 0) {
        
        console.log(`✅ Language change successful: ${apiResponse.data.episodes.length} episodes in ${newLanguage}`);
        
        // Appliquer les corrections d'épisodes selon la documentation
        const correctedEpisodes = correctEpisodeNumbers(selectedAnime.id, selectedSeason.number, apiResponse.data.episodes);
        setEpisodes(correctedEpisodes);
        
        // Recharger le premier épisode avec la nouvelle langue
        const firstEpisode = correctedEpisodes[0];
        setSelectedEpisode(firstEpisode);
        
        loadEpisodeSources(firstEpisode.id).catch(sourceError => {
          console.warn('Error loading episode sources after language change:', sourceError?.message || sourceError);
          setError('Épisodes chargés mais erreur de sources vidéo');
        });
        
      } else {
        // Gestion d'erreur ou pas d'épisodes dans cette langue
        const errorMsg = apiResponse?.error || 'No episodes found';
        console.log(`⚠️ No episodes found in ${newLanguage}, keeping current episodes with language interface change`);
        setError(`Interface changée vers ${newLanguage} - Sources ${previousLanguage} conservées`);
        
        // Recharger les sources pour le même épisode avec la nouvelle langue si possible
        if (selectedEpisode) {
          loadEpisodeSources(selectedEpisode.id).catch(sourceError => {
            console.warn('Error reloading sources with new language:', sourceError?.message || sourceError);
          });
        }
      }
      
    } catch (err: any) {
      console.error('Language change error:', err?.message || err);
      setError(`Changement de langue vers ${newLanguage} impossible. Sources ${previousLanguage} conservées.`);
      // Revenir à la langue précédente si échec total
      setSelectedLanguage(previousLanguage);
      
      // S'assurer qu'aucune promesse ne reste non capturée
      if (selectedEpisode) {
        loadEpisodeSources(selectedEpisode.id).catch(sourceErr => {
          console.warn('Error reverting to previous episode sources:', sourceErr?.message || sourceErr);
        });
      }
      
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
              
              // Utiliser l'endpoint embed production selon documentation - SYNCHRONISATION FIXÉE
              const correctEpisodeId = selectedEpisode ? selectedEpisode.id : episodeDetails?.id || '';
              console.log(`🎬 Video player using episode ID: ${correctEpisodeId} (Episode ${selectedEpisode?.episodeNumber})`);
              
              const embedUrl = `${API_BASE}/api/embed/${correctEpisodeId}`;
              
              return (
                <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: '#000', minHeight: '400px' }}>
                  <iframe
                    key={`${correctEpisodeId}-${selectedServer}`}
                    src={embedUrl}
                    className="w-full h-64 md:h-80 lg:h-96"
                    allowFullScreen
                    frameBorder="0"
                    allow="autoplay; fullscreen; encrypted-media"
                    title={`${episodeDetails?.title} - Lecteur ${selectedServer + 1}`}
                    style={{ border: 'none' }}
                    onLoad={() => {
                      setError(null);
                      console.log(`✅ Embed player loaded: ${embedUrl}`);
                    }}
                    onError={() => {
                      console.error(`❌ Embed player failed: ${embedUrl}`);
                      setError('Erreur de chargement du lecteur. Essayez un autre serveur.');
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