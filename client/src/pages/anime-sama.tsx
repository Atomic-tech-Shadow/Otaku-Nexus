import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Download, Star, Eye, Check, Play, Filter, Grid, List, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import AppHeader from "@/components/layout/app-header";
import BottomNav from "@/components/layout/bottom-nav";

interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: string;
  status: string;
  image: string;
}

interface AnimeDetails {
  id: string;
  title: string;
  description: string;
  image: string;
  genres: string[];
  status: string;
  year: string;
  seasons: Season[];
  url: string;
}

interface Season {
  number: number;
  name: string;
  languages: string[];
  episodeCount: number;
  url: string;
}

interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
}

const AnimeSamaPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'anime' | 'player'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>('VOSTFR');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['VOSTFR']);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [popularAnimes, setPopularAnimes] = useState<SearchResult[]>([]);
  const [trendingAnimes, setTrendingAnimes] = useState<SearchResult[]>([]);

  const API_BASE = 'https://api-anime-sama.onrender.com';

  useEffect(() => {
    if (currentView === 'home') {
      loadPopularAnimes();
    }
  }, [currentView]);

  const loadPopularAnimes = async () => {
    setLoading(true);
    try {
      const mockPopular: SearchResult[] = [
        {
          id: 'attack-on-titan',
          title: 'L\'Attaque des Titans',
          url: '/anime/attack-on-titan',
          type: 'TV',
          status: 'Terminé',
          image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg'
        },
        {
          id: 'demon-slayer',
          title: 'Demon Slayer',
          url: '/anime/demon-slayer',
          type: 'TV',
          status: 'En cours',
          image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg'
        },
        {
          id: 'one-piece',
          title: 'One Piece',
          url: '/anime/one-piece',
          type: 'TV',
          status: 'En cours',
          image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg'
        },
        {
          id: 'naruto',
          title: 'Naruto',
          url: '/anime/naruto',
          type: 'TV',
          status: 'Terminé',
          image: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg'
        },
        {
          id: 'my-hero-academia',
          title: 'My Hero Academia',
          url: '/anime/my-hero-academia',
          type: 'TV',
          status: 'En cours',
          image: 'https://cdn.myanimelist.net/images/anime/10/78745.jpg'
        },
        {
          id: 'jujutsu-kaisen',
          title: 'Jujutsu Kaisen',
          url: '/anime/jujutsu-kaisen',
          type: 'TV',
          status: 'En cours',
          image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg'
        }
      ];
      setPopularAnimes(mockPopular);
      setTrendingAnimes(mockPopular.slice().reverse());
    } catch (err) {
      console.error('Erreur chargement populaires:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchAnimes = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(query)}`);
      const apiResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors de la recherche');
      }
      
      setSearchResults(apiResponse.data);
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError('Impossible de rechercher les animes.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAnimeDetails = async (animeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/anime/${animeId}`);
      const apiResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement de l\'anime');
      }
      
      setSelectedAnime(apiResponse.data);
      setCurrentView('anime');
      setSelectedSeason(null);
      setEpisodes([]);
    } catch (err) {
      console.error('Erreur anime:', err);
      setError('Impossible de charger les détails de l\'anime.');
    } finally {
      setLoading(false);
    }
  };

  const loadSeasonEpisodes = async (season: Season) => {
    if (!selectedAnime) return;
    
    setLoading(true);
    setError(null);
    setCurrentView('player');
    setSelectedSeason(season);
    
    try {
      const language = selectedLanguage.toLowerCase();
      const response = await fetch(`${API_BASE}/api/seasons?animeId=${selectedAnime.id}&season=${season.number}&language=${language}`);
      const apiResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Erreur lors du chargement des épisodes');
      }
      
      setEpisodes(apiResponse.data.episodes);
      if (apiResponse.data.episodes.length > 0) {
        setSelectedEpisode(apiResponse.data.episodes[0]);
      }
    } catch (err) {
      console.error('Erreur épisodes:', err);
      setError('Impossible de charger les épisodes.');
    } finally {
      setLoading(false);
    }
  };

  const renderHomeView = () => (
    <div className="min-h-screen bg-nexus-dark text-white pb-20">
      <AppHeader />
      
      <main className="px-4 pt-6">
        {/* Hero Section */}
        <div className="glass-morphism rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-30 bg-gradient-to-br from-nexus-cyan to-transparent"></div>
          <h1 className="text-2xl font-bold mb-2 text-gradient">Anime Streaming</h1>
          <p className="text-gray-300 text-sm mb-4">Découvrez et regardez vos animes préférés</p>
          
          <Button 
            onClick={() => setCurrentView('search')}
            className="w-full bg-gradient-to-r from-nexus-cyan to-nexus-purple hover:from-nexus-cyan/80 hover:to-nexus-purple/80"
          >
            <Search className="w-4 h-4 mr-2" />
            Rechercher un anime
          </Button>
        </div>

        {/* Quick Categories */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-nexus-cyan" />
            Catégories populaires
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-12 border-nexus-cyan/30 hover:bg-nexus-cyan/10"
              onClick={() => {
                setSearchQuery('action');
                setCurrentView('search');
              }}
            >
              Action / Aventure
            </Button>
            <Button 
              variant="outline" 
              className="h-12 border-nexus-purple/30 hover:bg-nexus-purple/10"
              onClick={() => {
                setSearchQuery('romance');
                setCurrentView('search');
              }}
            >
              Romance / Slice of Life
            </Button>
            <Button 
              variant="outline" 
              className="h-12 border-nexus-pink/30 hover:bg-nexus-pink/10"
              onClick={() => {
                setSearchQuery('shonen');
                setCurrentView('search');
              }}
            >
              Shonen / Combat
            </Button>
            <Button 
              variant="outline" 
              className="h-12 border-nexus-orange/30 hover:bg-nexus-orange/10"
              onClick={() => {
                setSearchQuery('ghibli');
                setCurrentView('search');
              }}
            >
              Studio Ghibli
            </Button>
          </div>
        </div>

        {/* Trending Now */}
        {trendingAnimes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-nexus-pink" />
                Tendances actuelles
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('search')}>
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {trendingAnimes.slice(0, 6).map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => loadAnimeDetails(anime.id)}
                  className="flex-shrink-0 w-28 glass-morphism rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-36 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/112x144/1a1a2e/00c3ff?text=Anime';
                    }}
                  />
                  <div className="p-2">
                    <h3 className="text-white font-medium text-xs line-clamp-2">{anime.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Animes */}
        {popularAnimes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-nexus-cyan" />
                Animes populaires
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('search')}>
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {popularAnimes.slice(0, 4).map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => loadAnimeDetails(anime.id)}
                  className="glass-morphism rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full aspect-[3/4] object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300x400/1a1a2e/00c3ff?text=Anime';
                    }}
                  />
                  <div className="p-3">
                    <h3 className="text-white font-medium text-sm line-clamp-2">{anime.title}</h3>
                    <p className="text-nexus-cyan text-xs mt-1">{anime.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="glass-morphism rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Fonctionnalités</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-nexus-cyan/20 flex items-center justify-center mx-auto mb-2">
                <Play className="w-6 h-6 text-nexus-cyan" />
              </div>
              <p className="text-sm text-gray-300">Streaming HD</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-nexus-purple/20 flex items-center justify-center mx-auto mb-2">
                <Download className="w-6 h-6 text-nexus-purple" />
              </div>
              <p className="text-sm text-gray-300">Téléchargement</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-nexus-pink/20 flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-nexus-pink" />
              </div>
              <p className="text-sm text-gray-300">Favoris</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-nexus-orange/20 flex items-center justify-center mx-auto mb-2">
                <Eye className="w-6 h-6 text-nexus-orange" />
              </div>
              <p className="text-sm text-gray-300">Watchlist</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );

  const renderSearchView = () => (
    <div className="min-h-screen bg-nexus-dark text-white pb-20">
      <AppHeader />
      
      <main className="px-4 pt-6">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Recherche d'animes</h1>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher un anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchAnimes(searchQuery)}
            className="pl-10 bg-nexus-surface border-nexus-cyan/30 text-white placeholder-gray-400"
          />
          <Button
            onClick={() => searchAnimes(searchQuery)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-nexus-cyan hover:bg-nexus-cyan/80"
            size="sm"
          >
            Rechercher
          </Button>
        </div>

        {/* View toggle */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="glass-morphism rounded-xl p-6 text-center mb-6">
            <p className="text-red-400">{error}</p>
            <Button
              onClick={() => setError(null)}
              variant="outline"
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
            {searchResults.map((anime) => (
              <div
                key={anime.id}
                onClick={() => loadAnimeDetails(anime.id)}
                className={`glass-morphism rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform ${
                  viewMode === 'list' ? 'flex gap-4' : ''
                }`}
              >
                <img
                  src={anime.image}
                  alt={anime.title}
                  className={`object-cover ${
                    viewMode === 'grid' ? 'w-full aspect-[3/4]' : 'w-24 h-32 flex-shrink-0'
                  }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x400/1a1a2e/00c3ff?text=Anime';
                  }}
                />
                <div className="p-3 flex-1">
                  <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">{anime.title}</h3>
                  <p className="text-nexus-cyan text-xs">{anime.status}</p>
                  {viewMode === 'list' && (
                    <p className="text-gray-400 text-xs mt-1">{anime.type}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!searchQuery && searchResults.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-nexus-cyan/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-nexus-cyan" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Recherchez votre anime</h2>
            <p className="text-gray-400">Tapez le nom de l'anime que vous souhaitez regarder</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );

  const renderAnimeDetails = () => {
    if (!selectedAnime) return null;

    return (
      <div className="min-h-screen bg-nexus-dark text-white pb-20">
        <AppHeader />
        
        <main>
          {/* Hero image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={selectedAnime.image}
              alt={selectedAnime.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-nexus-dark via-transparent to-transparent" />
            <Button
              onClick={() => setCurrentView('search')}
              variant="ghost"
              className="absolute top-4 left-4 bg-black/50 hover:bg-black/70"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="px-4 -mt-16 relative z-10">
            {/* Anime info card */}
            <div className="glass-morphism rounded-2xl p-6 mb-6">
              <h1 className="text-2xl font-bold mb-2">{selectedAnime.title}</h1>
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 rounded-lg bg-nexus-cyan/20 text-nexus-cyan text-xs">
                  {selectedAnime.status}
                </span>
                <span className="px-2 py-1 rounded-lg bg-nexus-purple/20 text-nexus-purple text-xs">
                  {selectedAnime.year}
                </span>
              </div>
              
              {selectedAnime.description && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{selectedAnime.description}</p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-nexus-cyan hover:bg-nexus-cyan/80">
                  <Star className="w-4 h-4 mr-2" />
                  Favoris
                </Button>
                <Button variant="outline" className="flex-1 border-nexus-purple/30">
                  <Eye className="w-4 h-4 mr-2" />
                  Watchlist
                </Button>
                <Button variant="outline" className="border-nexus-pink/30">
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Seasons */}
            {selectedAnime.seasons && selectedAnime.seasons.length > 0 && (
              <div className="glass-morphism rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-nexus-cyan" />
                  Saisons disponibles
                </h2>
                <div className="space-y-3">
                  {selectedAnime.seasons.map((season) => (
                    <Button
                      key={season.number}
                      onClick={() => loadSeasonEpisodes(season)}
                      variant="outline"
                      className="w-full justify-between border-nexus-cyan/30 hover:bg-nexus-cyan/10 h-auto p-4"
                    >
                      <div className="text-left">
                        <div className="font-medium">{season.name}</div>
                        <div className="text-sm text-gray-400">{season.episodeCount} épisodes</div>
                      </div>
                      <div className="flex gap-1">
                        {season.languages.map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-1 rounded bg-nexus-purple/20 text-nexus-purple text-xs"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    );
  };

  const renderPlayerView = () => {
    return (
      <div className="min-h-screen bg-nexus-dark text-white pb-20">
        <AppHeader />
        
        <main>
          {/* Header */}
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('anime')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold">{selectedAnime?.title}</h1>
              <p className="text-sm text-gray-400">
                {selectedSeason?.name} - Episode {selectedEpisode?.episodeNumber || 1}
              </p>
            </div>
          </div>

          {/* Language selector */}
          {availableLanguages.length > 1 && (
            <div className="px-4 mb-4">
              <div className="flex gap-2">
                {availableLanguages.map((lang) => (
                  <Button
                    key={lang}
                    variant={selectedLanguage === lang ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang as 'VF' | 'VOSTFR')}
                    className="bg-nexus-surface border-nexus-cyan/30"
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Video player placeholder */}
          <div className="mx-4 mb-6">
            <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-nexus-cyan mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Lecteur vidéo</h3>
                <p className="text-gray-400 text-sm">
                  Connexion au serveur de streaming...
                </p>
              </div>
            </div>
          </div>

          {/* Episode list */}
          {episodes.length > 0 && (
            <div className="px-4 mb-6">
              <div className="glass-morphism rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Episodes</h2>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {episodes.map((episode) => (
                    <Button
                      key={episode.id}
                      variant={selectedEpisode?.id === episode.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedEpisode(episode)}
                      className="h-12 bg-nexus-surface border-nexus-cyan/30"
                    >
                      Ep {episode.episodeNumber}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="px-4">
            <div className="glass-morphism rounded-2xl p-6">
              <div className="flex gap-2">
                <Button className="flex-1 bg-nexus-cyan hover:bg-nexus-cyan/80">
                  <Play className="w-4 h-4 mr-2" />
                  Lire
                </Button>
                <Button variant="outline" className="border-nexus-purple/30">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="border-nexus-pink/30">
                  <Star className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  };

  return (
    <>
      {currentView === 'home' && renderHomeView()}
      {currentView === 'search' && renderSearchView()}
      {currentView === 'anime' && renderAnimeDetails()}
      {currentView === 'player' && renderPlayerView()}
    </>
  );
};

export default AnimeSamaPage;