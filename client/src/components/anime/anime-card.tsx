import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Calendar, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimeDetailModal from "./anime-detail-modal";

interface AnimeCardProps {
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
  compact?: boolean;
}

export default function AnimeCard({ anime, compact = false }: AnimeCardProps) {
  const imageUrl = anime.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400";

  if (compact) {
    return (
      <div className="flex-shrink-0 w-32">
        <Card className="bg-card-bg hover:bg-secondary-bg transition-all duration-300 card-hover border-gray-800">
          <CardContent className="p-3">
            <img 
              src={imageUrl} 
              alt={anime.title} 
              className="w-full h-24 object-cover rounded-lg mb-2"
            />
            <h4 className="font-semibold text-xs mb-1 truncate">{anime.title}</h4>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center">
                <Star className="w-3 h-3 mr-1" />
                {anime.score || 'N/A'}
              </span>
              <span>{anime.year || 'TBA'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="bg-card-bg hover:bg-secondary-bg transition-all duration-300 card-hover border-gray-800">
      <CardContent className="p-4">
        <img 
          src={imageUrl} 
          alt={anime.title} 
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
        <h4 className="font-semibold text-sm mb-2 line-clamp-2">{anime.title}</h4>
        
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span className="flex items-center electric-blue">
            <Star className="w-3 h-3 mr-1" />
            {anime.score || 'N/A'}
          </span>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {anime.year || 'TBA'}
          </span>
        </div>

        {anime.episodes && (
          <div className="flex items-center text-xs text-gray-400 mb-2">
            <Eye className="w-3 h-3 mr-1" />
            {anime.episodes} episodes
          </div>
        )}

        {anime.status && (
          <div className="text-xs">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs",
              anime.status === 'Finished Airing' ? 'bg-green-500/20 text-green-400' :
              anime.status === 'Currently Airing' ? 'bg-blue-500/20 text-blue-400' :
              'bg-gray-500/20 text-gray-400'
            )}>
              {anime.status}
            </span>
          </div>
        )}

        {anime.synopsis && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-3">
            {anime.synopsis}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
