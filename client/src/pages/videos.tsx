import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Search, Play, Pause, Volume2, VolumeX, Music, Youtube } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VideoCard from "@/components/video/video-card";

export default function Videos() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("local"); // local, youtube, music
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicSearch, setMusicSearch] = useState("");

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"],
    retry: false,
  });

  // YouTube videos search
  const { data: youtubeData, isLoading: youtubeLoading } = useQuery({
    queryKey: ["/api/external/youtube/search", searchTerm],
    enabled: activeTab === "youtube" && searchTerm.length > 2,
    retry: false,
  });

  // Anime openings search
  const { data: musicData, isLoading: musicLoading } = useQuery({
    queryKey: ["/api/external/music/openings", musicSearch],
    enabled: activeTab === "music" && musicSearch.length > 2,
    retry: false,
  });

  const filteredVideos = Array.isArray(videos) ? videos.filter(video => {
    const searchMatch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === "all" || video.category === selectedCategory;
    return searchMatch && categoryMatch;
  }) : [];

  const youtubeVideos = (youtubeData as any)?.videos || [];
  const animeOpenings = (musicData as any)?.openings || [];

  const handlePlayMusic = (id: string, url: string) => {
    if (currentPlaying === id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlaying(id);
      setIsPlaying(true);
      // Dans une vraie app, on ouvrirait le lecteur YouTube ou un iframe
      window.open(url, '_blank');
    }
  };

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
              <h1 className="text-2xl font-bold mb-2 text-otaku-purple">Collection Vidéo & Musique</h1>
              <p className="text-gray-300 text-sm mb-4">Découvrez des AMV, des openings et du contenu anime incroyable!</p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-electric-blue">🎵</div>
                  <div className="text-xs text-gray-400">Musique</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-hot-pink">🎬</div>
                  <div className="text-xs text-gray-400">Vidéos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-otaku-purple">✨</div>
                  <div className="text-xs text-gray-400">YouTube</div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-2 mb-6">
              <Button
                variant={activeTab === "local" ? "default" : "outline"}
                onClick={() => setActiveTab("local")}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Vidéos Locales
              </Button>
              <Button
                variant={activeTab === "youtube" ? "default" : "outline"}
                onClick={() => setActiveTab("youtube")}
                className="flex-1"
              >
                <Youtube className="w-4 h-4 mr-2" />
                YouTube
              </Button>
              <Button
                variant={activeTab === "music" ? "default" : "outline"}
                onClick={() => setActiveTab("music")}
                className="flex-1"
              >
                <Music className="w-4 h-4 mr-2" />
                Openings
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              {activeTab === "music" ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un anime pour ses openings..."
                    value={musicSearch}
                    onChange={(e) => setMusicSearch(e.target.value)}
                    className="pl-10 bg-card-bg border-gray-700 text-white"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={activeTab === "youtube" ? "Rechercher sur YouTube..." : "Rechercher des vidéos..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-card-bg border-gray-700 text-white"
                  />
                </div>
              )}

              {activeTab === "local" && (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-card-bg border-gray-700 text-white">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-bg border-gray-700">
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="amv">AMV</SelectItem>
                    <SelectItem value="opening">Opening</SelectItem>
                    <SelectItem value="ending">Ending</SelectItem>
                    <SelectItem value="ost">OST</SelectItem>
                    <SelectItem value="compilation">Compilation</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "local" && (
            <>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 bg-card-bg rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVideos.map((video, index) => (
                    <VideoCard key={video.id || index} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-lg font-semibold mb-2">Aucune vidéo trouvée</h3>
                  <p className="text-gray-400">Essayez d'ajuster votre recherche ou vos filtres</p>
                </div>
              )}
            </>
          )}

          {activeTab === "youtube" && (
            <>
              {youtubeLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 bg-card-bg rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : searchTerm.length < 3 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold mb-2">Rechercher sur YouTube</h3>
                  <p className="text-gray-400">Tapez au moins 3 caractères pour rechercher des vidéos d'anime</p>
                </div>
              ) : youtubeVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {youtubeVideos.map((video: any, index: number) => (
                    <Card key={video.id || index} className="bg-card-bg border-border hover:border-accent-primary/50 transition-all duration-300 cursor-pointer group overflow-hidden">
                      <div className="relative aspect-video bg-gradient-to-br from-accent-primary/20 to-hot-pink/20">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Youtube className="w-12 h-12 text-accent-primary/60" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            size="icon"
                            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/50"
                            onClick={() => window.open(video.videoUrl, '_blank')}
                          >
                            <Play className="w-8 h-8 text-white fill-white" />
                          </Button>
                        </div>

                        <Badge className="absolute top-2 left-2 bg-red-600/90 text-white border-0">
                          <Youtube className="w-3 h-3 mr-1" />
                          YouTube
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-text-primary line-clamp-2 mb-2 group-hover:text-accent-primary transition-colors">
                          {video.title}
                        </h3>
                        
                        {video.description && (
                          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                            {video.description.substring(0, 100)}...
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">😅</div>
                  <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
                  <p className="text-gray-400">Aucun résultat trouvé pour cette recherche</p>
                </div>
              )}
            </>
          )}

          {activeTab === "music" && (
            <>
              {musicLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 bg-card-bg rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : musicSearch.length < 3 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎵</div>
                  <h3 className="text-lg font-semibold mb-2">Rechercher des Openings</h3>
                  <p className="text-gray-400">Tapez le nom d'un anime pour trouver ses openings</p>
                </div>
              ) : animeOpenings.length > 0 ? (
                <div className="space-y-4">
                  {animeOpenings.map((opening: any, index: number) => (
                    <Card key={opening.id || index} className="bg-card-bg border-border hover:border-accent-primary/50 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-accent-primary/20 to-hot-pink/20">
                            {opening.thumbnailUrl ? (
                              <img
                                src={opening.thumbnailUrl}
                                alt={opening.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="w-6 h-6 text-accent-primary/60" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text-primary truncate">
                              {opening.title}
                            </h3>
                            <p className="text-sm text-text-secondary truncate">
                              {opening.artist}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {opening.anime}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Opening
                              </Badge>
                            </div>
                          </div>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-accent-primary hover:bg-accent-primary/10"
                            onClick={() => handlePlayMusic(opening.id, opening.audioUrl)}
                          >
                            {currentPlaying === opening.id && isPlaying ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎼</div>
                  <h3 className="text-lg font-semibold mb-2">Aucun opening trouvé</h3>
                  <p className="text-gray-400">Aucun résultat pour cet anime</p>
                </div>
              )}
            </>
          )}
        </main>

        <BottomNavigation currentPath="/videos" />
      </div>
    </div>
  );
}