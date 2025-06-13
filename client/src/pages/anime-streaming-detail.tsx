import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Play, Star, Calendar, Languages, List, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface ConsumetAnimeInfo {
  id: string;
  title: string;
  url: string;
  genres: string[];
  totalEpisodes: number;
  image: string;
  releaseDate: string;
  description: string;
  subOrDub: string;
  type: string;
  status: string;
  otherName: string;
  episodes: ConsumetEpisode[];
}

interface ConsumetEpisode {
  id: string;
  number: number;
  url: string;
  title?: string;
}

export default function AnimeStreamingDetailPage() {
  const [match, params] = useRoute("/anime-streaming/:animeId");
  const animeId = params?.animeId;

  const [selectedEpisode, setSelectedEpisode] = useState<ConsumetEpisode | null>(null);

  // Get anime details
  const { data: animeInfo, isLoading } = useQuery<ConsumetAnimeInfo>({
    queryKey: ['/api/anime/streaming', animeId],
    enabled: !!animeId,
  });

  const isFrenchdub = animeInfo?.subOrDub?.toLowerCase().includes('dub') || 
                     animeInfo?.title.toLowerCase().includes('vf');

  if (!animeId) {
    return <div>Anime non trouvé</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!animeInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Anime non trouvé</h1>
          <Link href="/anime-streaming">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Retour à la recherche
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 pb-20">
        {/* Anime Details */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm overflow-hidden">
            <div className="md:flex">
              {/* Anime Image */}
              <div className="md:w-1/3">
                <img 
                  src={animeInfo.image} 
                  alt={animeInfo.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>

              {/* Anime Info */}
              <div className="md:w-2/3 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {animeInfo.title}
                    </h1>
                    {animeInfo.otherName && (
                      <p className="text-gray-400 mb-2">{animeInfo.otherName}</p>
                    )}
                  </div>
                  
                  {isFrenchdub && (
                    <Badge className="bg-green-600/90 text-white border-0 ml-4">
                      <Languages className="w-3 h-3 mr-1" />
                      VF Disponible
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {animeInfo.genres.map((genre) => (
                    <Badge key={genre} variant="outline" className="text-gray-300 border-gray-600">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <p className="text-white">{animeInfo.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Statut:</span>
                    <p className="text-white">{animeInfo.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Épisodes:</span>
                    <p className="text-white">{animeInfo.totalEpisodes}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Date:</span>
                    <p className="text-white">{animeInfo.releaseDate}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-4 line-clamp-4">
                  {animeInfo.description}
                </p>

                <div className="flex gap-4">
                  <Button 
                    onClick={() => setSelectedEpisode(animeInfo.episodes[0])}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!animeInfo.episodes?.length}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Regarder maintenant
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Episodes List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <List className="h-5 w-5" />
                Épisodes ({animeInfo.episodes?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {animeInfo.episodes?.length === 0 ? (
                <p className="text-gray-400">Aucun épisode disponible</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                  {animeInfo.episodes.map((episode) => (
                    <Button
                      key={episode.id}
                      variant={selectedEpisode?.id === episode.id ? "default" : "outline"}
                      className={`h-auto p-3 justify-start ${
                        selectedEpisode?.id === episode.id 
                          ? "bg-purple-600 hover:bg-purple-700" 
                          : "border-gray-600 text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => setSelectedEpisode(episode)}
                    >
                      <div className="text-left">
                        <p className="font-semibold">Épisode {episode.number}</p>
                        {episode.title && (
                          <p className="text-xs opacity-75 truncate">{episode.title}</p>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Video Player */}
        {selectedEpisode && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimeVideoPlayer 
              episodeId={selectedEpisode.id}
              episodeTitle={`${animeInfo.title} - Épisode ${selectedEpisode.number}`}
            />
          </motion.div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

interface AnimeVideoPlayerProps {
  episodeId: string;
  episodeTitle: string;
}

function AnimeVideoPlayer({ episodeId, episodeTitle }: AnimeVideoPlayerProps) {
  const [selectedQuality, setSelectedQuality] = useState<string>("");

  const { data: streamingData, isLoading } = useQuery({
    queryKey: ['/api/anime/episode', episodeId, 'sources'],
    enabled: !!episodeId,
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <LoadingSpinner />
          <p className="text-gray-400 mt-4">Chargement du lecteur vidéo...</p>
        </CardContent>
      </Card>
    );
  }

  if (!streamingData || !streamingData.sources?.length) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Aucune source vidéo disponible pour cet épisode</p>
        </CardContent>
      </Card>
    );
  }

  const selectedSource = selectedQuality 
    ? streamingData.sources.find(s => s.quality === selectedQuality) 
    : streamingData.sources[0];

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {episodeTitle}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Quality Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {streamingData.sources.map((source) => (
            <Button
              key={source.quality}
              variant={selectedQuality === source.quality ? "default" : "outline"}
              size="sm"
              className={
                selectedQuality === source.quality 
                  ? "bg-purple-600 hover:bg-purple-700" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
              }
              onClick={() => setSelectedQuality(source.quality)}
            >
              {source.quality}
            </Button>
          ))}
        </div>

        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            controls
            className="w-full h-auto max-h-96"
            src={selectedSource?.url}
            poster="/api/placeholder/800/450"
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>Source: {selectedSource?.quality} • {selectedSource?.isM3U8 ? 'HLS' : 'Direct'}</p>
        </div>
      </CardContent>
    </Card>
  );
}