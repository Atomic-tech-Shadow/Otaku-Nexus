import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { externalApi } from "@/lib/api";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import AnimeCard from "@/components/anime/anime-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Anime() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [searchMode, setSearchMode] = useState<"trending" | "search">("trending");

  // Fetch trending anime from Jikan API
  const { data: trendingAnimes = [], isLoading: isLoadingTrending } = useQuery({
    queryKey: ["anime", "trending"],
    queryFn: async () => {
      const response = await externalApi.getTopAnime();
      return response.data?.map((anime: any) => ({
        id: anime.mal_id,
        malId: anime.mal_id,
        title: anime.title,
        imageUrl: anime.images?.jpg?.image_url,
        score: anime.score?.toString(),
        year: anime.year,
        synopsis: anime.synopsis,
        episodes: anime.episodes,
        status: anime.status,
        genre: anime.genres?.map((g: any) => g.name).join(", ") || ""
      })) || [];
    },
    enabled: searchMode === "trending",
  });

  // Search anime from Jikan API
  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ["anime", "search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const response = await externalApi.searchJikan(searchTerm);
      return response.data?.map((anime: any) => ({
        id: anime.mal_id,
        malId: anime.mal_id,
        title: anime.title,
        imageUrl: anime.images?.jpg?.image_url,
        score: anime.score?.toString(),
        year: anime.year,
        synopsis: anime.synopsis,
        episodes: anime.episodes,
        status: anime.status,
        genre: anime.genres?.map((g: any) => g.name).join(", ") || ""
      })) || [];
    },
    enabled: searchMode === "search" && searchTerm.trim().length > 0,
  });

  const animes = searchMode === "search" ? searchResults : trendingAnimes;
  const isLoading = searchMode === "search" ? isLoadingSearch : isLoadingTrending;

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSearchMode(value.trim() ? "search" : "trending");
  };

  // Filter by genre
  const filteredAnimes = Array.isArray(animes) ? animes.filter(anime =>
    selectedGenre === "all" || selectedGenre === "" || anime.genre.toLowerCase().includes(selectedGenre.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-electric-blue rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-5 w-24 h-24 bg-hot-pink rounded-full opacity-15 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-5 w-20 h-20 bg-otaku-purple rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        <AppHeader />

        <main className="px-4 py-6">
          <div className="mb-6">
            <div className="glass-morphism rounded-2xl p-6 relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-electric-blue to-transparent rounded-full opacity-30"></div>
              <h1 className="text-2xl font-bold mb-2 text-electric-blue">Anime Explorer</h1>
              <p className="text-gray-300 text-sm">
                {searchMode === "search" ? 
                  `Searching MyAnimeList for "${searchTerm}"...` : 
                  "Discover trending anime from MyAnimeList"
                }
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-electric-blue/20 text-electric-blue rounded-full">
                  {searchMode === "search" ? "Live Search" : "Top Anime"}
                </span>
                <span className="text-xs text-gray-400">Powered by Jikan API</span>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search anime from MyAnimeList..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-card-bg border-gray-700 text-white"
                />
                {searchMode === "search" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Sparkles className="w-4 h-4 text-electric-blue animate-pulse" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="flex-1 bg-card-bg border-gray-700 text-white">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-bg border-gray-700">
                    <SelectItem value="all">All Genres</SelectItem>
                    <SelectItem value="Action">Action</SelectItem>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="Romance">Romance</SelectItem>
                    <SelectItem value="Comedy">Comedy</SelectItem>
                    <SelectItem value="Drama">Drama</SelectItem>
                    <SelectItem value="Fantasy">Fantasy</SelectItem>
                    <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                    <SelectItem value="Thriller">Thriller</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 bg-card-bg border-gray-700 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-bg border-gray-700">
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Anime Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-card-bg rounded-lg animate-pulse relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAnimes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}

          {!isLoading && filteredAnimes.length === 0 && (
            <div className="text-center py-8">
              <div className="glass-morphism rounded-2xl p-6">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">
                  {searchMode === "search" ? 
                    "No anime found for your search." : 
                    "No anime available."
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {searchMode === "search" ? 
                    "Try searching for different keywords" : 
                    "Try searching for specific anime titles"
                  }
                </p>
              </div>
            </div>
          )}
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
}