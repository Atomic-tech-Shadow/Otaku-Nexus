import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { Play, Search, TrendingUp, Shuffle } from "lucide-react";
import { Link } from "wouter";

interface AnimeInfo {
  id: string;
  title: string;
  description?: string;
  image: string;
  status: string;
  genres?: string[];
  year?: string;
  type: string;
  totalEpisodes?: number;
  hasFilms?: boolean;
  hasScans?: boolean;
  correspondence?: string;
  advancement?: string;
  seasons?: AnimeSeason[];
  progressInfo?: {
    advancement: string;
    correspondence: string;
    totalEpisodes: number;
    hasFilms: boolean;
    hasScans: boolean;
  };
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
}

export default function AnimeStreaming() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState<AnimeInfo | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'vf' | 'vostfr'>('vostfr');
  const [activeTab, setActiveTab] = useState<'trending' | 'search' | 'random' | 'catalogue'>('trending');
  
  const { toast } = useToast();

  // Trending anime query
  const { data: trendingAnime, isLoading: loadingTrending } = useQuery({
    queryKey: ['/api/anime/trending'],
    enabled: activeTab === 'trending',
  });

  // Search anime query
  const { data: searchResults, isLoading: loadingSearch, refetch: searchAnime } = useQuery({
    queryKey: ['/api/anime/search', { query: searchQuery }],
    enabled: false,
  });

  // Random anime query
  const { data: randomAnime, isLoading: loadingRandom, refetch: getRandomAnime } = useQuery({
    queryKey: ['/api/anime/random'],
    enabled: false,
  });

  // Catalogue query
  const { data: catalogueAnime, isLoading: loadingCatalogue } = useQuery({
    queryKey: ['/api/anime/catalogue'],
    enabled: activeTab === 'catalogue',
  });

  // Selected anime details
  const { data: animeDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['/api/anime', selectedAnime?.id],
    enabled: !!selectedAnime?.id,
  });

  // Season episodes query
  const { data: seasonEpisodes, isLoading: loadingEpisodes } = useQuery({
    queryKey: ['/api/anime', selectedAnime?.id, 'seasons', selectedSeason, 'episodes', selectedLanguage],
    enabled: !!selectedAnime?.id && selectedSeason !== null,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setActiveTab('search');
    await searchAnime();
  };

  const handleRandomAnime = async () => {
    setActiveTab('random');
    await getRandomAnime();
  };

  const handleAnimeSelect = (anime: AnimeInfo) => {
    setSelectedAnime(anime);
    setSelectedSeason(null);
  };

  const handleSeasonSelect = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
  };

  const renderAnimeGrid = (animes: AnimeInfo[] | undefined, loading: boolean) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (!animes || animes.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🎬</div>
          <p>Aucun anime trouvé</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {animes.map((anime) => (
          <Card 
            key={anime.id} 
            className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer group"
            onClick={() => handleAnimeSelect(anime)}
          >
            <div className="relative">
              <img 
                src={anime.image} 
                alt={anime.title}
                className="w-full h-64 object-cover rounded-t-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-anime.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center rounded-t-lg">
                <Play className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12" />
              </div>
              {anime.status && (
                <Badge className="absolute top-2 right-2 bg-electric-blue">
                  {anime.status}
                </Badge>
              )}
            </div>
            <CardContent className="p-3">
              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                {anime.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{anime.type}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderAnimeDetails = () => {
    if (!selectedAnime) return null;

    const details = animeDetails || selectedAnime;

    return (
      <div className="space-y-6">
        <Button 
          onClick={() => setSelectedAnime(null)}
          variant="outline"
          className="mb-4"
        >
          ← Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <img 
              src={details.image} 
              alt={details.title}
              className="w-full rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-anime.jpg';
              }}
            />
          </div>
          
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{details.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {details.genres?.map((genre) => (
                  <Badge key={genre} variant="secondary">{genre}</Badge>
                ))}
              </div>
              
              <div className="space-y-2 text-gray-300">
                <p><strong>Description:</strong> {details.description || 'Aucune description disponible'}</p>
                <p><strong>Statut:</strong> {details.status}</p>
                <p><strong>Type:</strong> {details.type}</p>
              </div>
            </div>
          </div>
        </div>

        {details.seasons && details.seasons.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Saisons disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {details.seasons.map((season) => (
                <Card 
                  key={season.number}
                  className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => handleSeasonSelect(season.number)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">
                        Saison {season.number}
                      </h4>
                      <Badge variant="outline">
                        {season.episodeCount} épisodes
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{season.name}</p>
                    <div className="flex gap-1">
                      {season.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedSeason && seasonEpisodes && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Épisodes - Saison {selectedSeason}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={selectedLanguage === 'vostfr' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage('vostfr')}
                >
                  VOSTFR
                </Button>
                <Button
                  variant={selectedLanguage === 'vf' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLanguage('vf')}
                >
                  VF
                </Button>
              </div>
            </div>
            
            {loadingEpisodes ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seasonEpisodes.map((episode: AnimeEpisode) => (
                  <Link key={episode.id} href={`/watch/${episode.id}`}>
                    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">
                            Épisode {episode.episodeNumber}
                          </h4>
                          <Play className="h-5 w-5 text-electric-blue group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{episode.title}</p>
                        <Badge 
                          variant={episode.available ? "default" : "secondary"}
                          className={episode.available ? "bg-green-600" : ""}
                        >
                          {episode.available ? "Disponible" : "Indisponible"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-electric-blue to-purple-500 bg-clip-text text-transparent">
            Streaming Anime
          </h1>
          <p className="text-gray-400 mb-6">
            Découvrez et regardez vos animes préférés
          </p>

          {!selectedAnime && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === 'trending' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('trending')}
                    className="bg-electric-blue hover:bg-electric-blue/80"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Tendances
                  </Button>
                  <Button
                    variant={activeTab === 'catalogue' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('catalogue')}
                  >
                    Catalogue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRandomAnime}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Aléatoire
                  </Button>
                </div>
                
                <div className="flex gap-2 flex-1 max-w-md">
                  <Input
                    placeholder="Rechercher un anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button onClick={handleSearch} className="bg-electric-blue hover:bg-electric-blue/80">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedAnime ? (
          renderAnimeDetails()
        ) : (
          <div>
            {activeTab === 'trending' && renderAnimeGrid(trendingAnime, loadingTrending)}
            {activeTab === 'search' && renderAnimeGrid(searchResults, loadingSearch)}
            {activeTab === 'random' && randomAnime && renderAnimeGrid([randomAnime], loadingRandom)}
            {activeTab === 'catalogue' && renderAnimeGrid(catalogueAnime, loadingCatalogue)}
          </div>
        )}
      </div>
    </div>
  );
}