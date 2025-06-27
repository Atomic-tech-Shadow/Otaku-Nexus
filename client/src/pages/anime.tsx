import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { ChevronLeft, ChevronRight, ChevronDown, Play, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
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
  languages: string[];
  episodeCount: number;
  url: string;
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: any;
}

const AnimePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>('VOSTFR');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utiliser notre proxy local qui a une logique de fallback robuste
  const API_BASE = '';

  // Charger les données de l'anime
  useEffect(() => {
    if (!id) return;
    
    const loadAnimeData = async () => {
      try {
        console.log('Chargement données anime pour ID:', id);
        const response = await fetch(`/api/anime/${id}`);
        console.log('Réponse anime status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const apiResponse: ApiResponse<AnimeData> = await response.json();
        console.log('Données anime reçues:', apiResponse);
        
        if (!apiResponse.success) {
          throw new Error('Erreur lors du chargement de l\'anime');
        }
        
        setAnimeData(apiResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur API:', err);
        setError(`Impossible de charger les données de l'anime: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        setLoading(false);
      }
    };

    loadAnimeData();
  }, [id]);

  // Charger les épisodes d'une saison
  const loadSeasonEpisodes = async (season: Season) => {
    if (!id) return;
    
    setEpisodeLoading(true);
    setError(null);
    try {
      const language = selectedLanguage.toLowerCase();
      console.log('Chargement épisodes pour:', { animeId: id, season: season.number, language });
      
      const response = await fetch(`/api/seasons?animeId=${id}&season=${season.number}&language=${language}`);
      console.log('Réponse status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse: ApiResponse<{
        animeId: string;
        season: number;
        language: string;
        episodes: Episode[];
        episodeCount: number;
      }> = await response.json();
      
      console.log('Données reçues:', apiResponse);
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement des épisodes');
      }
      
      setEpisodes(apiResponse.data.episodes);
      setSelectedSeason(season);
      
      // Sélectionner automatiquement le premier épisode
      if (apiResponse.data.episodes.length > 0) {
        const firstEpisode = apiResponse.data.episodes[0];
        setSelectedEpisode(firstEpisode);
        await loadEpisodeSources(firstEpisode.episodeNumber, selectedLanguage);
      }
    } catch (err) {
      console.error('Erreur chargement épisodes:', err);
      setError(`Impossible de charger les épisodes de cette saison: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Charger les sources vidéo d'un épisode avec le nouveau format d'ID
  const loadEpisodeSources = async (episodeNumber: number, language: string) => {
    try {
      // Construire l'ID selon le format: {nom-anime}-{numéro-épisode}-{langue}
      const languageCode = language.toLowerCase() === 'vf' ? 'vf' : 'vostfr';
      const episodeId = `${id}-${episodeNumber}-${languageCode}`;
      
      console.log('Chargement épisode avec ID:', episodeId);
      
      const response = await fetch(`/api/episode/${episodeId}`);
      const apiResponse: ApiResponse<EpisodeDetails> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement des sources');
      }
      
      setEpisodeDetails(apiResponse.data);
      setSelectedPlayer(0); // Reset au premier lecteur
    } catch (err) {
      console.error('Erreur sources vidéo:', err);
      setError('Impossible de charger les sources vidéo pour cet épisode.');
    }
  };

  // Filtrer les épisodes par langue
  const filteredEpisodes = episodes.filter(episode => 
    episode.language.toUpperCase() === selectedLanguage
  );

  // Obtenir les sources du lecteur sélectionné
  const getCurrentSources = () => {
    if (!episodeDetails) return [];
    return episodeDetails.sources.filter(source => 
      source.language.toUpperCase() === selectedLanguage
    );
  };

  const currentSources = getCurrentSources();
  const currentSource = currentSources[selectedPlayer];

  // Navigation entre épisodes
  const navigateEpisode = async (direction: 'prev' | 'next') => {
    if (!selectedEpisode) return;
    
    const currentIndex = filteredEpisodes.findIndex(ep => ep.id === selectedEpisode.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < filteredEpisodes.length) {
      const newEpisode = filteredEpisodes[newIndex];
      setSelectedEpisode(newEpisode);
      await loadEpisodeSources(newEpisode.episodeNumber, selectedLanguage);
    }
  };

  // Changer de langue
  const changeLanguage = (newLanguage: 'VF' | 'VOSTFR') => {
    setSelectedLanguage(newLanguage);
    // Recharger les épisodes si une saison est sélectionnée
    if (selectedSeason) {
      loadSeasonEpisodes(selectedSeason);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !animeData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl flex items-center gap-2">
          <AlertCircle size={24} />
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header avec bouton retour */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center p-4">
          <Link href="/" className="mr-4">
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

      {/* Banner de l'anime */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent z-10" />
        <img 
          src={animeData.image} 
          alt={animeData.title}
          className="w-full h-48 sm:h-64 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Image+Non+Disponible';
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h2 className="text-xl sm:text-2xl font-bold">{animeData.title}</h2>
          <p className="text-gray-300 text-sm mt-1">{animeData.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {animeData.genres.map((genre, index) => (
              <span key={index} className="px-2 py-1 bg-gray-800/80 rounded text-xs">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Message d'erreur/info */}
        {error && (
          <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3">
            <p className="text-yellow-200 text-sm flex items-center">
              <AlertCircle className="mr-2 flex-shrink-0" size={16} />
              {error}
            </p>
          </div>
        )}

        {/* Informations de l'anime */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Statut:</span>
              <span className="ml-2 text-white">{animeData.status}</span>
            </div>
            <div>
              <span className="text-gray-400">Année:</span>
              <span className="ml-2 text-white">{animeData.year}</span>
            </div>
          </div>
        </div>

        {/* Sélection des saisons */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Saisons et Films</h3>
          <div className="flex flex-wrap gap-2">
            {animeData.seasons.map((season) => (
              <motion.button
                key={season.number}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadSeasonEpisodes(season)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] text-center ${
                  selectedSeason?.number === season.number
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-sm">{season.name}</div>
                <div className="text-xs opacity-75">
                  {season.languages.join(' / ')}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Interface de lecture */}
        {selectedSeason && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Boutons VO/VF */}
              {selectedSeason.languages.length > 1 && (
                <div>
                  <h4 className="text-md font-semibold mb-3">Langue</h4>
                  <div className="flex gap-2">
                    {selectedSeason.languages.map((lang) => (
                      <motion.button
                        key={lang}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => changeLanguage(lang as 'VF' | 'VOSTFR')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                          selectedLanguage === lang
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {lang}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sélecteurs */}
              {filteredEpisodes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sélecteur d'épisode */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Épisode</label>
                    <div className="relative">
                      <select
                        value={selectedEpisode?.id || ''}
                        onChange={(e) => {
                          const episode = filteredEpisodes.find(ep => ep.id === e.target.value);
                          if (episode) {
                            setSelectedEpisode(episode);
                            loadEpisodeSources(episode.episodeNumber, selectedLanguage);
                          }
                        }}
                        className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer min-h-[44px] pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {filteredEpisodes.map((episode) => (
                          <option key={episode.id} value={episode.id}>
                            Épisode {episode.episodeNumber} - {episode.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* Sélecteur de lecteur */}
                  {currentSources.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Serveur</label>
                      <div className="relative">
                        <select
                          value={selectedPlayer}
                          onChange={(e) => setSelectedPlayer(Number(e.target.value))}
                          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer min-h-[44px] pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          {currentSources.map((source, index) => (
                            <option key={index} value={index}>
                              {source.server} - {source.quality}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lecteur vidéo */}
              {currentSource && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={currentSource.url}
                      className="w-full h-64 sm:h-80 md:h-96"
                      allowFullScreen
                      frameBorder="0"
                      title={`${episodeDetails?.title} - ${currentSource.server}`}
                    />
                  </div>
                  
                  {/* Message d'aide */}
                  <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm flex items-center">
                      <AlertCircle className="mr-2 flex-shrink-0" size={16} />
                      Pub insistante ou vidéo indisponible ? Changez de serveur.
                    </p>
                  </div>

                  {/* Navigation entre épisodes */}
                  <div className="flex justify-center items-center gap-6 py-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigateEpisode('prev')}
                      disabled={!selectedEpisode || filteredEpisodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
                      className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </motion.button>
                    
                    <div className="text-center">
                      <Play className="mx-auto mb-1 text-cyan-400" size={24} />
                      <p className="text-sm text-gray-400">
                        {selectedEpisode && `Épisode ${selectedEpisode.episodeNumber}`}
                      </p>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigateEpisode('next')}
                      disabled={!selectedEpisode || filteredEpisodes.findIndex(ep => ep.id === selectedEpisode.id) === filteredEpisodes.length - 1}
                      className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={24} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {episodeLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <div className="text-gray-400">Chargement des épisodes...</div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AnimePage;