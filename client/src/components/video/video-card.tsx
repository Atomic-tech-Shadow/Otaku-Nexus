import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Eye, Clock } from "lucide-react";

interface VideoCardProps {
  video: {
    id: number;
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: string;
    views?: number;
    category?: string;
  };
  onClick?: () => void;
  compact?: boolean;
}

export default function VideoCard({ video, onClick, compact = false }: VideoCardProps) {
  return (
    <Card 
      className="bg-card-bg border-border hover:border-accent-primary/50 transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-gradient-to-br from-accent-primary/20 to-hot-pink/20">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-accent-primary/60" />
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="icon"
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/50"
          >
            <Play className="w-8 h-8 text-white fill-white" />
          </Button>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0">
            <Clock className="w-3 h-3 mr-1" />
            {video.duration}
          </Badge>
        )}

        {/* Category badge */}
        {video.category && (
          <Badge className="absolute top-2 left-2 bg-accent-primary/90 text-white border-0">
            {video.category.toUpperCase()}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-text-primary line-clamp-2 mb-2 group-hover:text-accent-primary transition-colors">
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {video.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-text-secondary">
          {video.views !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{video.views.toLocaleString()} vues</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}