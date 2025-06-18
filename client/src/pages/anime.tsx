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

  // Composant carte anime stylé comme anime-sama.fr
  const AnimeCard = ({ anime }: { anime: AnimeSamaSearchResult }) => (
    <Card 
      className="group bg-black/80 border-gray-700/50 hover:border-sky-500/50 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm"
      onClick={() => handleAnimeSelect(anime)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/1f2937/ffffff?text=Anime';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
        
        {/* Type badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-sky-600/90 text-white text-xs font-semibold">
            {anime.type}
          </Badge>
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
          <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white shadow-2xl">
            <Play className="w-6 h-6 mr-2" />
            Regarder
          </Button>
        </div>

        {/* Info en bas */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 drop-shadow-lg">
            {anime.title}
          </h3>
          <Badge 
            variant="outline" 
            className={`border-gray-400/50 text-xs ${
              anime.status === 'En cours' ? 'text-green-400 border-green-400/50' : 
              anime.status === 'Terminé' ? 'text-blue-400 border-blue-400/50' : 
              'text-gray-300'
            }`}
          >
            {anime.status}
          </Badge>
        </div>
      </div>
    </Card>
  );

  // Composant lecteur vidéo
  const VideoPlayer = () => {
    if (!streamingData || !streamingData.sources?.length) {
      return (
        <div className="w-full h-96 bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p>Aucun serveur de streaming disponible</p>
          </div>
        </div>
      );
    }

    const currentSource = streamingData.sources[selectedServer];

    return (
      <div className="w-full">
        {/* Contrôles serveur */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-white">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Serveur:</span>
          </div>
          {streamingData.sources.map((source, index) => (
            <Button
              key={index}
              variant={selectedServer === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedServer(index)}
              className={`text-xs ${
                selectedServer === index 
                  ? 'bg-sky-600 hover:bg-sky-700' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {source.server} ({source.quality})
            </Button>
          ))}
        </div>

        {/* Lecteur iframe */}
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={currentSource.url}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={`${streamingData.animeTitle} - ${streamingData.title}`}
          />
        </div>

        {/* Info épisode */}
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-white font-semibold text-lg mb-2">
            {streamingData.animeTitle} - {streamingData.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span>Épisode {streamingData.episodeNumber}</span>
            <span>•</span>
            <span>{currentSource.language.toUpperCase()}</span>
            <span>•</span>
            <span>{currentSource.quality}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header avec recherche */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Logo/Titre */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Otaku Nexus Anime</h1>
            </div>

            {/* Barre de recherche */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher un anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-sky-500"
                />
              </div>
            </form>

            {/* Contrôles d'affichage */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="text-white border-gray-600"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-white border-gray-600"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">Tous les genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="TV">TV</SelectItem>
                <SelectItem value="Movie">Film</SelectItem>
                <SelectItem value="OVA">OVA</SelectItem>
                <SelectItem value="Special">Spécial</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-gray-600 hover:bg-gray-800"
              onClick={() => {
                setSelectedGenre("all");
                setSelectedType("all");
                setSearchQuery("");
              }}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-6">
        {searchQuery ? (
          // Résultats de recherche
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Résultats pour "{searchQuery}" {searchResults.length > 0 && `(${searchResults.length})`}
            </h2>
            {searchLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] bg-gray-800" />
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-400">Essayez avec d'autres mots-clés</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" 
                : "space-y-4"
              }>
                {searchResults.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Catalogue par défaut
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-600">
              <TabsTrigger value="trending" className="text-white data-[state=active]:bg-sky-600">
                <Star className="w-4 h-4 mr-2" />
                Tendances
              </TabsTrigger>
              <TabsTrigger value="catalogue" className="text-white data-[state=active]:bg-sky-600">
                <Eye className="w-4 h-4 mr-2" />
                Catalogue
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="mt-6">
              <h2 className="text-2xl font-bold text-white mb-6">Animes Tendances</h2>
              {trendingLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] bg-gray-800" />
                  ))}
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" 
                  : "space-y-4"
                }>
                  {trendingAnimes.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="catalogue" className="mt-6">
              <h2 className="text-2xl font-bold text-white mb-6">Catalogue Complet</h2>
              {catalogueLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] bg-gray-800" />
                  ))}
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" 
                  : "space-y-4"
                }>
                  {catalogueAnimes.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}