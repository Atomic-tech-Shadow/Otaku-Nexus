
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";

interface Post {
  id: number;
  title: string;
  content: string;
  type: string;
  isPublished: boolean;
  authorId: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorLastName?: string;
  authorProfileImageUrl?: string;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "announcement": return "Annonce";
      case "event": return "Événement";
      case "update": return "Mise à jour";
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "announcement": return "default";
      case "event": return "secondary";
      case "update": return "outline";
      default: return "default";
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-lg border-blue-500/30 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.authorProfileImageUrl} />
              <AvatarFallback>
                {post.authorName?.[0]}{post.authorLastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">{post.authorName} {post.authorLastName}</h3>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400 bg-yellow-400/10">
                  <Crown className="h-3 w-3 mr-1" />
                  Créateur
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <Badge variant={getTypeBadgeVariant(post.type)}>
            {getTypeLabel(post.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-bold text-white mb-3">{post.title}</h2>
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        <div className="text-gray-300 whitespace-pre-wrap">
          {post.content}
        </div>
      </CardContent>
    </Card>
  );
}
