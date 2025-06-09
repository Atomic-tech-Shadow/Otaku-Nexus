import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import VideoCard from "@/components/video/video-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Play, TrendingUp, Clock } from "lucide-react";

export default function Videos() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: allVideos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos"],
    retry: false,
  });

  const { data: popularVideos, isLoading: popularLoading } = useQuery({
    queryKey: ["/api/videos/popular"],
    retry: false,
  });

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
            <h1 className="text-2xl font-bold mb-2 text-gradient">Anime Videos</h1>
            <p className="text-gray-400 text-sm">AMVs, openings, and anime content</p>
          </div>

          {/* Stats Cards */}
          <section className="mb-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card-bg rounded-xl p-4 text-center">
                <Play className="w-6 h-6 electric-blue mx-auto mb-2" />
                <div className="text-lg font-bold">{allVideos?.length || 0}</div>
                <div className="text-xs text-gray-400">Videos</div>
              </div>
              <div className="bg-card-bg rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 hot-pink mx-auto mb-2" />
                <div className="text-lg font-bold">{popularVideos?.length || 0}</div>
                <div className="text-xs text-gray-400">Popular</div>
              </div>
              <div className="bg-card-bg rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 otaku-purple mx-auto mb-2" />
                <div className="text-lg font-bold">
                  {allVideos?.reduce((total: number, video: any) => {
                    const duration = video.duration || "0:00";
                    const minutes = duration.split(':').reduce((acc: number, time: string, i: number) => {
                      return acc + parseInt(time) * Math.pow(60, duration.split(':').length - 1 - i);
                    }, 0) / 60;
                    return total + minutes;
                  }, 0).toFixed(0) || 0}m
                </div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>
          </section>

          {/* Popular Videos */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 hot-pink mr-2" />
              Popular Videos
            </h3>
            {popularLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card-bg rounded-xl p-3 animate-pulse h-20"></div>
                ))}
              </div>
            ) : popularVideos && popularVideos.length > 0 ? (
              <div className="space-y-3">
                {popularVideos.map((video: any) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No popular videos available</p>
              </div>
            )}
          </section>

          {/* All Videos */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Play className="w-5 h-5 electric-blue mr-2" />
              All Videos
            </h3>
            {videosLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-card-bg rounded-xl p-3 animate-pulse h-20"></div>
                ))}
              </div>
            ) : allVideos && allVideos.length > 0 ? (
              <div className="space-y-3">
                {allVideos.map((video: any) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-400">No Videos Available</h3>
                <p className="text-gray-500">Check back later for awesome anime content!</p>
              </div>
            )}
          </section>
        </main>

        <BottomNavigation currentPath="/videos" />
      </div>
    </div>
  );
}
