import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize,
  ArrowLeft,
  Settings,
  Download
} from "lucide-react";

interface EpisodeSource {
  url: string;
  server: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
}

interface EpisodeDetails {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  language: string;
  sources: EpisodeSource[];
  availableServers: string[];
  url: string;
}

export default function WatchPage() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedServer, setSelectedServer] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch episode details and streaming sources
  const { data: episode, isLoading, error } = useQuery<EpisodeDetails>({
    queryKey: ['/api/episode', episodeId],
    enabled: !!episodeId,
  });

  // Update watching progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: {
      animeId: number;
      episodeId: number;
      currentEpisode: number;
      watchedMinutes: number;
      status: string;
    }) => {
      const response = await fetch('/api/anime/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(progressData),
      });
      if (!response.ok) throw new Error('Failed to update progress');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/anime/progress'] });
    },
  });

  const handleServerChange = (serverIndex: number) => {
    setSelectedServer(serverIndex);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const updateWatchingProgress = () => {
    if (episode && currentTime > 0) {
      const watchedMinutes = Math.floor(currentTime / 60);
      // Extract anime info from episode data to update progress
      // This would need the actual anime ID from the episode details
      updateProgressMutation.mutate({
        animeId: 1, // This should come from episode data
        episodeId: 1, // This should come from episode data
        currentEpisode: episode.episodeNumber,
        watchedMinutes,
        status: watchedMinutes > duration * 0.9 ? 'completed' : 'watching',
      });
    }
  };

  // Update progress every 30 seconds
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(updateWatchingProgress, 30000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTime, duration, episode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Épisode introuvable</h1>
          <p className="text-gray-400 mb-4">
            Cet épisode n'est pas disponible ou n'existe pas.
          </p>
          <Button onClick={() => setLocation('/anime-streaming')}>
            Retour au catalogue
          </Button>
        </div>
      </div>
    );
  }

  const currentSource = episode.sources[selectedServer];

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/anime-streaming')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{episode.animeTitle}</h1>
              <p className="text-gray-400">
                Épisode {episode.episodeNumber} - {episode.title}
              </p>
            </div>
          </div>
          <Badge className="bg-electric-blue">
            {episode.language}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-700 overflow-hidden">
              <div className="relative aspect-video bg-black">
                {currentSource ? (
                  <iframe
                    src={currentSource.url}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={`${episode.animeTitle} - Épisode ${episode.episodeNumber}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Play className="h-16 w-16 mx-auto mb-4" />
                      <p>Aucune source de streaming disponible</p>
                    </div>
                  </div>
                )}

                {/* Custom Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>

                    <div className="flex items-center space-x-2 text-sm">
                      <span>{formatTime(currentTime)}</span>
                      <span>/</span>
                      <span>{formatTime(duration)}</span>
                    </div>

                    <div className="flex-1">
                      <div className="bg-gray-600 h-1 rounded-full">
                        <div 
                          className="bg-electric-blue h-1 rounded-full transition-all"
                          style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVolumeToggle}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Episode Info */}
            <Card className="bg-gray-900 border-gray-700 mt-4">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  {episode.animeTitle} - Épisode {episode.episodeNumber}
                </h2>
                <h3 className="text-lg text-gray-300 mb-4">{episode.title}</h3>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Qualité: {currentSource?.quality || 'HD'}</span>
                  <span>Serveur: {currentSource?.server || 'Principal'}</span>
                  <span>Langue: {episode.language}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Server Selection */}
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Serveurs de streaming
                </h3>
                <div className="space-y-2">
                  {episode.sources.map((source, index) => (
                    <Button
                      key={index}
                      variant={selectedServer === index ? "default" : "outline"}
                      className={`w-full justify-start ${
                        selectedServer === index ? "bg-electric-blue" : ""
                      }`}
                      onClick={() => handleServerChange(index)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{source.server}</span>
                        <Badge variant="secondary" className="text-xs">
                          {source.quality}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
                
                {episode.availableServers.length > episode.sources.length && (
                  <div className="mt-3 text-sm text-gray-400">
                    Autres serveurs: {episode.availableServers.slice(episode.sources.length).join(", ")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Download Options */}
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Téléchargement
                </h3>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Télécharger l'épisode
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Téléchargez pour regarder hors ligne
                </p>
              </CardContent>
            </Card>

            {/* Episode Navigation */}
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3">Navigation</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    disabled={episode.episodeNumber <= 1}
                  >
                    <SkipBack className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    Suivant
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Watch Progress */}
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3">Progression</h3>
                <div className="space-y-2">
                  <div className="bg-gray-700 h-2 rounded-full">
                    <div 
                      className="bg-electric-blue h-2 rounded-full transition-all"
                      style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Regardé: {formatTime(currentTime)}</span>
                    <span>{duration > 0 ? Math.round((currentTime / duration) * 100) : 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}