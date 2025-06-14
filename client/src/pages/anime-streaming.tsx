
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, Play, Star, Calendar, Clock, Users, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface AnimeInfo {
  id: string;
  title: {
    romaji: string;
    english?: string;
    native?: string;
  };
  image: string;
  cover?: string;
  description?: string;
  genres?: string[];
  status?: string;
  totalEpisodes?: number;
  currentEpisode?: number;
  rating?: number;
  releaseDate?: number;
  type?: string;
  studios?: string[];
}

export default function AnimeStreamingPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeInfo[]>([]);
  const [topAiring, setTopAiring] = useState<AnimeInfo[]>([]);
  const [recentEpisodes, setRecentEpisodes] = useState<AnimeInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAiring, setIsLoadingAiring] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  useEffect(() => {
    fetchTopAiring();
    fetchRecentEpisodes();
  }, []);

  const fetchTopAiring = async () => {
    try {
      setIsLoadingAiring(true);
      const response = await api.get('/api/anime/streaming/top-airing');
      if (response.data && Array.isArray(response.data)) {
        setTopAiring(response.data.slice(0, 12));
      }
    } catch (error) {
      console.error('Error fetching top airing anime:', error);
      setTopAiring([]);
    } finally {
      setIsLoadingAiring(false);
    }
  };

  const fetchRecentEpisodes = async () => {
    try {
      setIsLoadingRecent(true);
      const response = await api.get('/api/anime/streaming/recent-episodes');
      if (response.data && Array.isArray(response.data)) {
        setRecentEpisodes(response.data.slice(0, 12));
      }
    } catch (error) {
      console.error('Error fetching recent episodes:', error);
      setRecentEpisodes([]);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const response = await api.get(`/api/anime/streaming/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.data && Array.isArray(response.data)) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Error searching anime:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnimeClick = (animeId: string) => {
    setLocation(`/anime-streaming/${animeId}`);
  };

  const AnimeCard = ({ anime }: { anime: AnimeInfo }) => (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-card-bg/80 to-secondary-bg/60 backdrop-blur-sm border-border/50 hover:border-electric-blue/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-electric-blue/20 cursor-pointer"
      onClick={() => handleAnimeClick(anime.id)}
    >
      <div className="relative">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={anime.image}
            alt={anime.title.romaji}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-anime.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {anime.rating && (
            <Badge className="bg-electric-blue/90 text-white backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1" />
              {anime.rating}
            </Badge>
          )}
          {anime.status && (
            <Badge 
              className={`backdrop-blur-sm ${
                anime.status === 'RELEASING' 
                  ? 'bg-green-500/90' 
                  : anime.status === 'FINISHED' 
                  ? 'bg-gray-500/90' 
                  : 'bg-hot-pink/90'
              } text-white`}
            >
              {anime.status}
            </Badge>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button className="w-full bg-electric-blue hover:bg-electric-blue/80 text-white">
            <Play className="w-4 h-4 mr-2" />
            Regarder
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-text-primary text-sm leading-tight line-clamp-2 mb-2">
          {anime.title.english || anime.title.romaji}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          {anime.totalEpisodes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {anime.totalEpisodes} épisodes
            </span>
          )}
          {anime.releaseDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {anime.releaseDate}
            </span>
          )}
        </div>

        {anime.genres && (
          <div className="flex flex-wrap gap-1">
            {anime.genres.slice(0, 2).map((genre, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-secondary-bg/60 text-text-secondary"
              >
                {genre}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-2" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
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

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <Input
                  type="text"
                  placeholder="Rechercher un anime à regarder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-14 text-lg bg-card-bg/80 backdrop-blur-sm border-border/50 focus:border-electric-blue"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="h-14 px-8 bg-gradient-to-r from-electric-blue to-hot-pink hover:from-electric-blue/80 hover:to-hot-pink/80"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-6 h-6 text-electric-blue" />
              <h2 className="text-2xl font-bold text-text-primary">
                Résultats de recherche
              </h2>
              <Badge className="bg-electric-blue/20 text-electric-blue">
                {searchResults.length} résultats
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* Top Airing */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-hot-pink" />
            <h2 className="text-2xl font-bold text-text-primary">
              En cours de diffusion
            </h2>
            <Badge className="bg-hot-pink/20 text-hot-pink">
              Populaire
            </Badge>
          </div>
          
          {isLoadingAiring ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))}
            </div>
          ) : topAiring.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topAiring.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-card-bg/50 border-border/30">
              <TrendingUp className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">Aucun anime en cours de diffusion disponible</p>
            </Card>
          )}
        </section>

        {/* Recent Episodes */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-otaku-purple" />
            <h2 className="text-2xl font-bold text-text-primary">
              Épisodes récents
            </h2>
            <Badge className="bg-otaku-purple/20 text-otaku-purple">
              Nouveau
            </Badge>
          </div>
          
          {isLoadingRecent ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))}
            </div>
          ) : recentEpisodes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentEpisodes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-card-bg/50 border-border/30">
              <Clock className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">Aucun épisode récent disponible</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
