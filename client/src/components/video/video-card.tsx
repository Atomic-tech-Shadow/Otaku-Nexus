import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Eye, Clock } from "lucide-react";

interface VideoCardProps {
  video: {
    id: number;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    duration?: string;
    views?: number;
    createdAt?: string;
    category?: string;
  };
  compact?: boolean;
}

export default function VideoCard({ video, compact = false }: VideoCardProps) {
  const thumbnailUrl = video.thumbnailUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200";
  
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <Card className="bg-card-bg hover:bg-secondary-bg transition-all duration-300 card-hover border-gray-800">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            <img 
              src={thumbnailUrl} 
              alt={video.title} 
              className="w-16 h-12 object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
              <Play className="w-4 h-4 text-white" />
            </div>
            {video.duration && (
              <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                {video.duration}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1 line-clamp-2">{video.title}</h4>
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              {video.duration && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {video.duration}
                </span>
              )}
              {video.views && (
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {formatViews(video.views)} views
                </span>
              )}
              {video.createdAt && (
                <span>{formatDate(video.createdAt)}</span>
              )}
            </div>
            {video.category && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-electric-blue/20 text-electric-blue rounded-full">
                {video.category}
              </span>
            )}
          </div>

          {/* Play Button */}
          <Button 
            size="sm" 
            className="w-8 h-8 bg-electric-blue hover:bg-electric-blue/80 rounded-full p-0 btn-hover flex-shrink-0"
          >
            <Play className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
