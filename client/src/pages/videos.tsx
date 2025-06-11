import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VideoCard from "@/components/video/video-card";

export default function Videos() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"],
    retry: false,
  });

  const filteredVideos = Array.isArray(videos) ? videos.filter(video => {
    const searchMatch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === "all" || video.category === selectedCategory;
    return searchMatch && categoryMatch;
  }) : [];

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
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-otaku-purple to-transparent rounded-full opacity-30"></div>
              <h1 className="text-2xl font-bold mb-2 text-otaku-purple">AMV Collection</h1>
              <p className="text-gray-300 text-sm mb-4">Discover amazing anime music videos and content!</p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-electric-blue">🎵</div>
                  <div className="text-xs text-gray-400">Music</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-hot-pink">🎬</div>
                  <div className="text-xs text-gray-400">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-otaku-purple">✨</div>
                  <div className="text-xs text-gray-400">Magic</div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card-bg border-gray-700 text-white"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-card-bg border-gray-700 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-card-bg border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="amv">AMV</SelectItem>
                  <SelectItem value="opening">Opening</SelectItem>
                  <SelectItem value="ending">Ending</SelectItem>
                  <SelectItem value="ost">OST</SelectItem>
                  <SelectItem value="compilation">Compilation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Video Grid */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-card-bg rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}

          {!isLoading && filteredVideos.length === 0 && (
            <div className="text-center py-8">
              <div className="glass-morphism rounded-2xl p-6">
                <p className="text-gray-300">No videos found matching your criteria.</p>
              </div>
            </div>
          )}
        </main>

        <BottomNavigation currentPath="/videos" />
      </div>
    </div>
  );
}