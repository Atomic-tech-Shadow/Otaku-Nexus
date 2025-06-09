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

export default function Anime() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"trending" | "search">("trending");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: trendingAnimes, isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/anime/trending"],
    retry: false,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/external/anime/search", searchQuery],
    enabled: searchQuery.length > 2,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab("search");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

        <main className="px-4 pb-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 text-gradient">Anime Explorer</h1>
            <p className="text-gray-400 text-sm">Discover your next favorite anime series</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search anime titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card-bg border-gray-800 text-white placeholder-gray-400"
              />
              {searchQuery && (
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-electric-blue hover:bg-electric-blue/80"
                >
                  Search
                </Button>
              )}
            </div>
          </form>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={activeTab === "trending" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("trending")}
              className={activeTab === "trending" ? "bg-electric-blue" : ""}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </Button>
            <Button
              variant={activeTab === "search" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("search")}
              disabled={!searchQuery}
              className={activeTab === "search" ? "bg-hot-pink" : ""}
            >
              <Search className="w-4 h-4 mr-2" />
              Search Results
            </Button>
          </div>

          {/* Content */}
          {activeTab === "trending" && (
            <section>
              <h3 className="text-lg font-semibold mb-4">Trending Now</h3>
              {trendingLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-card-bg rounded-xl p-3 animate-pulse h-48"></div>
                  ))}
                </div>
              ) : trendingAnimes && trendingAnimes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {trendingAnimes.map((anime: any) => (
                    <AnimeCard key={anime.id} anime={anime} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">No trending anime available at the moment.</p>
                </div>
              )}
            </section>
          )}

          {activeTab === "search" && (
            <section>
              <h3 className="text-lg font-semibold mb-4">
                Search Results for "{searchQuery}"
              </h3>
              {searchLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-card-bg rounded-xl p-3 animate-pulse h-48"></div>
                  ))}
                </div>
              ) : searchResults?.data && searchResults.data.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {searchResults.data.map((anime: any) => (
                    <AnimeCard 
                      key={anime.mal_id} 
                      anime={{
                        id: anime.mal_id,
                        malId: anime.mal_id,
                        title: anime.title,
                        imageUrl: anime.images?.jpg?.image_url,
                        score: anime.score?.toString(),
                        year: anime.year || anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null,
                        synopsis: anime.synopsis,
                        episodes: anime.episodes,
                        status: anime.status
                      }} 
                    />
                  ))}
                </div>
              ) : searchResults && searchResults.data?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No anime found for "{searchQuery}".</p>
                  <p className="text-gray-500 text-sm mt-2">Try a different search term.</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">Enter a search term to find anime.</p>
                </div>
              )}
            </section>
          )}
        </main>

        <BottomNavigation currentPath="/anime" />
      </div>
    </div>
  );
}
