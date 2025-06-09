import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Eye, Heart, HeartOff, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimeDetailModalProps {
  anime: {
    id: number;
    malId?: number;
    title: string;
    imageUrl?: string;
    score?: string;
    year?: number;
    synopsis?: string;
    episodes?: number;
    status?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function AnimeDetailModal({ anime, isOpen, onClose }: AnimeDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(false);

  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/favorites", { 
        animeId: anime.id,
        rating: 5 
      });
    },
    onSuccess: () => {
      setIsFavorited(true);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      toast({
        title: "Added to Favorites",
        description: `${anime.title} has been added to your favorites!`,
        variant: "default",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to add anime to favorites.",
        variant: "destructive",
      });
    },
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/favorites/${anime.id}`);
    },
    onSuccess: () => {
      setIsFavorited(false);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      toast({
        title: "Removed from Favorites",
        description: `${anime.title} has been removed from your favorites.`,
        variant: "default",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to remove anime from favorites.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = () => {
    if (isFavorited) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const imageUrl = anime.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card-bg text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold electric-blue">{anime.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Anime Image */}
          <div className="relative">
            <img 
              src={imageUrl} 
              alt={anime.title} 
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              onClick={handleFavoriteToggle}
              className={cn(
                "absolute top-3 right-3 w-10 h-10 rounded-full p-0",
                isFavorited ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
              )}
              disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
            >
              {isFavorited ? (
                <Heart className="w-5 h-5 text-white fill-current" />
              ) : (
                <HeartOff className="w-5 h-5 text-white" />
              )}
            </Button>
          </div>

          {/* Anime Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 electric-blue" />
                <span className="font-semibold">{anime.score || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 hot-pink" />
                <span>{anime.year || 'TBA'}</span>
              </div>
            </div>

            {anime.episodes && (
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 otaku-purple" />
                <span>{anime.episodes} episodes</span>
              </div>
            )}

            {anime.status && (
              <Badge className={cn(
                anime.status === 'Finished Airing' ? 'bg-green-500/20 text-green-400' :
                anime.status === 'Currently Airing' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              )}>
                {anime.status}
              </Badge>
            )}

            {anime.synopsis && (
              <div>
                <h4 className="font-semibold mb-2">Synopsis</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {anime.synopsis}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleFavoriteToggle}
              disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
              className={cn(
                "flex-1",
                isFavorited ? "bg-red-500 hover:bg-red-600" : "bg-electric-blue hover:bg-electric-blue/80"
              )}
            >
              {isFavorited ? (
                <>
                  <Heart className="w-4 h-4 mr-2 fill-current" />
                  Remove from Favorites
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Favorites
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={() => {
                // Here you could implement watching functionality
                toast({
                  title: "Feature Coming Soon",
                  description: "Anime streaming will be available soon!",
                  variant: "default",
                });
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Watch
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}