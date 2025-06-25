import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Eye, Bookmark, Play, Download, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

interface AnimeDetails {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
  description?: string;
  genres?: string[];
  year?: string;
  progressInfo?: {
    advancement: string;
    correspondence: string;
    totalEpisodes: number;
    hasFilms: boolean;
    hasScans: boolean;
  };
  seasons?: AnimeSeason[];
}

interface AnimeSeason {
  number: number;
  name: string;
  languages: string[];
  episodeCount: number;
  url: string;
}

interface AnimeEpisode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
  players?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: any;
}

const AnimeDetailPage: React.FC<{ animeId: string }> = ({ animeId }) => {
  const [, setLocation] = useLocation();
  const [animeData, setAnimeData] = useState<AnimeDetails | null>(null);
  const [episodes, setEpisodes] = useState<AnimeEpisode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'vf' | 'vostfr'>('vostfr');
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  // Load anime details
  useEffect(() => {
    const loadAnimeDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/anime/${animeId}`);
        const apiResponse: ApiResponse<AnimeDetails> = await response.json();
        
        if (!apiResponse.success) {
          throw new Error('Failed to load anime details');
        }
        
        setAnimeData(apiResponse.data);
      } catch (err) {
        setError('Erreur lors du chargement de l\'anime');
        console.error('Anime detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnimeDetails();
  }, [animeId]);

  // Load episodes for selected season and language
  useEffect(() => {
    if (!animeData) return;

    const loadEpisodes = async () => {
      try {
        setEpisodesLoading(true);
        const response = await fetch(`/api/anime/${animeId}/season/${selectedSeason}/episodes?language=${selectedLanguage}`);
        const apiResponse: ApiResponse<AnimeEpisode[]> = await response.json();
        
        if (apiResponse.success) {
          setEpisodes(apiResponse.data);
          if (apiResponse.data.length > 0 && apiResponse.data[0].players) {
            setSelectedPlayer(apiResponse.data[0].players[0]);
          }
        }
      } catch (err) {
        console.error('Episodes error:', err);
        setEpisodes([]);
      } finally {
        setEpisodesLoading(false);
      }
    };

    loadEpisodes();
  }, [animeId, selectedSeason, selectedLanguage, animeData]);

  const handleWatchEpisode = async () => {
    if (!episodes.length || !selectedPlayer) return;

    const currentEpisode = episodes.find(ep => ep.episodeNumber === selectedEpisode);
    if (!currentEpisode) return;

    try {
      const response = await fetch(`/api/episode/${currentEpisode.id}`);
      const apiResponse: ApiResponse<{ streamUrl: string }> = await response.json();
      
      if (apiResponse.success) {
        setCurrentVideoUrl(apiResponse.data.streamUrl);
        setShowPlayer(true);
      }
    } catch (err) {
      console.error('Failed to load video:', err);
    }
  };

  const navigateEpisode = (direction: 'prev' | 'next') => {
    const currentIndex = episodes.findIndex(ep => ep.episodeNumber === selectedEpisode);
    let newIndex;
    
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < episodes.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }
    
    setSelectedEpisode(episodes[newIndex].episodeNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  if (error || !animeData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error || 'Anime non trouvé'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800">
        <button
          onClick={() => setLocation('/anime-search')}
          className="mr-4 p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold truncate">{animeData.title}</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Anime Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg overflow-hidden"
        >
          {/* Anime Image */}
          <div className="w-full h-56 bg-gray-700 relative">
            <img
              src={animeData.image}
              alt={animeData.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x220?text=Image+non+disponible';
              }}
            />
          </div>
          
          {/* Anime Details */}
          <div className="p-4 space-y-3">
            <h2 className="text-xl font-bold">{animeData.title}</h2>
            
            {animeData.progressInfo && (
              <p className="text-sm text-gray-400">
                {animeData.progressInfo.advancement}
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                <Heart size={16} />
                Favoris
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                <Bookmark size={16} />
                Watchlist
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                <Eye size={16} />
                Vu
              </button>
            </div>
          </div>
        </motion.div>

        {/* Seasons Grid */}
        {animeData.seasons && animeData.seasons.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold">Saisons</h3>
            <div className="grid grid-cols-2 gap-2">
              {animeData.seasons.map((season) => (
                <button
                  key={season.number}
                  onClick={() => setSelectedSeason(season.number)}
                  className={`p-4 rounded-xl text-center font-medium transition-all ${
                    selectedSeason === season.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-sm font-bold">{season.name}</div>
                  <div className="text-xs opacity-80">{season.episodeCount} épisodes</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Language Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold">Langue</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="language"
                value="vostfr"
                checked={selectedLanguage === 'vostfr'}
                onChange={(e) => setSelectedLanguage(e.target.value as 'vostfr')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">VOSTFR</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="language"
                value="vf"
                checked={selectedLanguage === 'vf'}
                onChange={(e) => setSelectedLanguage(e.target.value as 'vf')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">VF</span>
            </label>
          </div>
        </motion.div>

        {/* Episode and Player Selection */}
        {episodes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex gap-2">
              {/* Episode Selector */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Épisode</label>
                <select
                  value={selectedEpisode}
                  onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {episodes.map((episode) => (
                    <option key={episode.episodeNumber} value={episode.episodeNumber}>
                      Épisode {episode.episodeNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Player Selector */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Lecteur</label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {episodes.find(ep => ep.episodeNumber === selectedEpisode)?.players?.map((player, index) => (
                    <option key={index} value={player}>
                      Lecteur {index + 1}
                    </option>
                  )) || <option value="">Aucun lecteur</option>}
                </select>
              </div>
            </div>

            {/* Watch Button */}
            <button
              onClick={handleWatchEpisode}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <Play size={20} />
              Regarder
            </button>

            {/* Navigation Buttons */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => navigateEpisode('prev')}
                disabled={episodes.findIndex(ep => ep.episodeNumber === selectedEpisode) === 0}
                className="w-16 h-16 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              
              <button className="w-16 h-16 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                <Download size={20} className="text-white" />
              </button>
              
              <button
                onClick={() => navigateEpisode('next')}
                disabled={episodes.findIndex(ep => ep.episodeNumber === selectedEpisode) === episodes.length - 1}
                className="w-16 h-16 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Video Player */}
        <AnimatePresence>
          {showPlayer && currentVideoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Lecture en cours</h3>
                <button
                  onClick={() => setShowPlayer(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="bg-black rounded-lg overflow-hidden">
                <iframe
                  src={currentVideoUrl}
                  className="w-full h-56 md:h-80"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {episodesLoading && (
          <div className="text-center py-4">
            <div className="text-gray-400">Chargement des épisodes...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeDetailPage;