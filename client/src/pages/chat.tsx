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
          <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 h-[65vh] flex flex-col rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-electric-blue" />
                Chat Communauté
                <span className="text-sm text-gray-400 font-normal">
                  • {messages.length} messages
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">En ligne</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 bg-gray-900/50">
              <ScrollArea className="h-full">
                <div className="px-4 py-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400 text-lg">Commencer la conversation</p>
                      <p className="text-gray-500 text-sm mt-1">Soyez le premier à dire bonjour !</p>
                    </div>
                  ) : (
                    <div className="space-y-3 py-2">
                      {messages.map((message: Message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3 items-start group",
                            message.userId === user?.id ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-gray-700/50">
                            <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-electric-blue to-hot-pink text-white">
                              {message.userFirstName?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "flex flex-col max-w-[75%]",
                            message.userId === user?.id ? "items-end" : "items-start"
                          )}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-300">
                                {message.userFirstName} {message.userLastName}
                              </span>
                              {message.isAdmin && (
                                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                              )}
                              <span className="text-xs text-gray-500">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                            <div className={cn(
                              "relative px-4 py-2.5 rounded-2xl shadow-lg max-w-full break-words",
                              message.userId === user?.id
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                                : "bg-gray-700/70 text-gray-100 rounded-bl-md"
                            )}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              {/* Message tail */}
                              <div className={cn(
                                "absolute top-0 w-3 h-3",
                                message.userId === user?.id
                                  ? "-right-1 bg-blue-600"
                                  : "-left-1 bg-gray-700/70"
                              )} style={{
                                clipPath: message.userId === user?.id 
                                  ? "polygon(0 0, 100% 100%, 0 100%)"
                                  : "polygon(100% 0, 0 100%, 100% 100%)"
                              }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Écrivez un message..."
                    className="bg-gray-800/50 border-gray-600/50 rounded-full px-6 py-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    disabled={sendMessageMutation.isPending}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full w-12 h-12 p-0 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  {sendMessageMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="w-5 h-5" />
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