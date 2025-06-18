import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, Play, Star, Calendar, Languages } from "lucide-react";
import AppHeader from "@/components/layout/app-header";

// Interfaces pour l'API Anime-Sama (version corrigée)
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
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<AnimeSamaEpisode | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'vf' | 'vostfr'>('vostfr');
  const [showPlayer, setShowPlayer] = useState(false);

  // Recherche d'animes
  const { data: searchResults = [], isLoading: searchLoading } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/anime/search', searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Animes tendances (affichés par défaut)
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

  // Liens de streaming pour l'épisode sélectionné
  const { data: streamingLinks, isLoading: streamingLoading } = useQuery<StreamingLinks>({
    queryKey: ['/api/episode', selectedEpisode?.id],
    enabled: !!selectedEpisode?.id,
  });

  const handleEpisodePlay = (episode: AnimeSamaEpisode) => {
    setSelectedEpisode(episode);
    setShowPlayer(true);
  };

  const handleAnimeSelect = (animeId: string) => {
    setLocation(`/anime/${animeId}`);
  };

  const renderAnimeCard = (anime: AnimeSamaSearchResult) => (
    <Card 
      key={anime.id}
      className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
      onClick={() => handleAnimeSelect(anime.id)}
    >
      <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="text-white font-semibold text-sm line-clamp-2">{anime.title}</h3>
          <div className="flex gap-1 mt-1">
            <Badge variant="secondary" className="text-xs bg-purple-500/80 text-white">
              {anime.type}
            </Badge>
            <Badge variant="outline" className="text-xs border-white/30 text-white">
              {anime.status}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );

  // Interface de recherche et liste des animes
  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <AppHeader />
        <div className="p-4 pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Header avec recherche */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                🎌 Découvrez l'Univers Anime
              </h1>
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un anime (ex: Naruto, One Piece...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Résultats */}
            {searchQuery ? (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Résultats pour "{searchQuery}"
                </h2>
                {searchLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[3/4]" />
                    ))}
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {searchResults.map(renderAnimeCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-white/60 text-lg">
                      Aucun résultat trouvé pour "{searchQuery}"
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  ✨ Animes Tendances
                </h2>
                {trendingLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[3/4]" />
                    ))}
                  </div>
                ) : trendingAnimes && trendingAnimes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {trendingAnimes.map(renderAnimeCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-white/60 text-lg">
                      Aucun anime tendance disponible pour le moment
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Page détails de l'anime
  const anime = animeDetails as AnimeSamaAnime;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <AppHeader />
      {animeLoading ? (
        <div className="p-4 pb-20">
          <Skeleton className="w-full h-64 mb-4" />
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      ) : anime ? (
        <div>
          {/* Bannière de l'anime */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={anime.image}
              alt={anime.title}
              className="w-full h-full object-cover blur-sm scale-110"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 flex items-end p-8">
              <div className="text-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/anime')}
                  className="mb-4 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {anime.genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="bg-purple-500/80">
                      {genre}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {anime.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {anime.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Description */}
                <div className="lg:col-span-2">
                  <Card className="bg-white/10 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Synopsis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 leading-relaxed">
                        {anime.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Sélection de saison */}
                  {anime.seasons && anime.seasons.length > 0 && (
                    <Card className="mt-6 bg-white/10 border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white">Saisons</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {anime.seasons.map((season) => (
                            <Button
                              key={season.number}
                              variant={selectedSeason === season.number ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedSeason(season.number)}
                              className={selectedSeason === season.number 
                                ? "bg-purple-600 hover:bg-purple-700" 
                                : "border-white/30 text-white hover:bg-white/20"
                              }
                            >
                              {season.name} ({season.episodeCount} épisodes)
                            </Button>
                          ))}
                        </div>

                        {/* Liste des épisodes */}
                        {episodesLoading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <Skeleton key={i} className="h-12" />
                            ))}
                          </div>
                        ) : seasonEpisodes && seasonEpisodes.length > 0 ? (
                          <ScrollArea className="h-64">
                            <div className="space-y-2">
                              {(seasonEpisodes as AnimeSamaEpisode[]).map((episode) => (
                                <div
                                  key={episode.id}
                                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="text-white font-medium">
                                      Épisode {episode.number}
                                      {episode.title && ` - ${episode.title}`}
                                    </div>
                                    <div className="text-white/60 text-sm">
                                      Serveurs: {episode.servers.join(', ')}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleEpisodePlay(episode)}
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Regarder
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        ) : (
                          <div className="text-white/60 text-center py-4">
                            Aucun épisode disponible pour cette saison
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Informations supplémentaires */}
                <div>
                  <Card className="bg-white/10 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Informations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-white/60 text-sm">Année</div>
                        <div className="text-white">{anime.year}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-sm">Statut</div>
                        <div className="text-white">{anime.status}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-sm">Saisons</div>
                        <div className="text-white">{anime.seasons.length}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-sm">Genres</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {anime.genres.map((genre) => (
                            <Badge key={genre} variant="outline" className="text-xs border-white/30 text-white">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lecteur vidéo placeholder */}
                  {showPlayer && selectedEpisode && (
                    <Card className="mt-6 bg-white/10 border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Épisode {selectedEpisode.number}
                          {selectedEpisode.title && ` - ${selectedEpisode.title}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {streamingLoading ? (
                          <Skeleton className="w-full h-48" />
                        ) : streamingLinks ? (
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Button
                                variant={selectedLanguage === 'vostfr' ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedLanguage('vostfr')}
                                className={selectedLanguage === 'vostfr' 
                                  ? "bg-purple-600" 
                                  : "border-white/30 text-white"
                                }
                              >
                                VOSTFR
                              </Button>
                              <Button
                                variant={selectedLanguage === 'vf' ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedLanguage('vf')}
                                className={selectedLanguage === 'vf' 
                                  ? "bg-purple-600" 
                                  : "border-white/30 text-white"
                                }
                              >
                                VF
                              </Button>
                            </div>
                            <div className="bg-black rounded-lg p-8 text-center">
                              <Languages className="w-12 h-12 text-white/40 mx-auto mb-4" />
                              <div className="text-white/60">
                                Lecteur vidéo pour {selectedLanguage.toUpperCase()}
                              </div>
                              <div className="text-white/40 text-sm mt-2">
                                {(streamingLinks as StreamingLinks)[selectedLanguage]?.length || 0} liens disponibles
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-white/60 text-center py-8">
                            Aucun lien de streaming disponible
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="text-white">
            <h1 className="text-2xl font-bold mb-4">Anime introuvable</h1>
            <Button onClick={() => setLocation('/anime')}>
              Retour à la liste
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}