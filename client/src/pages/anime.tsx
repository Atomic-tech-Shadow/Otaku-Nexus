import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { ChevronLeft, ChevronRight, ChevronDown, Play, AlertCircle, ArrowLeft, Download } from 'lucide-react';
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
  const filteredEpisodes = Array.isArray(episodes) ? episodes.filter(episode => 
    episode.language.toUpperCase() === selectedLanguage
  ) : [];

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
          <h3 className="text-lg font-semibold mb-4">Saisons et Films</h3>
          <div className="grid grid-cols-1 gap-4">
            {animeData.seasons.map((season) => (
              <motion.button
                key={season.number}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => loadSeasonEpisodes(season)}
                className={`relative overflow-hidden rounded-2xl h-24 group transition-all duration-300 border-4 ${
                  selectedSeason?.number === season.number
                    ? 'border-blue-500 shadow-lg shadow-blue-500/25'
                    : 'border-blue-400 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                {/* Image de fond */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: `url(${animeData.image})`,
                  }}
                />
                {/* Overlay avec gradient sombre */}
                <div className="absolute inset-0 bg-black/60" />
                
                {/* Contenu centré */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="text-center">
                    <div className="text-white font-bold text-lg drop-shadow-lg">
                      {season.name}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Interface de lecture - Style anime-sama.fr */}
        {selectedSeason && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
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
                  <h3 className="text-gray-300 text-lg uppercase">{selectedSeason.name}</h3>
                </div>
              </div>

              {/* Sélecteur de langue - Style anime-sama */}
              {selectedSeason.languages.length > 1 && (
                <div className="flex gap-2">
                  {selectedSeason.languages.map((lang) => (
                    <motion.button
                      key={lang}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => changeLanguage(lang as 'VF' | 'VOSTFR')}
                      className={`px-4 py-2 rounded-lg font-bold text-sm border-2 transition-all ${
                        selectedLanguage === lang
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {lang}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Sélecteurs - Style anime-sama */}
              {filteredEpisodes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sélecteur d'épisode */}
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
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer border-2 border-blue-500 font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {filteredEpisodes.map((episode) => (
                        <option key={episode.id} value={episode.id}>
                          ÉPISODE {episode.episodeNumber}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" size={20} />
                  </div>

                  {/* Sélecteur de serveur */}
                  {currentSources.length > 0 && (
                    <div className="relative">
                      <select
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(Number(e.target.value))}
                        className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer border-2 border-blue-500 font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        {currentSources.map((source, index) => (
                          <option key={index} value={index}>
                            LECTEUR {index + 1}
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
                    disabled={!selectedEpisode || filteredEpisodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
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
                    disabled={!selectedEpisode || filteredEpisodes.findIndex(ep => ep.id === selectedEpisode.id) === filteredEpisodes.length - 1}
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

              {/* Lecteur vidéo - Style anime-sama */}
              {currentSource && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700"
                >
                  <div className="aspect-video relative">
                    <iframe
                      src={currentSource.url}
                      className="w-full h-full"
                      allowFullScreen
                      frameBorder="0"
                      title={`${episodeDetails?.title} - ${currentSource.server}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                    {/* Bouton play overlay pour style anime-sama */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-16 h-16 bg-blue-600/80 rounded-full flex items-center justify-center cursor-pointer"
                      >
                        <Play size={32} className="text-white ml-1" />
                      </motion.div>
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
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AnimePage;