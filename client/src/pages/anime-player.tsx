import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, ChevronDown, Play, ArrowLeft, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import MainLayout from '@/components/layout/main-layout';

interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
  streamingSources?: VideoSource[];
}

interface VideoSource {
  url: string;
  server: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
}

interface Season {
  number: number;
  name: string;
  value: string;
  languages: string[];
  episodeCount: number;
  url: string;
  available: boolean;
}

interface AnimeData {
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

interface EpisodeDetails {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  sources: VideoSource[];
  availableServers: string[];
  url: string;
}

const AnimePlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  // Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const targetSeason = urlParams.get('season');
  const targetEpisode = urlParams.get('episode');
  const targetLang = urlParams.get('lang');
  const isDirectLink = !!(targetSeason && targetEpisode && targetLang);
  
  // États pour les données
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>(
    targetLang === 'vf' ? 'VF' : 'VOSTFR'
  );
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration API externe
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

  // Fonction pour les requêtes API externes
  const apiRequest = async (endpoint: string, options = {}) => {
    const maxRetries = 2;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        attempt++;
        console.log(`Tentative ${attempt}/${maxRetries} échouée:`, error);
        
        if (attempt >= maxRetries) {
          console.error('Erreur API après', maxRetries, 'tentatives:', error);
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  // Fonction pour charger les détails d'un anime avec système universel
  const getAnimeDetails = async (animeId: string) => {
    try {
      const response = await apiRequest(`/api/anime/${animeId}`);
      return response;
    } catch (error) {
      console.error('Erreur chargement anime:', error);
      return null;
    }
  };

  // Fonction pour générer les épisodes d'une saison basée sur les données disponibles
  const generateSeasonEpisodes = (animeId: string, season: Season, language = 'VOSTFR') => {
    try {
      // Données spécifiques par anime et saison pour générer les épisodes
      const episodeData: Record<string, Record<string, { count: number; startEp?: number }>> = {
        'one-piece': {
          'saison1': { count: 61, startEp: 1 },
          'saison2': { count: 77, startEp: 62 },
          'saison3': { count: 52, startEp: 139 },
          'saison4': { count: 118, startEp: 191 },
          'saison5': { count: 48, startEp: 309 },
          'saison6': { count: 91, startEp: 357 },
          'saison7': { count: 118, startEp: 448 },
          'saison8': { count: 118, startEp: 566 },
          'saison9': { count: 99, startEp: 684 },
          'saison10': { count: 195, startEp: 783 },
          'saison11': { count: 122, startEp: 1086 }, // Egghead Arc
        }
      };

      const langCode = language.toLowerCase();
      const data = episodeData[animeId]?.[season.value];
      
      if (!data) {
        // Fallback: générer 12 épisodes par défaut
        const episodes = Array.from({ length: 12 }, (_, i) => ({
          id: `${animeId}-${season.value}-ep${i + 1}-${langCode}`,
          title: `Épisode ${i + 1}`,
          episodeNumber: i + 1,
          url: `https://anime-sama.fr/catalogue/${animeId}/${season.value}/${langCode}`,
          language: language,
          available: true,
          streamingSources: [{
            url: `https://anime-sama.fr/catalogue/${animeId}/${season.value}/${langCode}`,
            server: 'Anime-Sama',
            quality: 'HD',
            language: language,
            type: 'streaming',
            serverIndex: 0
          }]
        }));
        
        return {
          success: true,
          episodes: episodes
        };
      }

      // Générer les épisodes avec la numérotation correcte
      const episodes = Array.from({ length: data.count }, (_, i) => {
        const episodeNumber = (data.startEp || 1) + i;
        return {
          id: `${animeId}-${season.value}-ep${episodeNumber}-${langCode}`,
          title: `Épisode ${episodeNumber}`,
          episodeNumber: episodeNumber,
          url: `https://anime-sama.fr/catalogue/${animeId}/${season.value}/${langCode}`,
          language: language,
          available: true,
          streamingSources: [{
            url: `https://anime-sama.fr/catalogue/${animeId}/${season.value}/${langCode}`,
            server: 'Anime-Sama',
            quality: 'HD',
            language: language,
            type: 'streaming',
            serverIndex: 0
          }]
        };
      });

      return {
        success: true,
        episodes: episodes
      };
    } catch (error) {
      console.error('Erreur génération épisodes:', error);
      return null;
    }
  };

  // Fonction pour charger les saisons d'un anime selon la documentation API
  const getAnimeSeasons = async (animeId: string) => {
    try {
      const response = await apiRequest(`/api/seasons/${animeId}`);
      return response;
    } catch (error) {
      console.error('Erreur chargement saisons:', error);
      return null;
    }
  };

  // Charger les données de l'anime
  useEffect(() => {
    if (!id) return;
    
    const loadAnimeData = async () => {
      try {
        setLoading(true);
        
        // Charger les données de base de l'anime avec API robuste
        const animeData = await getAnimeDetails(id);
        
        if (animeData && animeData.success && animeData.data) {
          setAnimeData(animeData.data);
          
          // Utiliser les saisons des données de base
          if (animeData.data.seasons && animeData.data.seasons.length > 0) {
            // Filtrer les saisons pour éviter les doublons et garder seulement les vraies saisons
            const validSeasons = animeData.data.seasons.filter((s: any) => 
              s.name && 
              s.name !== 'nom' && 
              s.value !== 'url' && 
              (s.name.toLowerCase().includes('saison') || s.name.toLowerCase().includes('saga'))
            );
            
            // Sélectionner la saison demandée
            let seasonToSelect = validSeasons.length > 0 ? validSeasons[0] : animeData.data.seasons[0];
            console.log('Saisons valides trouvées:', validSeasons.length);
            console.log('Première saison valide:', seasonToSelect);
            
            if (targetSeason) {
              const requestedSeason = validSeasons.find((s: any) => s.value === targetSeason);
              if (requestedSeason) {
                seasonToSelect = requestedSeason;
              }
            }
            
            console.log('Saison sélectionnée:', seasonToSelect);
            setSelectedSeason(seasonToSelect);
            console.log('Début chargement épisodes pour saison:', seasonToSelect?.name);
            
            // Charger les épisodes directement avec les données anime disponibles
            if (seasonToSelect) {
              console.log('Chargement immédiat des épisodes...');
              await loadSeasonEpisodesDirectly(animeData.data, seasonToSelect, true);
            }
          }
        }
      } catch (err) {
        console.error('Erreur chargement anime:', err);
        setError('Erreur lors du chargement de l\'anime');
      } finally {
        setLoading(false);
      }
    };

    loadAnimeData();
  }, [id]);

  // Fonction pour charger les épisodes avec données anime déjà disponibles
  const loadSeasonEpisodesDirectly = async (animeDataObj: any, season: Season, autoLoadEpisode = false) => {
    try {
      setEpisodeLoading(true);
      const languageCode = selectedLanguage.toLowerCase() === 'vf' ? 'vf' : 'vostfr';
      
      console.log('Chargement épisodes pour:', animeDataObj.id, 'saison:', season.value, 'langue:', selectedLanguage);
      const data = await apiRequest(`/api/episodes/${animeDataObj.id}?season=${season.value}&language=${selectedLanguage}`);
      console.log('Épisodes reçus de l\'API:', data);
      
      if (!data || !data.success) {
        console.error('Erreur API épisodes:', data);
        throw new Error('Erreur lors du chargement des épisodes');
      }
      
      if (data.success && data.episodes && Array.isArray(data.episodes)) {
        // Adapter les données de l'API au format attendu
        const formattedEpisodes = data.episodes.map((ep: any, index: number) => ({
          id: `${animeDataObj.id}-${season.value}-ep${ep.episodeNumber || (index + 1)}-${languageCode}`,
          title: ep.title || `Épisode ${ep.episodeNumber || (index + 1)}`,
          episodeNumber: ep.episodeNumber || (index + 1),
          url: ep.url || `https://anime-sama.fr/catalogue/${animeDataObj.id}/${season.value}/${languageCode}`,
          language: selectedLanguage,
          available: true,
          streamingSources: ep.streamingSources || []
        }));
        
        console.log('Épisodes formatés:', formattedEpisodes.length);
        setEpisodes(formattedEpisodes);
        
        // Sélectionner l'épisode spécifié ou le premier
        if (formattedEpisodes.length > 0) {
          let episodeToSelect = formattedEpisodes[0];
          
          if (targetEpisode) {
            const requestedEpisode = formattedEpisodes.find(
              (ep: any) => ep.episodeNumber === parseInt(targetEpisode)
            );
            if (requestedEpisode) {
              episodeToSelect = requestedEpisode;
            }
          }
          
          console.log('Épisode sélectionné:', episodeToSelect.title);
          setSelectedEpisode(episodeToSelect);
          
          // Auto-charger l'épisode avec URLs directes
          if (autoLoadEpisode) {
            console.log('Auto-chargement URLs directes pour:', episodeToSelect.title);
            
            try {
              // Appel au nouvel endpoint /api/embed qui retourne du JSON
              const response = await fetch(`/api/embed?url=${encodeURIComponent(episodeToSelect.url)}`);
              
              if (response.ok) {
                const embedData = await response.json();
                console.log('URLs directes auto-chargées:', embedData);
                
                if (embedData.success && embedData.sources && embedData.sources.length > 0) {
                  // Utiliser les URLs directes extraites par l'API
                  setEpisodeDetails({
                    id: episodeToSelect.id,
                    title: episodeToSelect.title,
                    animeTitle: animeDataObj.title,
                    episodeNumber: episodeToSelect.episodeNumber,
                    sources: embedData.sources,
                    availableServers: embedData.sources.map((s: any) => s.server),
                    url: episodeToSelect.url
                  });
                  console.log('Détails épisode chargés avec URLs directes:', embedData.sources.length, 'sources');
                } else {
                  // Fallback vers les sources originales
                  if (episodeToSelect.streamingSources && episodeToSelect.streamingSources.length > 0) {
                    setEpisodeDetails({
                      id: episodeToSelect.id,
                      title: episodeToSelect.title,
                      animeTitle: animeDataObj.title,
                      episodeNumber: episodeToSelect.episodeNumber,
                      sources: episodeToSelect.streamingSources,
                      availableServers: episodeToSelect.streamingSources.map((s: any) => s.server),
                      url: episodeToSelect.url
                    });
                    console.log('Détails épisode chargés (fallback):', episodeToSelect.title);
                  }
                }
              } else {
                // Fallback en cas d'erreur API
                if (episodeToSelect.streamingSources && episodeToSelect.streamingSources.length > 0) {
                  setEpisodeDetails({
                    id: episodeToSelect.id,
                    title: episodeToSelect.title,
                    animeTitle: animeDataObj.title,
                    episodeNumber: episodeToSelect.episodeNumber,
                    sources: episodeToSelect.streamingSources,
                    availableServers: episodeToSelect.streamingSources.map((s: any) => s.server),
                    url: episodeToSelect.url
                  });
                  console.log('Détails épisode chargés (fallback API):', episodeToSelect.title);
                }
              }
            } catch (err) {
              console.error('Erreur auto-chargement URLs directes:', err);
              // Fallback vers les sources originales
              if (episodeToSelect.streamingSources && episodeToSelect.streamingSources.length > 0) {
                setEpisodeDetails({
                  id: episodeToSelect.id,
                  title: episodeToSelect.title,
                  animeTitle: animeDataObj.title,
                  episodeNumber: episodeToSelect.episodeNumber,
                  sources: episodeToSelect.streamingSources,
                  availableServers: episodeToSelect.streamingSources.map((s: any) => s.server),
                  url: episodeToSelect.url
                });
                console.log('Détails épisode chargés (fallback erreur):', episodeToSelect.title);
              }
            }
          }
        }
      } else {
        setError('Aucun épisode trouvé pour cette saison');
      }
    } catch (err) {
      console.error('Erreur chargement épisodes direct:', err);
      setError('Erreur lors du chargement des épisodes');
    } finally {
      setEpisodeLoading(false);
    }
  };

  // ✅ CORRECTION: Génération des épisodes depuis les données de saison
  const loadSeasonEpisodes = async (season: Season, autoLoadEpisode = false) => {
    if (!animeData) {
      console.log('Pas de données anime disponibles pour charger les épisodes');
      return;
    }
    
    try {
      setEpisodeLoading(true);
      const languageCode = selectedLanguage.toLowerCase() === 'vf' ? 'vf' : 'vostfr';
      
      // ✅ NOUVEAU : Utiliser l'API qui fonctionne maintenant
      console.log('Chargement épisodes pour:', animeData.id, 'saison:', season.value, 'langue:', selectedLanguage);
      const data = await apiRequest(`/api/episodes/${animeData.id}?season=${season.value}&language=${selectedLanguage}`);
      console.log('Épisodes reçus de l\'API:', data);
      
      if (!data || !data.success) {
        console.error('Erreur API épisodes:', data);
        throw new Error('Erreur lors du chargement des épisodes');
      }
      
      if (data.success && data.episodes && Array.isArray(data.episodes)) {
        // Adapter les données de l'API au format attendu
        const formattedEpisodes = data.episodes.map((ep: any, index: number) => ({
          id: `${animeData.id}-${season.value}-ep${ep.episodeNumber || (index + 1)}-${languageCode}`,
          title: ep.title || `Épisode ${ep.episodeNumber || (index + 1)}`,
          episodeNumber: ep.episodeNumber || (index + 1),
          url: ep.url || `https://anime-sama.fr/catalogue/${animeData.id}/${season.value}/${languageCode}`,
          language: selectedLanguage,
          available: true,
          streamingSources: ep.streamingSources || [{
            url: ep.url || `https://anime-sama.fr/catalogue/${animeData.id}/${season.value}/${languageCode}`,
            server: 'Anime-Sama',
            quality: 'HD',
            language: selectedLanguage,
            type: 'streaming',
            serverIndex: 0
          }]
        }));
        
        setEpisodes(formattedEpisodes);
        
        // Sélectionner l'épisode spécifié ou le premier
        if (formattedEpisodes.length > 0) {
          let episodeToSelect = formattedEpisodes[0];
          
          if (targetEpisode) {
            const requestedEpisode = formattedEpisodes.find(
              (ep: any) => ep.episodeNumber === parseInt(targetEpisode)
            );
            if (requestedEpisode) {
              episodeToSelect = requestedEpisode;
            }
          }
          
          setSelectedEpisode(episodeToSelect);
          // Auto-charger l'épisode avec ses sources
          if (autoLoadEpisode && episodeToSelect.streamingSources.length > 0) {
            setEpisodeDetails({
              id: episodeToSelect.id,
              title: episodeToSelect.title,
              animeTitle: animeData.title,
              episodeNumber: episodeToSelect.episodeNumber,
              sources: episodeToSelect.streamingSources,
              availableServers: episodeToSelect.streamingSources.map((s: any) => s.server),
              url: episodeToSelect.url
            });
          }
        }
      } else {
        setError('Aucun épisode trouvé pour cette saison');
      }
    } catch (err) {
      console.error('Erreur chargement épisodes:', err);
      setError('Erreur lors du chargement des épisodes');
    } finally {
      setEpisodeLoading(false);
    }
  };


  // Charger les sources directes via le nouvel endpoint /api/embed JSON
  const loadEpisodeSources = async (episode: Episode) => {
    if (!episode || !animeData) return;
    
    try {
      setEpisodeLoading(true);
      
      console.log('Récupération URLs directes pour épisode:', episode.episodeNumber);
      
      // Appel au nouvel endpoint /api/embed qui retourne du JSON
      const response = await fetch(`/api/embed?url=${encodeURIComponent(episode.url)}`);
      
      if (!response.ok) {
        throw new Error(`Erreur API embed: ${response.status}`);
      }
      
      const embedData = await response.json();
      console.log('URLs directes reçues:', embedData);
      
      if (embedData.success && embedData.sources && embedData.sources.length > 0) {
        // Utiliser les URLs directes extraites par l'API
        setEpisodeDetails({
          id: episode.id,
          title: episode.title,
          animeTitle: animeData.title,
          episodeNumber: episode.episodeNumber,
          sources: embedData.sources,
          availableServers: embedData.sources.map((s: any) => s.server),
          url: episode.url
        });
        setSelectedPlayer(0);
        console.log('URLs directes chargées:', embedData.sources.length, 'sources');
      } else {
        // Fallback vers les sources originales
        console.log('Fallback vers sources originales');
        if (episode.streamingSources && episode.streamingSources.length > 0) {
          setEpisodeDetails({
            id: episode.id,
            title: episode.title,
            animeTitle: animeData.title,
            episodeNumber: episode.episodeNumber,
            sources: episode.streamingSources,
            availableServers: episode.streamingSources.map((s: any) => s.server),
            url: episode.url
          });
          setSelectedPlayer(0);
        } else {
          setError('Aucune source vidéo disponible pour cet épisode');
        }
      }
    } catch (err) {
      console.error('Erreur récupération URLs directes:', err);
      // Fallback vers les sources originales en cas d'erreur
      if (episode.streamingSources && episode.streamingSources.length > 0) {
        setEpisodeDetails({
          id: episode.id,
          title: episode.title,
          animeTitle: animeData.title,
          episodeNumber: episode.episodeNumber,
          sources: episode.streamingSources,
          availableServers: episode.streamingSources.map((s: any) => s.server),
          url: episode.url
        });
        setSelectedPlayer(0);
      } else {
        setError('Erreur lors du chargement des sources vidéo');
      }
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Navigation entre épisodes
  const navigateEpisode = async (direction: 'prev' | 'next') => {
    if (!selectedEpisode) return;
    
    const currentIndex = episodes.findIndex(ep => ep.id === selectedEpisode.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < episodes.length) {
      const newEpisode = episodes[newIndex];
      setSelectedEpisode(newEpisode);
      // ✅ Utiliser l'ID complet de l'épisode
      loadEpisodeSources(newEpisode);
    }
  };

  // Changer de langue
  const changeLanguage = (newLanguage: 'VF' | 'VOSTFR') => {
    setSelectedLanguage(newLanguage);
    if (selectedSeason) {
      // ✅ Recharger les épisodes avec la nouvelle langue
      loadSeasonEpisodes(selectedSeason);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !animeData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl flex items-center gap-2">
          {error}
        </div>
      </div>
    );
  }

  if (!animeData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Anime non trouvé</div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 text-white">
      {/* Header avec bouton retour */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center p-4">
          <Link href={`/anime/${id}`} className="mr-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
            >
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          <h1 className="text-lg font-semibold truncate">{animeData.title}</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Bannière avec titre de la saison */}
        <div className="relative rounded-lg overflow-hidden">
          <div 
            className="h-32 bg-cover bg-center"
            style={{
              backgroundImage: `url(${animeData.image})`,
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute bottom-4 left-4">
            <h2 className="text-white text-2xl font-bold">{animeData.title}</h2>
            <h3 className="text-gray-300 text-lg uppercase">{selectedSeason?.name}</h3>
          </div>
        </div>

        {/* Sélecteur de langue - Style anime-sama */}
        {selectedSeason && selectedSeason.languages.length > 1 && (
          <div className="flex gap-2">
            {selectedSeason.languages.map((lang) => (
              <motion.button
                key={lang}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => changeLanguage(lang as 'VF' | 'VOSTFR')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm border-2 transition-all ${
                  selectedLanguage === lang
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400'
                }`}
              >
                {/* Drapeau selon la langue */}
                {lang === 'VF' ? (
                  <div className="w-6 h-4 bg-white rounded border border-gray-300 flex">
                    <div className="w-1/3 bg-blue-500 rounded-l"></div>
                    <div className="w-1/3 bg-white"></div>
                    <div className="w-1/3 bg-red-500 rounded-r"></div>
                  </div>
                ) : (
                  <div className="w-6 h-4 bg-white rounded border border-gray-300 flex items-center justify-center relative overflow-hidden">
                    <div className="w-4 h-4 bg-red-600 rounded-full absolute"></div>
                    <div className="w-2 h-2 bg-white rounded-full absolute z-10"></div>
                  </div>
                )}
                {lang}
              </motion.button>
            ))}
          </div>
        )}

        {/* Sélecteurs - Style anime-sama */}
        {episodes.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {/* Sélecteur d'épisode */}
            <div className="relative">
              <select
                value={selectedEpisode?.id || ''}
                onChange={(e) => {
                  const episode = episodes.find(ep => ep.id === e.target.value);
                  if (episode) {
                    setSelectedEpisode(episode);
                    loadEpisodeSources(episode);
                  }
                }}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer border-2 border-blue-500 font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {episodes.map((episode) => (
                  <option key={episode.id} value={episode.id}>
                    ÉPISODE {episode.episodeNumber}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" size={20} />
            </div>

            {/* Sélecteur de serveur */}
            {episodeDetails && episodeDetails.sources.length > 0 && (
              <div className="relative">
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(parseInt(e.target.value))}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer border-2 border-blue-500 font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {episodeDetails.sources.map((source, index) => (
                    <option key={`server-${index}-${source.server}`} value={index}>
                      {source.server} ({source.quality})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" size={20} />
              </div>
            )}
          </div>
        )}

        {/* Dernière sélection */}
        {selectedEpisode && (
          <div className="text-gray-300 text-sm">
            <span className="font-bold">DERNIÈRE SÉLECTION :</span> ÉPISODE {selectedEpisode.episodeNumber}
          </div>
        )}

        {/* Navigation entre épisodes - Style anime-sama */}
        {selectedEpisode && (
          <div className="flex justify-center items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateEpisode('prev')}
              disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
              className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Download size={24} className="text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateEpisode('next')}
              disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1}
              className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={24} className="text-white" />
            </motion.button>
          </div>
        )}

        {/* Message d'erreur de pub */}
        {selectedEpisode && (
          <div className="text-center text-gray-300 text-sm italic">
            Pub insistante ou vidéo indisponible ?<br />
            <span className="font-bold">Changez de lecteur.</span>
          </div>
        )}

        {/* Lecteur vidéo - URLs directes via nouvel endpoint /api/embed JSON */}
        {episodeDetails && episodeDetails.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700"
          >
            <div className="aspect-video relative">
              <iframe
                key={`player-${selectedPlayer}-${selectedEpisode?.id}`}
                src={episodeDetails.sources[selectedPlayer]?.url}
                className="w-full h-full"
                allowFullScreen
                frameBorder="0"
                title={`${episodeDetails?.title} - ${episodeDetails.sources[selectedPlayer]?.server}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-top-navigation"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Overlay avec informations de l'épisode */}
              <div className="absolute top-4 left-4 bg-black/70 rounded-lg px-3 py-2">
                <div className="text-white text-sm font-bold">
                  {episodeDetails.animeTitle}
                </div>
                <div className="text-gray-300 text-xs">
                  Épisode {episodeDetails.episodeNumber} • {episodeDetails.sources[selectedPlayer]?.server} • {episodeDetails.sources[selectedPlayer]?.quality}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {episodeLoading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-gray-400">Chargement des épisodes...</div>
          </div>
        )}

        {/* Gestion des erreurs */}
        {error && episodeDetails === null && (
          <div className="text-center py-8">
            <div className="text-red-500 text-lg">{error}</div>
            <div className="text-gray-400 text-sm mt-2">
              Essayez de changer d'épisode ou de langue
            </div>
          </div>
        )}
      </div>
      </div>
    </MainLayout>
  );
};

export default AnimePlayerPage;