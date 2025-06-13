import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Play, Star, Calendar, Languages, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface StreamingAnime {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate?: string;
  subOrDub: string;
}

export default function AnimeStreamingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<"browse" | "search">("browse");

  // Search streaming anime
  const { data: searchResults = [], isLoading: isSearching } = useQuery<StreamingAnime[]>({
    queryKey: ['/api/anime/streaming/search', searchTerm],
    enabled: searchMode === "search" && searchTerm.length > 2,
  });

  // Get top airing anime
  const { data: topAiring = [], isLoading: isLoadingTopAiring } = useQuery<StreamingAnime[]>({
    queryKey: ['/api/anime/streaming/top-airing'],
    enabled: searchMode === "browse",
  });

  // Get recent episodes
  const { data: recentEpisodes = [], isLoading: isLoadingRecent } = useQuery<StreamingAnime[]>({
    queryKey: ['/api/anime/streaming/recent-episodes'],
    enabled: searchMode === "browse",
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSearchMode(value.length > 2 ? "search" : "browse");
  };

  const isFrenchdubAvailable = (anime: StreamingAnime) => {
    const title = anime.title.toLowerCase();
    const subOrDub = anime.subOrDub?.toLowerCase() || '';
    
    return subOrDub.includes('dub') || 
           title.includes('vf') || 
           title.includes('french') || 
           title.includes('français');
  };

  const currentAnimes = searchMode === "search" ? searchResults : topAiring;
  const isLoading = searchMode === "search" ? isSearching : isLoadingTopAiring;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🎬 Streaming Anime
          </h1>
          <p className="text-gray-300 text-lg">
            Regardez vos anime préférés en streaming gratuit
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5" />
                Rechercher un anime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Rechercher un anime à regarder..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                />
                <Button 
                  onClick={() => handleSearch(searchTerm)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Browse Sections */}
        {searchMode === "browse" && (
          <div className="space-y-8">
            {/* Top Airing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">En cours de diffusion</h2>
              </div>
              
              {isLoadingTopAiring ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {topAiring.slice(0, 8).map((anime, index) => (
                    <AnimeStreamingCard key={anime.id} anime={anime} index={index} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Episodes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Épisodes récents</h2>
              </div>
              
              {isLoadingRecent ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recentEpisodes.slice(0, 8).map((anime, index) => (
                    <AnimeStreamingCard key={anime.id} anime={anime} index={index} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Search Results */}
        {searchMode === "search" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Résultats pour "{searchTerm}"
            </h2>
            
            {isSearching ? (
              <LoadingSpinner />
            ) : searchResults.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-400">Aucun résultat trouvé pour "{searchTerm}"</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((anime, index) => (
                  <AnimeStreamingCard key={anime.id} anime={anime} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

interface AnimeStreamingCardProps {
  anime: StreamingAnime;
  index: number;
}

function AnimeStreamingCard({ anime, index }: AnimeStreamingCardProps) {
  const isFrenchdub = anime.subOrDub?.toLowerCase().includes('dub') || 
                     anime.title.toLowerCase().includes('vf');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/anime-streaming/${anime.id}`}>
        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group overflow-hidden">
          <div className="relative">
            <img 
              src={anime.image} 
              alt={anime.title}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* VF Badge */}
            {isFrenchdub && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-600/90 text-white border-0">
                  <Languages className="w-3 h-3 mr-1" />
                  VF
                </Badge>
              </div>
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-purple-600 rounded-full p-3">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold text-white mb-2 line-clamp-2">
              {anime.title}
            </h3>
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{anime.subOrDub}</span>
              </div>
              
              {anime.releaseDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{anime.releaseDate}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}