import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { ArrowLeft, Play, ChevronDown, Calendar, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>('VOSTFR');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [selectedServer, setSelectedServer] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  // Charger les données de l'anime
  useEffect(() => {
    if (!id) return;
    
    const loadAnimeData = async () => {
      try {
        setLoading(true);
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
      
      const apiResponse: ApiResponse<Episode[]> = await response.json();
      
      console.log('Données reçues:', apiResponse);
      
      if (!apiResponse.success || !Array.isArray(apiResponse.data)) {
        throw new Error('Erreur lors du chargement des épisodes');
      }
      
      setEpisodes(apiResponse.data);
      setSelectedSeason(season);
      setSelectedEpisode(null);
      setEpisodeDetails(null);
      setShowPlayer(false);
      
    } catch (err) {
      console.error('Erreur chargement épisodes:', err);
      setError(`Impossible de charger les épisodes de cette saison: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Charger les sources vidéo d'un épisode
  const loadEpisodeSources = async (episode: Episode) => {
    try {
      // Construire l'ID selon le format: {nom-anime}-{numéro-épisode}-{langue}
      const languageCode = selectedLanguage.toLowerCase() === 'vf' ? 'vf' : 'vostfr';
      const episodeId = `${id}-${episode.episodeNumber}-${languageCode}`;
      
      console.log('Chargement épisode avec ID:', episodeId);
      
      const response = await fetch(`/api/episode/${episodeId}`);
      const apiResponse: ApiResponse<EpisodeDetails> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement des sources');
      }
      
      setSelectedEpisode(episode);
      setEpisodeDetails(apiResponse.data);
      setSelectedServer(0);
      setShowPlayer(true);
    } catch (err) {
      console.error('Erreur sources vidéo:', err);
      setError('Impossible de charger les sources vidéo pour cet épisode.');
    }
  };

  // Changer de langue
  const changeLanguage = (newLanguage: 'VF' | 'VOSTFR') => {
    setSelectedLanguage(newLanguage);
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
        <div className="text-red-500 text-xl text-center px-4">
          <div className="mb-4">❌</div>
          <div>{error}</div>
          <Link href="/anime-sama" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">
            ← Retour à la recherche
          </Link>
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
      {/* Header inspiré d'anime-sama.fr */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <Link href="/anime-sama" className="flex items-center text-cyan-400 hover:text-cyan-300">
            <ArrowLeft size={20} className="mr-2" />
            Retour
          </Link>
          <div className="text-lg font-bold text-center flex-1 mx-4">
            {animeData.title}
          </div>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Banner principal inspiré d'anime-sama.fr */}
      <div className="relative h-64 md:h-80">
        <img 
          src={animeData.image} 
          alt={animeData.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Image+Non+Disponible';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
        
        {/* Informations anime style anime-sama.fr */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{animeData.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center text-green-400">
              <Calendar size={16} className="mr-2" />
              {animeData.year}
            </div>
            <div className="flex items-center text-blue-400">
              <Star size={16} className="mr-2" />
              {animeData.status}
            </div>
            <div className="flex items-center text-purple-400">
              <Clock size={16} className="mr-2" />
              {animeData.seasons.length} saison{animeData.seasons.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {animeData.genres.map((genre, index) => (
              <span key={index} className="px-3 py-1 bg-gray-800/80 rounded-full text-sm text-gray-300">
                {genre}
              </span>
            ))}
          </div>

          <p className="text-gray-300 text-sm md:text-base max-w-3xl mb-6">
            {animeData.description}
          </p>

          {/* Boutons d'action comme anime-sama.fr */}
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-medium transition-all">
              <Star size={16} className="mr-2" />
              Favoris
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all">
              <Clock size={16} className="mr-2" />
              Watchlist
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-all">
              ✓ Vu
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Section ANIME avec sagas comme anime-sama.fr */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-white uppercase tracking-wide">ANIME</h2>
          <div className="grid grid-cols-2 gap-4">
            {animeData.seasons.map((season) => (
              <div key={season.number} className="space-y-2">
                {/* Version VOSTFR */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedLanguage('VOSTFR');
                    loadSeasonEpisodes(season);
                  }}
                  disabled={episodeLoading}
                  className={`relative rounded-lg overflow-hidden transition-all w-full ${
                    episodeLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="relative aspect-[3/2]">
                    <img 
                      src={animeData.image} 
                      alt={season.name}
                      className="w-full h-full object-cover brightness-90"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=Season+' + season.number;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-base">
                        {season.name} (VOSTFR)
                      </h3>
                    </div>
                    {selectedSeason?.number === season.number && selectedLanguage === 'VOSTFR' && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </motion.button>

                {/* Version VF */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedLanguage('VF');
                    loadSeasonEpisodes(season);
                  }}
                  disabled={episodeLoading}
                  className={`relative rounded-lg overflow-hidden transition-all w-full ${
                    episodeLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="relative aspect-[3/2]">
                    <img 
                      src={animeData.image} 
                      alt={season.name}
                      className="w-full h-full object-cover brightness-75 sepia"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=Season+' + season.number;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-base">
                        {season.name} (VF)
                      </h3>
                    </div>
                    {selectedSeason?.number === season.number && selectedLanguage === 'VF' && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </motion.button>
              </div>
            ))}
          </div>
        </div>

        {/* Chargement des épisodes */}
        {episodeLoading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-gray-400">Chargement des épisodes...</div>
          </div>
        )}

        {/* Liste des épisodes style anime-sama.fr */}
        {selectedSeason && episodes.length > 0 && !episodeLoading && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              Épisodes - {selectedSeason.name} ({selectedLanguage})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {episodes.map((episode) => (
                <motion.button
                  key={episode.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => loadEpisodeSources(episode)}
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center font-bold text-lg transition-all ${
                    selectedEpisode?.id === episode.id
                      ? 'border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                      : episode.available
                      ? 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                      : 'border-gray-700 bg-gray-900 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!episode.available}
                >
                  {episode.episodeNumber}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Lecteur vidéo style anime-sama.fr */}
        <AnimatePresence>
          {showPlayer && selectedEpisode && episodeDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/50 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4">
                Lecture - Épisode {selectedEpisode.episodeNumber}: {selectedEpisode.title}
              </h2>
              
              {/* Sélection du serveur */}
              {episodeDetails.sources.length > 1 && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2 text-gray-400">Lecteur:</div>
                  <div className="flex gap-2 flex-wrap">
                    {episodeDetails.sources.map((source, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedServer(index)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                          selectedServer === index
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {source.server}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Iframe du lecteur */}
              <div className="bg-black rounded-lg overflow-hidden">
                <iframe
                  src={episodeDetails.sources[selectedServer]?.url}
                  className="w-full h-64 md:h-96"
                  frameBorder="0"
                  allowFullScreen
                  title={`${animeData.title} - Épisode ${selectedEpisode.episodeNumber}`}
                />
              </div>

              {/* Informations du lecteur */}
              <div className="mt-4 text-sm text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Qualité: {episodeDetails.sources[selectedServer]?.quality}</span>
                  <span>Langue: {episodeDetails.sources[selectedServer]?.language}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimeDetailPage;