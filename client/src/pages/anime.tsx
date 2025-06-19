import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { ChevronLeft, ChevronRight, ChevronDown, Play, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

interface Episode {
  id: string;
  number: number;
  title: string;
  sources: VideoSource[];
}

interface VideoSource {
  id: string;
  name: string;
  url: string;
  language: 'vf' | 'vo';
}

interface Season {
  number: number;
  episodes: Episode[];
}

interface AnimeData {
  id: string;
  title: string;
  coverImage: string;
  seasons: Season[];
}

const AnimePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'vf' | 'vo'>('vf');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL de base de votre API hébergée sur Render
  const API_BASE = 'https://your-api-url.onrender.com';

  // Charger les données de l'anime
  useEffect(() => {
    if (!id) return;
    
    const loadAnimeData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/anime/${id}`);
        if (!response.ok) throw new Error('Erreur lors du chargement de l\'anime');
        
        const data = await response.json();
        setAnimeData(data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur API:', err);
        // Données de test pour la démonstration
        const mockData: AnimeData = {
          id: id || '1',
          title: 'One Piece',
          coverImage: 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg',
          seasons: [
            { number: 1, episodes: [] },
            { number: 2, episodes: [] },
            { number: 3, episodes: [] }
          ]
        };
        setAnimeData(mockData);
        setError('Utilisation des données de test - Configurez votre API Render');
        setLoading(false);
      }
    };

    loadAnimeData();
  }, [id]);

  // Charger les épisodes d'une saison
  const loadSeasonEpisodes = async (seasonNumber: number) => {
    if (!id) return;
    
    setEpisodeLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/anime/${id}/season/${seasonNumber}/episodes`);
      if (!response.ok) throw new Error('Erreur lors du chargement des épisodes');
      
      const episodesData = await response.json();
      setEpisodes(episodesData);
      setSelectedSeason(seasonNumber);
      
      if (episodesData.length > 0) {
        await loadEpisodeSources(episodesData[0].id);
      }
    } catch (err) {
      console.error('Erreur chargement épisodes:', err);
      // Données de test pour les épisodes
      const mockEpisodes: Episode[] = [
        {
          id: `ep-${seasonNumber}-1`,
          number: 1,
          title: `Épisode 1 de la saison ${seasonNumber}`,
          sources: [
            { id: '1', name: 'Lecteur 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', language: 'vf' },
            { id: '2', name: 'Lecteur 2', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', language: 'vf' },
            { id: '3', name: 'Lecteur 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', language: 'vo' }
          ]
        },
        {
          id: `ep-${seasonNumber}-2`,
          number: 2,
          title: `Épisode 2 de la saison ${seasonNumber}`,
          sources: [
            { id: '4', name: 'Lecteur 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', language: 'vf' },
            { id: '5', name: 'Lecteur 2', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', language: 'vo' }
          ]
        }
      ];
      
      setEpisodes(mockEpisodes);
      setSelectedSeason(seasonNumber);
      setSelectedEpisode(mockEpisodes[0]);
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Charger les sources vidéo d'un épisode
  const loadEpisodeSources = async (episodeId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/episode/${episodeId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des sources');
      
      const episodeData = await response.json();
      setSelectedEpisode(episodeData);
      setSelectedPlayer(0);
    } catch (err) {
      console.error('Erreur sources vidéo:', err);
      // Utiliser l'épisode existant dans la liste
      const episode = episodes.find(ep => ep.id === episodeId);
      if (episode) {
        setSelectedEpisode(episode);
        setSelectedPlayer(0);
      }
    }
  };

  // Filtrer les épisodes par langue
  const filteredEpisodes = episodes.filter(episode => 
    episode.sources.some(source => source.language === selectedLanguage)
  );

  // Obtenir les sources du lecteur sélectionné
  const getCurrentSources = () => {
    if (!selectedEpisode) return [];
    return selectedEpisode.sources.filter(source => source.language === selectedLanguage);
  };

  const currentSources = getCurrentSources();
  const currentSource = currentSources[selectedPlayer];

  // Navigation entre épisodes
  const navigateEpisode = (direction: 'prev' | 'next') => {
    if (!selectedEpisode) return;
    
    const currentIndex = filteredEpisodes.findIndex(ep => ep.id === selectedEpisode.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < filteredEpisodes.length) {
      loadEpisodeSources(filteredEpisodes[newIndex].id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
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
          src={animeData.coverImage} 
          alt={animeData.title}
          className="w-full h-48 sm:h-64 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Image+Non+Disponible';
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h2 className="text-xl sm:text-2xl font-bold">{animeData.title}</h2>
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

        {/* Sélection des saisons */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Saisons</h3>
          <div className="flex flex-wrap gap-2">
            {animeData.seasons.map((season) => (
              <motion.button
                key={season.number}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadSeasonEpisodes(season.number)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                  selectedSeason === season.number
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Saison {season.number}
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
              <div>
                <h4 className="text-md font-semibold mb-3">Langue</h4>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedLanguage('vf')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                      selectedLanguage === 'vf'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    VF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedLanguage('vo')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
                      selectedLanguage === 'vo'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    VO
                  </motion.button>
                </div>
              </div>

              {/* Sélecteurs */}
              {filteredEpisodes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sélecteur d'épisode */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Épisode</label>
                    <div className="relative">
                      <select
                        value={selectedEpisode?.id || ''}
                        onChange={(e) => loadEpisodeSources(e.target.value)}
                        className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer min-h-[44px] pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {filteredEpisodes.map((episode) => (
                          <option key={episode.id} value={episode.id}>
                            Épisode {episode.number} - {episode.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* Sélecteur de lecteur */}
                  {currentSources.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Lecteur</label>
                      <div className="relative">
                        <select
                          value={selectedPlayer}
                          onChange={(e) => setSelectedPlayer(Number(e.target.value))}
                          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer min-h-[44px] pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          {currentSources.map((source, index) => (
                            <option key={index} value={index}>
                              Lecteur {index + 1} - {source.name}
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
                      title={`${selectedEpisode?.title} - ${currentSource.name}`}
                    />
                  </div>
                  
                  {/* Message d'aide */}
                  <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm flex items-center">
                      <AlertCircle className="mr-2 flex-shrink-0" size={16} />
                      Pub insistante ou vidéo indisponible ? Changez de lecteur.
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
                        {selectedEpisode && `Épisode ${selectedEpisode.number}`}
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