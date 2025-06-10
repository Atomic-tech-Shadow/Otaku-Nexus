import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import AnimeCard from "@/components/anime/anime-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Anime() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  const { data: animes = [], isLoading } = useQuery({
    queryKey: ["/api/anime", { search: searchTerm, genre: selectedGenre, sort: sortBy }],
    retry: false,
  });

  const filteredAnimes = Array.isArray(animes) ? animes.filter(anime =>
    anime.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedGenre === "" || anime.genre.includes(selectedGenre))
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
              <h1 className="text-2xl font-bold mb-2 electric-blue">Anime Explorer</h1>
              <p className="text-gray-300 text-sm">Discover amazing anime series and add them to your watchlist</p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search anime..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card-bg border-gray-700 text-white"
                />
              </div>

              <div className="flex gap-2">
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="flex-1 bg-card-bg border-gray-700 text-white">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-bg border-gray-700">
                    <SelectItem value="">All Genres</SelectItem>
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
                <div key={i} className="aspect-[3/4] bg-card-bg rounded-lg animate-pulse"></div>
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
                <p className="text-gray-300">No anime found matching your criteria.</p>
              </div>
            </div>
          )}
        </main>

        <BottomNavigation currentPath="/anime" />
      </div>
    </div>
  );
}