import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Play, Search, TrendingUp, Clock, Star, Filter, Eye, ChevronDown, ChevronUp, Shuffle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

interface AnimeSamaAnime {
  id: string;
  title: string;
  image: string;
  language: 'VF' | 'VOSTFR' | 'VF+VOSTFR';
  synopsis?: string;
  genres?: string[];
  type?: string;
  status?: string;
  seasons?: AnimeSamaSeason[];
}

interface AnimeSamaSeason {
  seasonNumber: number;
  title: string;
  episodes: AnimeSamaEpisode[];
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

interface AnimeSamaSearchResult {
  id: string;
  title: string;
  image: string;
  language: 'VF' | 'VOSTFR' | 'VF+VOSTFR';
}

interface AnimeSamaGenre {
  name: string;
  slug: string;
}

export default function AnimeStreamingPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeSamaSearchResult[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeSamaAnime | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<AnimeSamaSeason | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<AnimeSamaEpisode | null>(null);
  const [streamingLinks, setStreamingLinks] = useState<{ vf?: string[]; vostfr?: string[] } | null>(null);
  const [currentView, setCurrentView] = useState<'search' | 'anime-details' | 'episodes' | 'streaming'>('search');
  const [isSearching, setIsSearching] = useState(false);
  const [cataloguePage, setCataloguePage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  // Fetch trending anime
  const { data: trendingAnime, isLoading: isLoadingTrending } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/trending'],
  });

  // Fetch genres
  const { data: genres } = useQuery<AnimeSamaGenre[]>({
    queryKey: ['/api/genres'],
  });

  // Fetch catalogue
  const { data: catalogueAnime, isLoading: isLoadingCatalogue } = useQuery<AnimeSamaSearchResult[]>({
    queryKey: ['/api/catalogue', cataloguePage, selectedGenre, selectedType],
  });

  // 1. Fonctionnalité de recherche
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setCurrentView('search');
      }
    } catch (error) {
      console.error('Error searching anime:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 2. Détail d'un anime sélectionné
  const handleAnimeSelect = async (animeId: string) => {
    try {
      const response = await fetch(`/api/anime/${animeId}`);
      if (response.ok) {
        const animeDetails = await response.json();
        setSelectedAnime(animeDetails);
        setCurrentView('anime-details');
      }
    } catch (error) {
      console.error('Error fetching anime details:', error);
    }
  };

  // 3. Épisodes d'une saison
  const handleSeasonSelect = async (animeId: string, seasonNum: number) => {
    try {
      const response = await fetch(`/api/anime/${animeId}/season/${seasonNum}/episodes`);
      if (response.ok) {
        const episodes = await response.json();
        const seasonData = { seasonNumber: seasonNum, title: `Saison ${seasonNum}`, episodes };
        setSelectedSeason(seasonData);
        setCurrentView('episodes');
      }
    } catch (error) {
      console.error('Error fetching season episodes:', error);
    }
  };

  // 4. Lien de streaming d'un épisode
  const handleEpisodeSelect = async (episodeId: string, episode: AnimeSamaEpisode) => {
    try {
      const response = await fetch(`/api/episode/${episodeId}`);
      if (response.ok) {
        const links = await response.json();
        setStreamingLinks(links);
        setSelectedEpisode(episode);
        setCurrentView('streaming');
      }
    } catch (error) {
      console.error('Error fetching episode streaming:', error);
    }
  };

  // 7. Anime aléatoire
  const handleRandomAnime = async () => {
    try {
      const response = await fetch('/api/random');
      if (response.ok) {
        const randomAnime = await response.json();
        setSelectedAnime(randomAnime);
        setCurrentView('anime-details');
      }
    } catch (error) {
      console.error('Error fetching random anime:', error);
    }
  };

  const renderSearchSection = () => (
    <div id="search-section" className="mb-8">
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Rechercher un anime..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 bg-gray-800/50 border-gray-700 text-white"
        />
        <Button onClick={handleSearch} disabled={isSearching} className="bg-purple-600 hover:bg-purple-700">
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? 'Recherche...' : 'Rechercher'}
        </Button>
        <Button onClick={handleRandomAnime} variant="outline" className="border-gray-700">
          <Shuffle className="w-4 h-4 mr-2" />
          Aléatoire
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {searchResults.map((anime) => (
            <Card key={anime.id} className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors">
              <div onClick={() => handleAnimeSelect(anime.id)}>
                <img src={anime.image} alt={anime.title} className="w-full h-48 object-cover rounded-t-lg" />
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold text-sm truncate">{anime.title}</h3>
                  <Badge variant="secondary" className="mt-2">
                    {anime.language}
                  </Badge>
                  <Button size="sm" className="w-full mt-2 bg-purple-600 hover:bg-purple-700">
                    Voir détails
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnimeDetails = () => (
    <div id="anime-details-section">
      {selectedAnime && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <Button 
              onClick={() => setCurrentView('search')} 
              variant="outline" 
              size="sm"
              className="w-fit mb-4"
            >
              ← Retour
            </Button>
            <div className="flex gap-6">
              <img src={selectedAnime.image} alt={selectedAnime.title} className="w-48 h-64 object-cover rounded-lg" />
              <div className="flex-1">
                <CardTitle className="text-white text-2xl mb-4">{selectedAnime.title}</CardTitle>
                <div className="flex gap-2 mb-4">
                  <Badge>{selectedAnime.language}</Badge>
                  {selectedAnime.type && <Badge variant="secondary">{selectedAnime.type}</Badge>}
                  {selectedAnime.status && <Badge variant="outline">{selectedAnime.status}</Badge>}
                </div>
                {selectedAnime.genres && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedAnime.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                )}
                {selectedAnime.synopsis && (
                  <p className="text-gray-300 mb-4">{selectedAnime.synopsis}</p>
                )}
                {selectedAnime.seasons && selectedAnime.seasons.length > 0 && (
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-2">Saisons</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnime.seasons.map((season) => (
                        <Button
                          key={season.seasonNumber}
                          onClick={() => handleSeasonSelect(selectedAnime.id, season.seasonNumber)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {season.title} - Voir les épisodes
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );

  const renderEpisodes = () => (
    <div id="episodes-section">
      {selectedSeason && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <Button 
              onClick={() => setCurrentView('anime-details')} 
              variant="outline" 
              size="sm"
              className="w-fit mb-4"
            >
              ← Retour aux détails
            </Button>
            <CardTitle className="text-white">{selectedSeason.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {selectedSeason.episodes.map((episode) => (
                <Card key={episode.id} className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-semibold">Épisode {episode.number}</h4>
                      {episode.title && <p className="text-gray-300">{episode.title}</p>}
                    </div>
                    <Button
                      onClick={() => handleEpisodeSelect(episode.id, episode)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Regarder
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStreaming = () => (
    <div id="streaming-section">
      {selectedEpisode && streamingLinks && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <Button 
              onClick={() => setCurrentView('episodes')} 
              variant="outline" 
              size="sm"
              className="w-fit mb-4"
            >
              ← Retour aux épisodes
            </Button>
            <CardTitle className="text-white">
              Épisode {selectedEpisode.number}
              {selectedEpisode.title && ` - ${selectedEpisode.title}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {streamingLinks.vf && streamingLinks.vf.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Version Française (VF)</h3>
                  <div className="space-y-2">
                    {streamingLinks.vf.map((link, index) => (
                      <div key={index} className="bg-black rounded-lg overflow-hidden">
                        <iframe
                          src={link}
                          className="w-full h-96"
                          allowFullScreen
                          title={`VF Episode ${selectedEpisode.number} - Source ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {streamingLinks.vostfr && streamingLinks.vostfr.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Version Sous-titrée (VOSTFR)</h3>
                  <div className="space-y-2">
                    {streamingLinks.vostfr.map((link, index) => (
                      <div key={index} className="bg-black rounded-lg overflow-hidden">
                        <iframe
                          src={link}
                          className="w-full h-96"
                          allowFullScreen
                          title={`VOSTFR Episode ${selectedEpisode.number} - Source ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTrending = () => (
    <div id="trending-section" className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2 text-purple-400" />
        Tendances
      </h2>
      {isLoadingTrending ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4">
              <div className="w-full h-48 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trendingAnime?.slice(0, 12).map((anime) => (
            <Card key={anime.id} className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors">
              <div onClick={() => handleAnimeSelect(anime.id)}>
                <img src={anime.image} alt={anime.title} className="w-full h-48 object-cover rounded-t-lg" />
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold text-sm truncate">{anime.title}</h3>
                  <Badge variant="secondary" className="mt-2">
                    {anime.language}
                  </Badge>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCatalogue = () => (
    <div id="catalogue-section" className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Filter className="w-6 h-6 mr-2 text-purple-400" />
          Catalogue
        </h2>
        <div className="flex gap-4">
          {genres && (
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre.slug} value={genre.slug}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              <SelectItem value="anime">Anime</SelectItem>
              <SelectItem value="film">Film</SelectItem>
              <SelectItem value="ova">OVA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoadingCatalogue ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4">
              <div className="w-full h-48 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            {catalogueAnime?.map((anime) => (
              <Card key={anime.id} className="bg-gray-800/50 border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors">
                <div onClick={() => handleAnimeSelect(anime.id)}>
                  <img src={anime.image} alt={anime.title} className="w-full h-48 object-cover rounded-t-lg" />
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold text-sm truncate">{anime.title}</h3>
                    <Badge variant="secondary" className="mt-2">
                      {anime.language}
                    </Badge>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setCataloguePage(Math.max(1, cataloguePage - 1))}
              disabled={cataloguePage === 1}
              variant="outline"
              className="border-gray-700"
            >
              Précédent
            </Button>
            <span className="flex items-center px-4 text-white">Page {cataloguePage}</span>
            <Button
              onClick={() => setCataloguePage(cataloguePage + 1)}
              variant="outline"
              className="border-gray-700"
            >
              Suivant
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-app-bg to-secondary-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/20 to-hot-pink/20" />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-electric-blue to-hot-pink mb-6">
            <Play className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-electric-blue to-hot-pink bg-clip-text text-transparent mb-4">
            Streaming Anime
          </h1>
          
          <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
            Regardez vos anime préférés en streaming gratuit avec la meilleure qualité
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {currentView === 'search' && (
          <>
            {renderSearchSection()}
            {renderTrending()}
            {renderCatalogue()}
          </>
        )}
        {currentView === 'anime-details' && renderAnimeDetails()}
        {currentView === 'episodes' && renderEpisodes()}
        {currentView === 'streaming' && renderStreaming()}
      </div>
    </div>
  );
}