import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Play, Search, TrendingUp, Clock, Star, Filter, Eye, ChevronDown, ChevronUp, Shuffle, Menu, User, Home, Settings, Globe, Tv, Film, Zap, ArrowLeft, Languages, Calendar, List, Grid } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

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

  // Search function
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Get anime details
  const handleAnimeSelect = async (animeId: string) => {
    try {
      const response = await fetch(`/api/anime/${animeId}`);
      const animeData = await response.json();
      setSelectedAnime(animeData);
      setCurrentView('anime-details');
    } catch (error) {
      console.error('Error fetching anime details:', error);
    }
  };

  // Get season episodes
  const handleSeasonSelect = async (season: AnimeSamaSeason) => {
    setSelectedSeason(season);
    setCurrentView('episodes');
  };

  // Get streaming links
  const handleEpisodeSelect = async (episode: AnimeSamaEpisode) => {
    setSelectedEpisode(episode);
    try {
      const response = await fetch(`/api/episode/${episode.id}/streaming`);
      const links = await response.json();
      setStreamingLinks(links);
      setCurrentView('streaming');
    } catch (error) {
      console.error('Error fetching streaming links:', error);
    }
  };

  const placeholderTexts = [
    "Rechercher One Piece...",
    "Rechercher Naruto...",
    "Rechercher Jujutsu Kaisen...",
    "Rechercher Demon Slayer...",
    "Rechercher Attack on Titan..."
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholderTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Navigation Header Component
  const NavigationHeader = () => (
    <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-600/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => setLocation('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Otaku Nexus
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-gray-300 hover:text-streaming-cyan transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-streaming-cyan transition-colors">
              <Grid className="w-4 h-4 mr-2" />
              Catalogue
            </Button>
            <Button variant="ghost" className="text-streaming-purple font-medium border-b-2 border-streaming-purple">
              <Tv className="w-4 h-4 mr-2" />
              Streaming
            </Button>
            <Button variant="ghost" className="text-gray-300 hover:text-streaming-cyan transition-colors">
              <TrendingUp className="w-4 h-4 mr-2" />
              Tendances
            </Button>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-streaming-steel text-gray-300 hover:border-streaming-cyan">
              <User className="w-4 h-4 mr-2" />
              Compte
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            className="md:hidden text-gray-300"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 border-t border-streaming-steel/30 pt-4"
          >
            <nav className="flex flex-col space-y-3">
              <Button variant="ghost" className="justify-start text-gray-300 hover:text-streaming-cyan">
                <Home className="w-4 h-4 mr-3" />
                Accueil
              </Button>
              <Button variant="ghost" className="justify-start text-gray-300 hover:text-streaming-cyan">
                <Grid className="w-4 h-4 mr-3" />
                Catalogue
              </Button>
              <Button variant="ghost" className="justify-start text-streaming-purple font-medium">
                <Tv className="w-4 h-4 mr-3" />
                Streaming
              </Button>
              <Button variant="ghost" className="justify-start text-gray-300 hover:text-streaming-cyan">
                <TrendingUp className="w-4 h-4 mr-3" />
                Tendances
              </Button>
              <Button variant="outline" className="justify-start border-streaming-steel text-gray-300">
                <User className="w-4 h-4 mr-3" />
                Compte
              </Button>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );

  // Hero Search Section
  const HeroSearchSection = () => (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-streaming-purple/10 via-transparent to-streaming-cyan/10" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-streaming-purple/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-streaming-cyan/20 rounded-full blur-3xl animate-pulse-slow" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-streaming-purple to-streaming-cyan mb-8 animate-neon-glow">
            <Play className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-streaming-purple via-streaming-cyan to-white bg-clip-text text-transparent animate-glow">
              Streaming
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Découvrez et regardez vos anime préférés en streaming gratuit avec la meilleure qualité
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'animate-search-focus' : ''}`}>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={placeholderTexts[currentPlaceholder]}
                className="w-full pl-12 pr-4 py-4 text-lg bg-gray-800/50 border-gray-600/50 rounded-2xl backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner />
                </div>
              )}
            </div>

            {/* Search Suggestions */}
            {searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-md border border-gray-600/30 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
              >
                {searchResults.slice(0, 8).map((anime, index) => (
                  <motion.div
                    key={anime.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center p-4 hover:bg-gray-700/30 cursor-pointer transition-colors border-b border-gray-600/20 last:border-b-0"
                    onClick={() => handleAnimeSelect(anime.id)}
                  >
                    <img 
                      src={anime.image} 
                      alt={anime.title}
                      className="w-12 h-16 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium line-clamp-1">{anime.title}</h3>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 text-xs ${
                          anime.language === 'VF' ? 'border-green-500 text-green-400' :
                          anime.language === 'VOSTFR' ? 'border-blue-500 text-blue-400' :
                          'border-streaming-purple text-streaming-purple'
                        }`}
                      >
                        {anime.language}
                      </Badge>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 transform rotate-[-90deg]" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );

  // Trending Section
  const TrendingSection = () => (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-streaming-purple to-streaming-cyan rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Tendances</h2>
          </div>
          <Button variant="outline" size="sm" className="border-streaming-steel text-gray-300 hover:border-streaming-cyan">
            Voir tout
          </Button>
        </motion.div>

        {isLoadingTrending ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-streaming-card rounded-xl overflow-hidden animate-skeleton-wave h-80" />
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            variants={{
              show: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {trendingAnime?.slice(0, 12).map((anime, index) => (
              <motion.div
                key={anime.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0 }
                }}
                className="group relative bg-streaming-card rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:animate-card-hover-neon"
                onClick={() => handleAnimeSelect(anime.id)}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img 
                    src={anime.image} 
                    alt={anime.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-streaming-purple/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>

                  {/* Language Badge */}
                  <Badge 
                    className={`absolute top-2 right-2 text-xs ${
                      anime.language === 'VF' ? 'bg-green-500' :
                      anime.language === 'VOSTFR' ? 'bg-blue-500' :
                      'bg-streaming-purple'
                    }`}
                  >
                    {anime.language}
                  </Badge>
                </div>
                
                <div className="p-3">
                  <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-streaming-cyan transition-colors">
                    {anime.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );

  // Anime Details View
  const AnimeDetailsView = () => {
    if (!selectedAnime) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen"
      >
        {/* Backdrop */}
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          <img 
            src={selectedAnime.image} 
            alt={selectedAnime.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-streaming-bg via-streaming-bg/50 to-transparent" />
          
          {/* Back Button */}
          <Button
            variant="ghost"
            className="absolute top-6 left-6 text-white hover:bg-white/20 z-10"
            onClick={() => setCurrentView('search')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <img 
                src={selectedAnime.image} 
                alt={selectedAnime.title}
                className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl"
              />
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {selectedAnime.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedAnime.genres?.map((genre) => (
                  <Badge key={genre} variant="outline" className="border-streaming-purple text-streaming-purple">
                    {genre}
                  </Badge>
                ))}
                <Badge className="bg-streaming-cyan text-black">
                  {selectedAnime.language}
                </Badge>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {selectedAnime.synopsis || "Synopsis non disponible"}
              </p>

              {/* Seasons */}
              {selectedAnime.seasons && selectedAnime.seasons.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Saisons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAnime.seasons.map((season) => (
                      <Card 
                        key={season.seasonNumber}
                        className="bg-streaming-card/50 border-streaming-steel/30 cursor-pointer hover:border-streaming-purple transition-all duration-300"
                        onClick={() => handleSeasonSelect(season)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium">{season.title}</h4>
                              <p className="text-gray-400 text-sm">{season.episodes.length} épisodes</p>
                            </div>
                            <ChevronDown className="w-5 h-5 text-streaming-purple transform rotate-[-90deg]" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Episodes View
  const EpisodesView = () => {
    if (!selectedSeason) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-streaming-cyan"
            onClick={() => setCurrentView('anime-details')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux détails
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {selectedSeason.title}
          </h1>
          <p className="text-gray-400">{selectedSeason.episodes.length} épisodes disponibles</p>
        </div>

        {/* Episodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedSeason.episodes.map((episode, index) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-streaming-card rounded-xl overflow-hidden cursor-pointer hover:animate-card-hover-neon transition-all duration-300"
              onClick={() => handleEpisodeSelect(episode)}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-streaming-purple to-streaming-cyan rounded-full flex items-center justify-center text-white font-bold">
                    {episode.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium group-hover:text-streaming-cyan transition-colors">
                      Épisode {episode.number}
                    </h3>
                    {episode.title && (
                      <p className="text-gray-400 text-sm line-clamp-1">{episode.title}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {episode.links.vf && (
                      <Badge className="bg-green-500 text-white text-xs">VF</Badge>
                    )}
                    {episode.links.vostfr && (
                      <Badge className="bg-blue-500 text-white text-xs">VOSTFR</Badge>
                    )}
                  </div>
                  <div className="w-8 h-8 bg-streaming-purple/20 rounded-full flex items-center justify-center group-hover:bg-streaming-purple transition-colors">
                    <Play className="w-4 h-4 text-streaming-purple group-hover:text-white ml-0.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  // Streaming View
  const StreamingView = () => {
    if (!selectedEpisode || !streamingLinks) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-streaming-cyan"
            onClick={() => setCurrentView('episodes')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux épisodes
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Épisode {selectedEpisode.number}
            {selectedEpisode.title && ` - ${selectedEpisode.title}`}
          </h1>
        </div>

        {/* Video Player */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="vostfr" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-streaming-card mb-6">
              {streamingLinks.vostfr && (
                <TabsTrigger value="vostfr" className="data-[state=active]:bg-streaming-purple">
                  <Languages className="w-4 h-4 mr-2" />
                  VOSTFR
                </TabsTrigger>
              )}
              {streamingLinks.vf && (
                <TabsTrigger value="vf" className="data-[state=active]:bg-streaming-purple">
                  <Globe className="w-4 h-4 mr-2" />
                  VF
                </TabsTrigger>
              )}
            </TabsList>

            {streamingLinks.vostfr && (
              <TabsContent value="vostfr">
                <div className="space-y-4">
                  {streamingLinks.vostfr.map((link, index) => (
                    <Card key={index} className="bg-streaming-card border-streaming-steel/30">
                      <CardContent className="p-6">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={link}
                            className="w-full h-full"
                            allowFullScreen
                            title={`VOSTFR Episode ${selectedEpisode.number} - Source ${index + 1}`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}

            {streamingLinks.vf && (
              <TabsContent value="vf">
                <div className="space-y-4">
                  {streamingLinks.vf.map((link, index) => (
                    <Card key={index} className="bg-streaming-card border-streaming-steel/30">
                      <CardContent className="p-6">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={link}
                            className="w-full h-full"
                            allowFullScreen
                            title={`VF Episode ${selectedEpisode.number} - Source ${index + 1}`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-streaming-bg text-white">
      <NavigationHeader />
      
      {currentView === 'search' && (
        <>
          <HeroSearchSection />
          <TrendingSection />
        </>
      )}
      {currentView === 'anime-details' && <AnimeDetailsView />}
      {currentView === 'episodes' && <EpisodesView />}
      {currentView === 'streaming' && <StreamingView />}
    </div>
  );
}