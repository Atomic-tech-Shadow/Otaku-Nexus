import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  Play, 
  Star, 
  Calendar, 
  Eye, 
  Grid, 
  List, 
  ChevronLeft, 
  Languages,
  Monitor,
  Volume2,
  Settings,
  X,
  ArrowRight,
  Filter,
  Shuffle
} from "lucide-react";

// Interfaces pour l'API Anime-Sama
interface AnimeSamaSearchResult {
  id: string;
  title: string;
  image: string;
  type: string;
  status: string;
  url: string;
}

interface AnimeSamaAnime {
  id: string;
  title: string;
  description: string;
  image: string;
  genres: string[];
  status: string;
  year: string;
  seasons: AnimeSamaSeason[];
  url: string;
}

interface AnimeSamaSeason {
  number: number;
  name: string;
  languages: string[];
  episodeCount: number;
  url: string;
}

interface AnimeSamaEpisode {
  id: string;
  number: number;
  title?: string;
  url: string;
  servers: string[];
}

interface EpisodeSource {
  url: string;
  server: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
}

interface StreamingData {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  sources: EpisodeSource[];
  availableServers: string[];
  url: string;
}

export default function AnimePage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/anime/:id");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<AnimeSamaEpisode | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'vf' | 'vostfr'>('vostfr');
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedServer, setSelectedServer] = useState(0);

  // Recherche d'animes
  const { data: searchResults = [], isLoading: searchLoading } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/anime/search', searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/anime/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Erreur lors de la recherche');
      return response.json();
    },
    enabled: searchQuery.length > 2,
  });

  // Catalogue d'animes (affichés par défaut)
  const { data: catalogueAnimes = [], isLoading: catalogueLoading } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/anime/catalogue', selectedGenre, selectedType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedGenre !== "all") params.append('genre', selectedGenre);
      if (selectedType !== "all") params.append('type', selectedType);
      
      const response = await fetch(`/api/anime/catalogue?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement du catalogue');
      return response.json();
    },
    enabled: !searchQuery && !match,
  });

  // Animes tendances
  const { data: trendingAnimes = [], isLoading: trendingLoading } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/anime/trending'],
    queryFn: async () => {
      const response = await fetch('/api/anime/trending');
      if (!response.ok) throw new Error('Erreur lors du chargement des tendances');
      return response.json();
    },
    enabled: !searchQuery && !match,
  });

  // Détails de l'anime sélectionné
  const { data: animeDetails, isLoading: animeLoading } = useQuery<AnimeSamaAnime>({
    queryKey: ['/api/anime', params?.id],
    queryFn: async () => {
      const response = await fetch(`/api/anime/${params?.id}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des détails');
      return response.json();
    },
    enabled: !!params?.id,
  });

  // Episodes de la saison sélectionnée
  const { data: seasonEpisodes = [], isLoading: episodesLoading } = useQuery<AnimeSamaEpisode[]>({
    queryKey: ['/api/anime', params?.id, 'season', selectedSeason, 'episodes'],
    queryFn: async () => {
      const response = await fetch(`/api/anime/${params?.id}/season/${selectedSeason}/episodes`);
      if (!response.ok) throw new Error('Erreur lors du chargement des épisodes');
      return response.json();
    },
    enabled: !!params?.id && !!selectedSeason,
  });

  // Données de streaming
  const { data: streamingData, isLoading: streamingLoading } = useQuery<StreamingData>({
    queryKey: ['/api/anime/episode', selectedEpisode?.id, 'streaming'],
    queryFn: async () => {
      const response = await fetch(`/api/anime/episode/${selectedEpisode?.id}/streaming`);
      if (!response.ok) throw new Error('Erreur lors du chargement des liens');
      return response.json();
    },
    enabled: !!selectedEpisode?.id,
  });

  // Genres disponibles
  const { data: genres = [] } = useQuery<string[]>({
    queryKey: ['/api/anime/genres'],
    queryFn: async () => {
      const response = await fetch('/api/anime/genres');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const handleAnimeSelect = (anime: AnimeSamaSearchResult) => {
    setLocation(`/anime/${anime.id}`);
  };

  const handleEpisodeSelect = (episode: AnimeSamaEpisode) => {
    setSelectedEpisode(episode);
    setShowPlayer(true);
    setSelectedServer(0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Mise à jour automatique de la saison quand l'anime change
  useEffect(() => {
    if (animeDetails?.seasons?.length) {
      setSelectedSeason(animeDetails.seasons[0].number);
    }
  }, [animeDetails]);

  // Composant carte anime avec design otaku moderne
  const AnimeCard = ({ anime }: { anime: AnimeSamaSearchResult }) => (
    <div 
      className="group relative bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 border border-purple-500/30 hover:border-cyan-400/70 transition-all duration-500 cursor-pointer overflow-hidden rounded-2xl backdrop-blur-xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105"
      onClick={() => handleAnimeSelect(anime)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
        {/* Image avec effet néon */}
        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:brightness-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/1a1a2e/ffffff?text=ANIME';
          }}
        />
        
        {/* Overlay avec effet holographique */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-900/30 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Particules animées */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Type badge avec effet néon */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-sm animate-pulse" />
            <Badge className="relative bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xs font-bold border-0 shadow-lg">
              {anime.type}
            </Badge>
          </div>
        </div>

        {/* Rating stars (fake) */}
        <div className="absolute top-3 left-3 flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} 
            />
          ))}
        </div>

        {/* Play button avec effet cyberpunk */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full blur-lg animate-pulse" />
            <Button size="lg" className="relative bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white shadow-2xl border border-cyan-400/50 transform hover:scale-110 transition-all duration-300">
              <Play className="w-6 h-6 mr-2 drop-shadow-lg" />
              <span className="font-bold">WATCH</span>
            </Button>
          </div>
        </div>

        {/* Scan lines effet */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
             style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)' }} />
      </div>

      {/* Info section avec design futuriste */}
      <div className="p-4 bg-gradient-to-r from-gray-900/90 via-purple-900/50 to-gray-900/90 backdrop-blur-sm">
        <h3 className="text-white font-bold text-sm mb-3 line-clamp-2 drop-shadow-lg bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          {anime.title}
        </h3>
        
        <div className="flex justify-between items-center">
          <Badge 
            className={`text-xs font-semibold border-0 ${
              anime.status === 'En cours' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25' : 
              anime.status === 'Terminé' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25' : 
                'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
            }`}
          >
            {anime.status}
          </Badge>
          
          <div className="flex items-center space-x-1 text-yellow-400">
            <Eye className="w-3 h-3" />
            <span className="text-xs font-medium">{Math.floor(Math.random() * 1000)}K</span>
          </div>
        </div>

        {/* Progress bar animée */}
        <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
        </div>
      </div>

      {/* Effet de lueur sur les bords */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{ 
             boxShadow: 'inset 0 0 20px rgba(0,255,255,0.3), inset 0 0 40px rgba(255,0,255,0.1)',
           }} />
    </div>
  );

  // Composant lecteur vidéo cyberpunk
  const VideoPlayer = () => {
    if (!streamingData || !streamingData.sources?.length) {
      return (
        <div className="w-full h-96 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl flex items-center justify-center border border-red-500/30">
          <div className="text-center text-white">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full opacity-20 animate-ping" />
              <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 rounded-full w-full h-full flex items-center justify-center border border-red-500/50">
                <Monitor className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
              NO STREAMING SERVERS
            </h3>
            <p className="text-gray-400">This episode is currently unavailable</p>
          </div>
        </div>
      );
    }

    const currentSource = streamingData.sources[selectedServer];

    return (
      <div className="w-full space-y-6">
        {/* Contrôles serveur cyberpunk */}
        <div className="bg-gradient-to-r from-gray-900/80 via-purple-900/30 to-gray-900/80 rounded-2xl p-6 border border-cyan-500/30 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-sm animate-pulse" />
                <div className="relative w-8 h-8 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-white font-bold text-lg">STREAMING SERVERS</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {streamingData.sources.map((source, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  selectedServer === index 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500' 
                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                }`} />
                <Button
                  variant="ghost"
                  onClick={() => setSelectedServer(index)}
                  className={`relative px-6 py-3 rounded-xl font-bold transition-all duration-300 border ${
                    selectedServer === index 
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white border-cyan-400/50 shadow-lg shadow-cyan-500/25' 
                      : 'bg-gray-800/50 text-gray-300 border-gray-600/50 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>{source.server}</span>
                    <Badge className={`ml-2 text-xs ${
                      selectedServer === index ? 'bg-white/20' : 'bg-gray-600'
                    }`}>
                      {source.quality}
                    </Badge>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Lecteur iframe cyberpunk */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl">
            <iframe
              src={currentSource.url}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={`${streamingData.animeTitle} - ${streamingData.title}`}
            />
            
            {/* Scan lines effect */}
            <div className="absolute inset-0 pointer-events-none opacity-30"
                 style={{ 
                   backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)'
                 }} />
          </div>
        </div>

        {/* Info épisode cyberpunk */}
        <div className="bg-gradient-to-r from-gray-900/90 via-purple-900/40 to-gray-900/90 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
                {streamingData.animeTitle}
              </h3>
              <h4 className="text-lg text-white font-semibold mb-4">
                {streamingData.title}
              </h4>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-gray-300">Episode</span>
                  <span className="text-cyan-400 font-bold">{streamingData.episodeNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Language</span>
                  <span className="text-purple-400 font-bold">{currentSource.language.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-pink-400" />
                  <span className="text-gray-300">Quality</span>
                  <span className="text-pink-400 font-bold">{currentSource.quality}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-sm animate-pulse" />
                <div className="relative w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center border border-green-400/50">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full w-0 animate-[progress_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  };

  // Page de détails d'un anime
  if (match && params?.id) {
    if (animeLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="p-6">
            <Skeleton className="w-full h-64 mb-6 bg-gray-800" />
            <Skeleton className="h-8 w-1/2 mb-4 bg-gray-800" />
            <Skeleton className="h-4 w-full mb-2 bg-gray-800" />
            <Skeleton className="h-4 w-3/4 mb-6 bg-gray-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-48 bg-gray-800" />
              <Skeleton className="h-48 bg-gray-800" />
            </div>
          </div>
        </div>
      );
    }

    if (!animeDetails) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Anime non trouvé</h2>
            <Button onClick={() => setLocation('/anime')} className="bg-sky-600 hover:bg-sky-700">
              Retour au catalogue
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Header avec image de fond */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={animeDetails.image}
            alt={animeDetails.title}
            className="w-full h-full object-cover blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          
          {/* Navigation */}
          <div className="absolute top-6 left-6">
            <Button
              variant="ghost"
              onClick={() => setLocation('/anime')}
              className="text-white hover:bg-white/20 border border-white/30"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour au catalogue
            </Button>
          </div>

          {/* Informations de l'anime */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                {animeDetails.title}
              </h1>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge className="bg-sky-600 text-white">
                  <Calendar className="w-3 h-3 mr-1" />
                  {animeDetails.year}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white">
                  {animeDetails.status}
                </Badge>
                {animeDetails.genres.map((genre, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-700/80 text-white">
                    {genre}
                  </Badge>
                ))}
              </div>
              <p className="text-gray-200 text-lg max-w-4xl leading-relaxed drop-shadow-lg">
                {animeDetails.description}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-6xl mx-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des épisodes */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Épisodes
                    </CardTitle>
                    {animeDetails.seasons.length > 1 && (
                      <Select value={selectedSeason.toString()} onValueChange={(value) => setSelectedSeason(parseInt(value))}>
                        <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {animeDetails.seasons.map((season) => (
                            <SelectItem key={season.number} value={season.number.toString()}>
                              {season.name} ({season.episodeCount} épisodes)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {episodesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 bg-gray-800" />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {seasonEpisodes.map((episode) => (
                          <div
                            key={episode.id}
                            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                            onClick={() => handleEpisodeSelect(episode)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {episode.number}
                              </div>
                              <div>
                                <h4 className="text-white font-medium">{episode.title}</h4>
                                <p className="text-gray-400 text-sm">
                                  {episode.servers.join(', ')}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" className="bg-sky-600 hover:bg-sky-700">
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Informations supplémentaires */}
            <div>
              <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-1">Statut</h4>
                    <p className="text-white">{animeDetails.status}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-1">Année</h4>
                    <p className="text-white">{animeDetails.year}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-1">Genres</h4>
                    <div className="flex flex-wrap gap-1">
                      {animeDetails.genres.map((genre, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-700 text-white text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-1">Saisons</h4>
                    <p className="text-white">{animeDetails.seasons.length}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm font-medium mb-1">Total épisodes</h4>
                    <p className="text-white">
                      {animeDetails.seasons.reduce((total, season) => total + season.episodeCount, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Modal lecteur vidéo */}
        <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
          <DialogContent className="max-w-6xl w-[95vw] bg-gray-900 border-gray-700">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle className="text-white">
                  {selectedEpisode && `${animeDetails.title} - Épisode ${selectedEpisode.number}`}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlayer(false)}
                  className="text-white hover:bg-gray-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>
            {streamingLoading ? (
              <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
                  <p>Chargement du lecteur...</p>
                </div>
              </div>
            ) : (
              <VideoPlayer />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Page principale du catalogue
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Arrière-plan animé cyberpunk */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-pink-900/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern cyberpunk */}
        <div className="absolute inset-0 opacity-30"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
               `,
               backgroundSize: '50px 50px'
             }} />
      </div>

      {/* Header futuriste */}
      <div className="relative z-40 bg-gradient-to-r from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border-b border-cyan-500/30 sticky top-0">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5" />
        
        <div className="relative max-w-7xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Logo cyberpunk */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-lg animate-pulse" />
                <div className="relative w-14 h-14 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl flex items-center justify-center border border-cyan-400/50 shadow-2xl">
                  <Play className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
                  OTAKU NEXUS
                </h1>
                <p className="text-cyan-300/80 text-sm font-medium tracking-wider">ANIME STREAMING</p>
              </div>
            </div>

            {/* Barre de recherche futuriste */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5 z-10" />
                  <Input
                    type="text"
                    placeholder="Search your favorite anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-4 bg-gray-900/80 border-2 border-cyan-500/30 text-white placeholder-gray-400 focus:border-cyan-400 rounded-2xl backdrop-blur-sm text-lg font-medium focus:shadow-lg focus:shadow-cyan-500/25 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            </form>

            {/* Contrôles avec style néon */}
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-900/50 rounded-xl p-1 backdrop-blur-sm border border-cyan-500/30">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' 
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filtres cyberpunk */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="relative w-56 bg-gray-900/70 border-cyan-500/40 text-white backdrop-blur-sm hover:border-cyan-400/70 transition-all duration-300">
                  <Filter className="w-4 h-4 mr-2 text-cyan-400" />
                  <SelectValue placeholder="Select Genre" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-cyan-500/40 backdrop-blur-xl">
                  <SelectItem value="all" className="text-gray-300 hover:text-white hover:bg-cyan-500/20">All Genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre} className="text-gray-300 hover:text-white hover:bg-cyan-500/20">
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="relative w-48 bg-gray-900/70 border-purple-500/40 text-white backdrop-blur-sm hover:border-purple-400/70 transition-all duration-300">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-purple-500/40 backdrop-blur-xl">
                  <SelectItem value="all" className="text-gray-300 hover:text-white hover:bg-purple-500/20">All Types</SelectItem>
                  <SelectItem value="TV" className="text-gray-300 hover:text-white hover:bg-purple-500/20">TV Series</SelectItem>
                  <SelectItem value="Movie" className="text-gray-300 hover:text-white hover:bg-purple-500/20">Movie</SelectItem>
                  <SelectItem value="OVA" className="text-gray-300 hover:text-white hover:bg-purple-500/20">OVA</SelectItem>
                  <SelectItem value="Special" className="text-gray-300 hover:text-white hover:bg-purple-500/20">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Button 
                variant="outline" 
                size="sm" 
                className="relative bg-gray-900/70 border-pink-500/40 text-gray-300 hover:text-white hover:border-pink-400/70 hover:bg-pink-500/10 backdrop-blur-sm transition-all duration-300"
                onClick={() => {
                  setSelectedGenre("all");
                  setSelectedType("all");
                  setSearchQuery("");
                }}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {searchQuery ? (
          // Résultats de recherche
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                SEARCH RESULTS
              </h2>
              <p className="text-xl text-gray-300">
                Found <span className="text-cyan-400 font-bold">{searchResults.length}</span> results for 
                <span className="text-pink-400 font-bold ml-2">"{searchQuery}"</span>
              </p>
            </div>
            
            {searchLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-20">
                <div className="relative mx-auto w-32 h-32 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-20 animate-ping" />
                  <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 rounded-full w-full h-full flex items-center justify-center border border-cyan-500/30">
                    <Search className="w-16 h-16 text-cyan-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  NO RESULTS FOUND
                </h3>
                <p className="text-gray-400 text-lg">Try different keywords or browse our catalog</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {searchResults.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Catalogue par défaut
          <div className="space-y-8">
            {/* Navigation tabs cyberpunk */}
            <Tabs defaultValue="trending" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="bg-gray-900/80 border border-cyan-500/30 rounded-2xl p-2 backdrop-blur-xl">
                  <TabsTrigger 
                    value="trending" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:text-white"
                  >
                    <Star className="w-5 h-5 mr-3" />
                    TRENDING NOW
                  </TabsTrigger>
                  <TabsTrigger 
                    value="catalogue" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:text-white"
                  >
                    <Eye className="w-5 h-5 mr-3" />
                    FULL CATALOG
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="trending" className="space-y-8">
                <div className="text-center">
                  <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                    TRENDING ANIME
                  </h2>
                  <p className="text-xl text-gray-300">The hottest anime everyone's watching</p>
                  <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                </div>

                {trendingLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl" />
                      </div>
                    ))}
                  </div>
                ) : trendingAnimes.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="relative mx-auto w-32 h-32 mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-20 animate-ping" />
                      <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 rounded-full w-full h-full flex items-center justify-center border border-orange-500/30">
                        <Star className="w-16 h-16 text-orange-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-300 mb-4">Loading Trending Anime...</h3>
                    <p className="text-gray-500">Please wait while we fetch the latest hits</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {trendingAnimes.map((anime) => (
                      <AnimeCard key={anime.id} anime={anime} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="catalogue" className="space-y-8">
                <div className="text-center">
                  <h2 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                    ANIME CATALOG
                  </h2>
                  <p className="text-xl text-gray-300">Discover thousands of anime series and movies</p>
                  <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                </div>

                {catalogueLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl" />
                      </div>
                    ))}
                  </div>
                ) : catalogueAnimes.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="relative mx-auto w-32 h-32 mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-ping" />
                      <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 rounded-full w-full h-full flex items-center justify-center border border-purple-500/30">
                        <Eye className="w-16 h-16 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-300 mb-4">Loading Catalog...</h3>
                    <p className="text-gray-500">Building the ultimate anime collection</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {catalogueAnimes.map((anime) => (
                      <AnimeCard key={anime.id} anime={anime} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}