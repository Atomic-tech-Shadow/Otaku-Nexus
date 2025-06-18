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
import { Search, ChevronLeft, Play, Star, Calendar, Languages, Shuffle, Grid } from "lucide-react";
import AppHeader from "@/components/layout/app-header";

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

type ViewMode = 'search' | 'trending' | 'catalogue' | 'random' | 'detail' | 'episodes' | 'player';

export default function AnimeCompletePage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/anime/:id");
  
  // États principaux
  const [viewMode, setViewMode] = useState<ViewMode>('trending');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState<AnimeSamaAnime | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<AnimeSamaEpisode | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'vf' | 'vostfr'>('vostfr');
  
  // États pour le catalogue
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  // Déterminer le mode basé sur l'URL
  useEffect(() => {
    if (match && params?.id) {
      setViewMode('detail');
    } else {
      setViewMode('trending');
    }
  }, [match, params]);

  // Requêtes API
  const { data: searchResults = [], isLoading: searchLoading } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/search', searchQuery],
    enabled: searchQuery.length > 2 && viewMode === 'search',
  });

  const { data: trendingAnimes = [], isLoading: trendingLoading } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/trending'],
    enabled: viewMode === 'trending',
  });

  const { data: catalogueAnimes = [], isLoading: catalogueLoading } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/catalogue', currentPage, selectedGenre, selectedType],
    enabled: viewMode === 'catalogue',
  });

  const { data: randomAnime, isLoading: randomLoading } = useQuery<AnimeSamaAnime>({
    queryKey: ['/api/random'],
    enabled: viewMode === 'random',
  });

  const { data: animeDetails, isLoading: animeLoading } = useQuery<AnimeSamaAnime>({
    queryKey: ['/api/anime', params?.id],
    enabled: !!params?.id && viewMode === 'detail',
  });

  const { data: seasonEpisodes = [], isLoading: episodesLoading } = useQuery<AnimeSamaEpisode[]>({
    queryKey: ['/api/anime', selectedAnime?.id || params?.id, 'season', selectedSeason, 'episodes'],
    enabled: viewMode === 'episodes' && (!!selectedAnime?.id || !!params?.id),
  });

  const { data: streamingLinks, isLoading: streamingLoading } = useQuery<StreamingLinks>({
    queryKey: ['/api/episode', selectedEpisode?.id],
    enabled: viewMode === 'player' && !!selectedEpisode?.id,
  });

  const { data: genres = [] } = useQuery<string[]>({
    queryKey: ['/api/genres'],
  });

  // Handlers
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setViewMode('search');
    }
  };

  const handleAnimeSelect = (anime: AnimeSamaSearchResult | AnimeSamaAnime) => {
    setLocation(`/anime/${anime.id}`);
  };

  const handleViewEpisodes = (anime: AnimeSamaAnime, seasonNum: number = 1) => {
    setSelectedAnime(anime);
    setSelectedSeason(seasonNum);
    setViewMode('episodes');
  };

  const handleWatchEpisode = (episode: AnimeSamaEpisode) => {
    setSelectedEpisode(episode);
    setViewMode('player');
  };

  const handleBackToList = () => {
    setViewMode('trending');
    setLocation('/anime');
  };

  const handleShowCatalogue = () => {
    setViewMode('catalogue');
    setCurrentPage(1);
  };

  const handleShowRandom = () => {
    setViewMode('random');
  };

  // Composants de rendu
  const renderAnimeCard = (anime: AnimeSamaSearchResult) => (
    <Card 
      key={anime.id}
      className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
      onClick={() => handleAnimeSelect(anime)}
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

  const renderSearchSection = () => (
    <div id="search-section" className="text-center mb-8">
      <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        🎌 Découvrez l'Univers Anime
      </h1>
      <div className="flex gap-4 max-w-2xl mx-auto mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un anime (ex: Naruto, One Piece...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
          />
        </div>
        <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
          Rechercher
        </Button>
      </div>
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={() => setViewMode('trending')} className="border-white/30 text-white">
          Tendances
        </Button>
        <Button variant="outline" onClick={handleShowCatalogue} className="border-white/30 text-white">
          <Grid className="w-4 h-4 mr-2" />
          Catalogue
        </Button>
        <Button variant="outline" onClick={handleShowRandom} className="border-white/30 text-white">
          <Shuffle className="w-4 h-4 mr-2" />
          Aléatoire
        </Button>
      </div>
    </div>
  );

  const renderAnimeList = (animes: AnimeSamaSearchResult[], isLoading: boolean, title: string) => (
    <div id="anime-list-section">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      ) : animes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animes.map(renderAnimeCard)}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg">
            Aucun résultat trouvé
          </div>
        </div>
      )}
    </div>
  );

  const renderAnimeDetail = (anime: AnimeSamaAnime) => (
    <div id="anime-detail-section">
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
              onClick={handleBackToList}
              className="mb-4 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.map((genre: string) => (
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
            <div className="lg:col-span-2">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Synopsis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80 leading-relaxed">{anime.description}</p>
                </CardContent>
              </Card>

              {anime.seasons && anime.seasons.length > 0 && (
                <Card className="mt-6 bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Saisons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {anime.seasons.map((season: AnimeSamaSeason) => (
                        <div key={season.number} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <div className="text-white font-medium">{season.name}</div>
                            <div className="text-white/60 text-sm">{season.episodeCount} épisodes</div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleViewEpisodes(anime, season.number)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Voir les épisodes
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-white/60 text-sm">Type</div>
                    <div className="text-white">{anime.genres.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">Statut</div>
                    <div className="text-white">{anime.status}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">Année</div>
                    <div className="text-white">{anime.year}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">Saisons</div>
                    <div className="text-white">{anime.seasons.length}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEpisodesList = () => (
    <div id="episodes-section" className="p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode('detail')}
          className="mb-4 text-white hover:bg-white/20"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour aux détails
        </Button>
        
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">
              {selectedAnime?.title} - Saison {selectedSeason}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {episodesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : seasonEpisodes.length > 0 ? (
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {seasonEpisodes.map((episode: AnimeSamaEpisode) => (
                    <div
                      key={episode.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
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
                        onClick={() => handleWatchEpisode(episode)}
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
              <div className="text-white/60 text-center py-8">
                Aucun épisode disponible pour cette saison
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderVideoPlayer = () => (
    <div id="player-section" className="p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode('episodes')}
          className="mb-4 text-white hover:bg-white/20"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour aux épisodes
        </Button>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">
              {selectedAnime?.title} - Épisode {selectedEpisode?.number}
              {selectedEpisode?.title && ` - ${selectedEpisode.title}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {streamingLoading ? (
              <Skeleton className="w-full h-96" />
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
                
                {streamingLinks[selectedLanguage] && streamingLinks[selectedLanguage]!.length > 0 ? (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={streamingLinks[selectedLanguage]![0]}
                      className="w-full h-full"
                      allowFullScreen
                      title={`${selectedAnime?.title} - Épisode ${selectedEpisode?.number}`}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-center text-white/60">
                      <Languages className="w-12 h-12 mx-auto mb-4 opacity-40" />
                      <div>Aucun lien disponible pour {selectedLanguage.toUpperCase()}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white/60 text-center py-8">
                Aucun lien de streaming disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCatalogueSection = () => (
    <div id="catalogue-section">
      <div className="flex gap-4 mb-6">
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Tous les genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les types</SelectItem>
            <SelectItem value="anime">Anime</SelectItem>
            <SelectItem value="movie">Film</SelectItem>
            <SelectItem value="ova">OVA</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {renderAnimeList(catalogueAnimes, catalogueLoading, "Catalogue")}
      
      {catalogueAnimes.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-white/30 text-white"
            >
              Précédent
            </Button>
            <span className="flex items-center px-4 text-white">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => p + 1)}
              className="border-white/30 text-white"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderRandomSection = () => (
    <div id="random-section">
      {randomLoading ? (
        <div className="flex justify-center">
          <Skeleton className="w-64 h-96" />
        </div>
      ) : randomAnime ? (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">🎲 Anime Surprise</h2>
          <Card className="bg-white/10 border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                onClick={() => handleAnimeSelect(randomAnime)}>
            <div className="flex gap-4 p-6">
              <img
                src={randomAnime.image}
                alt={randomAnime.title}
                className="w-32 h-48 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{randomAnime.title}</h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-4">{randomAnime.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {randomAnime.genres.slice(0, 3).map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs bg-purple-500/80">
                      {genre}
                    </Badge>
                  ))}
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Voir détails
                </Button>
              </div>
            </div>
          </Card>
          <div className="text-center mt-4">
            <Button variant="outline" onClick={handleShowRandom} className="border-white/30 text-white">
              <Shuffle className="w-4 h-4 mr-2" />
              Autre anime aléatoire
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg">Aucun anime aléatoire disponible</div>
        </div>
      )}
    </div>
  );

  // Rendu principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <AppHeader />
      <div className="p-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {(viewMode === 'search' || viewMode === 'trending' || viewMode === 'catalogue' || viewMode === 'random') && renderSearchSection()}

          {viewMode === 'search' && renderAnimeList(searchResults, searchLoading, `Résultats pour "${searchQuery}"`)}
          {viewMode === 'trending' && renderAnimeList(trendingAnimes, trendingLoading, "✨ Animes Tendances")}
          {viewMode === 'catalogue' && renderCatalogueSection()}
          {viewMode === 'random' && renderRandomSection()}
          {viewMode === 'detail' && animeDetails && renderAnimeDetail(animeDetails)}
          {viewMode === 'episodes' && renderEpisodesList()}
          {viewMode === 'player' && renderVideoPlayer()}

          {(viewMode === 'detail' && animeLoading) && (
            <div>
              <Skeleton className="w-full h-64 mb-4" />
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
            </div>
          )}

          {(viewMode === 'detail' && !animeDetails && !animeLoading) && (
            <div className="text-center py-12">
              <div className="text-white">
                <h1 className="text-2xl font-bold mb-4">Anime introuvable</h1>
                <Button onClick={handleBackToList}>Retour à la liste</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}