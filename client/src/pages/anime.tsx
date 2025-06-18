import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Play, Star, Calendar, Eye, Grid, List, ChevronLeft, Languages } from "lucide-react";

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

interface StreamingLinks {
  vf?: string[];
  vostfr?: string[];
}

export default function AnimePage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/anime/:id");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<AnimeSamaEpisode | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'vf' | 'vostfr'>('vostfr');
  const [showPlayer, setShowPlayer] = useState(false);

  // Recherche d'animes
  const { data: searchResults = [], isLoading: searchLoading } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/anime/search', searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Catalogue d'animes (affichés par défaut)
  const { data: catalogueAnimes = [], isLoading: catalogueLoading } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/anime/catalogue', selectedGenre, selectedType],
    enabled: !searchQuery && !match,
  });

  // Animes tendances
  const { data: trendingAnimes = [], isLoading: trendingLoading } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/anime/trending'],
    enabled: !searchQuery && !match,
  });

  // Détails de l'anime sélectionné
  const { data: animeDetails, isLoading: animeLoading } = useQuery<AnimeSamaAnime>({
    queryKey: ['/api/anime', params?.id],
    enabled: !!params?.id,
  });

  // Episodes de la saison sélectionnée
  const { data: seasonEpisodes = [], isLoading: episodesLoading } = useQuery<AnimeSamaEpisode[]>({
    queryKey: ['/api/anime', params?.id, 'season', selectedSeason, 'episodes'],
    enabled: !!params?.id && !!selectedSeason,
  });

  // Liens de streaming
  const { data: streamingLinks, isLoading: streamingLoading } = useQuery<StreamingLinks>({
    queryKey: ['/api/anime/episode', selectedEpisode?.id, 'streaming'],
    enabled: !!selectedEpisode?.id,
  });

  const handleAnimeSelect = (anime: AnimeSamaSearchResult) => {
    setLocation(`/anime/${anime.id}`);
  };

  const handleEpisodeSelect = (episode: AnimeSamaEpisode) => {
    setSelectedEpisode(episode);
    setShowPlayer(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Anime Card Component styled like anime-sama.fr
  const AnimeCard = ({ anime }: { anime: AnimeSamaSearchResult }) => (
    <Card 
      className="group bg-black/60 border-gray-700/50 hover:border-sky-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => handleAnimeSelect(anime)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="secondary" className="bg-sky-600/80 text-white text-xs">
            {anime.type}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{anime.title}</h3>
          <Badge variant="outline" className="border-gray-400/50 text-gray-300 text-xs">
            {anime.status}
          </Badge>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white">
            <Play className="w-4 h-4 mr-1" />
            Regarder
          </Button>
        </div>
      </div>
    </Card>
  );

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
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {animeDetails.title}
              </h1>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge className="bg-sky-600 text-white">
                  <Calendar className="w-3 h-3 mr-1" />
                  {animeDetails.year}
                </Badge>
                <Badge variant="outline" className="border-white/50 text-white">
                  {animeDetails.status}
                </Badge>
                {animeDetails.genres.map((genre, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-700/80 text-white">
                    {genre}
                  </Badge>
                ))}
              </div>
              <p className="text-gray-200 text-lg max-w-3xl line-clamp-3">
                {animeDetails.description}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des saisons */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Saisons</h3>
                  <div className="space-y-2">
                    {animeDetails.seasons.map((season) => (
                      <Button
                        key={season.number}
                        variant={selectedSeason === season.number ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          selectedSeason === season.number 
                            ? "bg-sky-600 hover:bg-sky-700 text-white" 
                            : "text-gray-300 hover:bg-gray-800"
                        }`}
                        onClick={() => setSelectedSeason(season.number)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{season.name}</span>
                          <Badge variant="secondary" className="bg-gray-700 text-white text-xs">
                            {season.episodeCount} épisodes
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liste des épisodes */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Épisodes - Saison {selectedSeason}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLanguage('vostfr')}
                        className={selectedLanguage === 'vostfr' ? "bg-sky-600 text-white" : "text-gray-300"}
                      >
                        VOSTFR
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLanguage('vf')}
                        className={selectedLanguage === 'vf' ? "bg-sky-600 text-white" : "text-gray-300"}
                      >
                        VF
                      </Button>
                    </div>
                  </div>

                  {episodesLoading ? (
                    <div className="space-y-3">
                      {[...Array(12)].map((_, i) => (
                        <Skeleton key={i} className="h-16 bg-gray-800" />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {seasonEpisodes.map((episode) => (
                          <Card
                            key={episode.id}
                            className="bg-gray-800/50 border-gray-700 hover:border-sky-500/50 transition-colors cursor-pointer"
                            onClick={() => handleEpisodeSelect(episode)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
                                    <Play className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium">
                                      Épisode {episode.number}
                                    </h4>
                                    {episode.title && (
                                      <p className="text-gray-400 text-sm">{episode.title}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="bg-gray-700 text-white">
                                    {episode.servers.length} serveurs
                                  </Badge>
                                  <Languages className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Lecteur vidéo modal */}
        {showPlayer && selectedEpisode && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  {animeDetails.title} - Épisode {selectedEpisode.number}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowPlayer(false)}
                  className="text-white hover:bg-gray-800"
                >
                  ✕
                </Button>
              </div>
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <p className="text-white">
                  Lecteur vidéo - Épisode {selectedEpisode.number}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Page principale du catalogue
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header principal style anime-sama.fr */}
      <div className="border-b-2 border-sky-900 bg-gradient-to-r from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Catalogue Anime</h1>
            </div>

            {/* Barre de recherche */}
            <form onSubmit={handleSearch} className="flex items-center bg-black rounded-lg border border-gray-700">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <Input
                type="search"
                placeholder="Rechercher un anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0"
              />
            </form>

            {/* Controls de vue */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? "bg-sky-600 text-white" : "text-gray-300"}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? "bg-sky-600 text-white" : "text-gray-300"}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtres */}
        {!searchQuery && (
          <div className="flex flex-wrap gap-4 mb-8">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Tous les genres" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="">Tous les genres</SelectItem>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="adventure">Aventure</SelectItem>
                <SelectItem value="comedy">Comédie</SelectItem>
                <SelectItem value="drama">Drame</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="sci-fi">Science-Fiction</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="">Tous les types</SelectItem>
                <SelectItem value="tv">Série TV</SelectItem>
                <SelectItem value="movie">Film</SelectItem>
                <SelectItem value="ova">OVA</SelectItem>
                <SelectItem value="special">Spécial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Section tendances */}
        {!searchQuery && !selectedGenre && !selectedType && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              Tendances
            </h2>
            {trendingLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] bg-gray-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingAnimes.slice(0, 12).map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Résultats de recherche ou catalogue */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            {searchQuery 
              ? `Résultats pour "${searchQuery}"` 
              : "Catalogue complet"
            }
          </h2>

          {(searchLoading || catalogueLoading) ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(24)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] bg-gray-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(searchQuery ? searchResults : catalogueAnimes).map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}

          {(searchQuery ? searchResults : catalogueAnimes).length === 0 && !searchLoading && !catalogueLoading && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {searchQuery 
                  ? "Aucun résultat trouvé pour votre recherche" 
                  : "Aucun anime disponible"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}