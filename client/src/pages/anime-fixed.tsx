import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AppHeader from "@/components/layout/app-header";
import BottomNav from "@/components/layout/bottom-nav";

interface AnimeSamaSearchResult {
  id: string;
  title: string;
  image: string;
  language: 'VF' | 'VOSTFR' | 'VF+VOSTFR';
}

interface AnimeSamaAnime {
  id: string;
  title: string;
  image: string;
  description: string;
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
  links: {
    vf?: string[];
    vostfr?: string[];
  };
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
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/anime/search', searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Animes tendances (affichés par défaut)
  const { data: trendingAnimes, isLoading: trendingLoading } = useQuery({
    queryKey: ['/api/anime/trending'],
    enabled: !searchQuery && !match,
  });

  // Détails de l'anime sélectionné
  const { data: animeDetails, isLoading: animeLoading } = useQuery({
    queryKey: ['/api/anime', params?.id],
    enabled: !!params?.id,
  });

  // Episodes de la saison sélectionnée
  const { data: seasonEpisodes, isLoading: episodesLoading } = useQuery({
    queryKey: ['/api/anime', params?.id, 'season', selectedSeason, 'episodes'],
    enabled: !!params?.id && !!selectedSeason,
  });

  // Liens de streaming pour l'épisode sélectionné
  const { data: streamingLinks, isLoading: streamingLoading } = useQuery({
    queryKey: ['/api/episode', selectedEpisode?.id],
    enabled: !!selectedEpisode?.id,
  });

  // Fonction pour sélectionner un anime
  const selectAnime = (animeId: string) => {
    setLocation(`/anime/${animeId}`);
    setSearchQuery("");
    setSelectedSeason(1);
    setSelectedEpisode(null);
    setShowPlayer(false);
  };

  // Fonction pour sélectionner un épisode
  const selectEpisode = (episode: AnimeSamaEpisode) => {
    setSelectedEpisode(episode);
    setShowPlayer(true);
  };

  // Fonction pour obtenir l'URL de streaming
  const getStreamingUrl = () => {
    if (!streamingLinks || !selectedEpisode) return null;
    const typedLinks = streamingLinks as StreamingLinks;
    const links = typedLinks[selectedLanguage];
    return links && links.length > 0 ? links[0] : null;
  };

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

            {/* Résultats de recherche */}
            {searchQuery && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Résultats pour "{searchQuery}"
                </h2>
                {searchLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Card key={i} className="bg-white/10 border-white/20">
                        <CardContent className="p-0">
                          <Skeleton className="w-full h-48 rounded-t-lg" />
                          <div className="p-3">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.isArray(searchResults) && searchResults.map((anime: AnimeSamaSearchResult) => (
                      <Card 
                        key={anime.id} 
                        className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                        onClick={() => selectAnime(anime.id)}
                      >
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden rounded-t-lg">
                            <img
                              src={anime.image}
                              alt={anime.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="text-white font-medium truncate">{anime.title}</h3>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {anime.language}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Animes tendances */}
            {!searchQuery && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  🔥 Animes Tendances
                </h2>
                {trendingLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Card key={i} className="bg-white/10 border-white/20">
                        <CardContent className="p-0">
                          <Skeleton className="w-full h-48 rounded-t-lg" />
                          <div className="p-3">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.isArray(trendingAnimes) && trendingAnimes.map((anime: AnimeSamaSearchResult) => (
                      <Card 
                        key={anime.id} 
                        className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                        onClick={() => selectAnime(anime.id)}
                      >
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden rounded-t-lg">
                            <img
                              src={anime.image}
                              alt={anime.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="text-white font-medium truncate">{anime.title}</h3>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {anime.language}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <BottomNav />
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
                  {anime.genres?.map((genre: string) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-white border-white">
                    {anime.language}
                  </Badge>
                  {anime.status && (
                    <Badge variant="outline" className="text-white border-white">
                      {anime.status}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Heart className="w-4 h-4 mr-2" />
                    Ajouter à ma liste
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Informations de l'anime */}
                <div className="lg:col-span-2">
                  <Card className="bg-white/10 border-white/20 mb-6">
                    <CardHeader>
                      <CardTitle className="text-white">Synopsis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 leading-relaxed">
                        {anime.synopsis || "Aucun synopsis disponible."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Lecteur vidéo */}
                  {showPlayer && selectedEpisode && (
                    <Card className="bg-white/10 border-white/20 mb-6">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>
                            Épisode {selectedEpisode.number}
                            {selectedEpisode.title && ` - ${selectedEpisode.title}`}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={selectedLanguage === 'vf' ? 'default' : 'outline'}
                              onClick={() => setSelectedLanguage('vf')}
                            >
                              VF
                            </Button>
                            <Button
                              size="sm"
                              variant={selectedLanguage === 'vostfr' ? 'default' : 'outline'}
                              onClick={() => setSelectedLanguage('vostfr')}
                            >
                              VOSTFR
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {streamingLoading ? (
                          <Skeleton className="w-full h-96" />
                        ) : (
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            {getStreamingUrl() ? (
                              <iframe
                                src={getStreamingUrl()!}
                                className="w-full h-full"
                                allowFullScreen
                                title={`Episode ${selectedEpisode.number}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white">
                                <div className="text-center">
                                  <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                  <p>Aucun lien de streaming disponible en {selectedLanguage.toUpperCase()}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Saisons et épisodes */}
                <div>
                  <Card className="bg-white/10 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Épisodes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {anime.seasons && anime.seasons.length > 1 && (
                        <Tabs value={selectedSeason.toString()} className="mb-4">
                          <TabsList className="grid w-full grid-cols-2 bg-white/10">
                            {anime.seasons.map((season: AnimeSamaSeason) => (
                              <TabsTrigger
                                key={season.seasonNumber}
                                value={season.seasonNumber.toString()}
                                onClick={() => setSelectedSeason(season.seasonNumber)}
                                className="text-white data-[state=active]:bg-purple-600"
                              >
                                Saison {season.seasonNumber}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      )}

                      <ScrollArea className="h-96">
                        {episodesLoading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full" />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {Array.isArray(seasonEpisodes) && seasonEpisodes.map((episode: AnimeSamaEpisode) => (
                              <Button
                                key={episode.id}
                                variant="ghost"
                                className="w-full justify-start text-left h-auto p-3 text-white hover:bg-white/20"
                                onClick={() => selectEpisode(episode)}
                              >
                                <div>
                                  <div className="font-medium">
                                    Épisode {episode.number}
                                  </div>
                                  {episode.title && (
                                    <div className="text-sm text-gray-300 truncate">
                                      {episode.title}
                                    </div>
                                  )}
                                </div>
                              </Button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center pb-20">
          <div className="text-white">
            <h1 className="text-2xl font-bold mb-4">Anime introuvable</h1>
            <Button onClick={() => setLocation('/anime')}>
              Retour à la liste
            </Button>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}