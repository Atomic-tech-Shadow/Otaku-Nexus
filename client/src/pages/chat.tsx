import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Message {
  id: string;
  content: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function Chat() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");

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

  const { data: messages = [], refetch } = useQuery({
    queryKey: ["/api/chat/messages"],
    queryFn: () => apiRequest("/api/chat/messages"),
    enabled: !!user,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("/api/chat/messages", {
        method: "POST",
        body: { content },
      }),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <AppHeader />
      
      <div className="px-4 pb-20">
        <div className="flex items-center mb-6 mt-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-electric-blue" />
              Chat Global
            </h1>
            <p className="text-gray-400 text-sm">Discutez avec la communauté otaku</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Messages Container */}
          <Card className="bg-card-bg border-gray-800 h-[60vh] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-electric-blue" />
                Messages
                <span className="text-sm text-gray-400 font-normal">
                  ({messages.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full px-6 pb-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">Aucun message pour le moment</p>
                      <p className="text-gray-500 text-sm">Soyez le premier à démarrer la conversation !</p>
                    </div>
                  ) : (
                    messages.map((message: Message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3 p-3 rounded-lg transition-all duration-200",
                          message.userId === user?.id
                            ? "bg-electric-blue/10 ml-8"
                            : "bg-secondary-bg/50 mr-8"
                        )}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-sm bg-gradient-to-br from-electric-blue to-hot-pink">
                            {message.userFirstName?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-white">
                              {message.userFirstName} {message.userLastName}
                            </span>
                            {message.isAdmin && (
                              <Crown className="w-3 h-3 text-yellow-400" />
                            )}
                            <span className="text-xs text-gray-400">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-200 text-sm break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card className="bg-card-bg border-gray-800">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 bg-secondary-bg border-gray-700"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-electric-blue hover:bg-electric-blue/80 btn-hover"
                >
                  {sendMessageMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat Rules */}
          <Card className="bg-card-bg/50 border-gray-800">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-sm">Règles du chat</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Respectez les autres membres de la communauté</li>
                <li>• Pas de spam ou de contenu inapproprié</li>
                <li>• Restez dans le thème anime/manga</li>
                <li>• Amusez-vous bien !</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation currentPath="/chat" />
    </div>
  );
}