import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Phone, Video, Settings, Send, Smile, ThumbsUp, Camera, Mic, MoreHorizontal, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ConnectionStatus from "@/components/ui/connection-status";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Message {
  id: string;
  content: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  userProfileImageUrl?: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function Chat() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous êtes déconnecté. Reconnexion...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: messages = [], refetch, error } = useQuery<Message[]>({
    queryKey: ["/api/chat/messages"],
    enabled: !!user && isAuthenticated,
    refetchInterval: 1000, // Polling plus fréquent pour simuler le temps réel
    staleTime: 5 * 1000, // 5 seconds
    retry: 3,
    retryDelay: 300,
  });

  useEffect(() => {
    if (user && isAuthenticated) {
      refetch().catch(console.error);
    }
  }, [user, refetch, isAuthenticated]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!content.trim()) {
        throw new Error("Le message ne peut pas être vide");
      }
      return await apiRequest("/api/chat/messages", {
        method: "POST",
        body: { content: content.trim() },
      });
    },
    onSuccess: (newMessage: any) => {
      setNewMessage("");
      // Mise à jour optimiste locale
      queryClient.setQueryData(["/api/chat/messages"], (oldMessages: Message[] = []) => {
        const messageExists = oldMessages.some(msg => msg.id === newMessage.id);
        if (!messageExists) {
          return [...oldMessages, newMessage];
        }
        return oldMessages;
      });
      // Refetch pour synchroniser avec le serveur
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      // Scroll to bottom after sending
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    },
    onError: (error: any) => {
      console.error("Send message error:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

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
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Maintenant";
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}j`;

      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const goBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-text-primary">Connexion requise</h2>
          <p className="text-text-secondary">Vous devez être connecté pour accéder au chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col relative overflow-hidden">
      <ConnectionStatus />

      {/* Modern Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Modern Glassmorphism Header */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 px-6 py-4 flex items-center justify-between shadow-2xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-10 w-10 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-xl">💬</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-white text-xl">Chat Global Otaku</h2>
            <p className="text-sm text-white/70 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              {messages.filter((m, i, arr) => arr.findIndex(msg => msg.userId === m.userId) === i).length} membres connectés
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-all duration-300"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-all duration-300"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-all duration-300"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Modern Messages Container */}
      <div className="flex-1 flex flex-col relative z-10">
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          <div className="py-6 space-y-4">
            {error && (
              <div className="text-center py-8">
                <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-sm mx-auto">
                  <p className="text-red-300 text-sm mb-3">Erreur de chargement des messages</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                  >
                    Réessayer
                  </Button>
                </div>
              </div>
            )}

            {!error && messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-white text-lg font-semibold mb-2">Commencez la conversation</p>
                  <p className="text-white/60 text-sm">Dites bonjour à la communauté otaku !</p>
                </div>
              </div>
            ) : (
              messages.map((message: Message, index: number) => {
                const isOwnMessage = message.userId === user?.id;
                const prevMessage = messages[index - 1];
                const nextMessage = messages[index + 1];

                const showAvatar = !isOwnMessage && (
                  !nextMessage || 
                  nextMessage.userId !== message.userId || 
                  index === messages.length - 1
                );

                const showName = !isOwnMessage && (
                  !prevMessage || 
                  prevMessage.userId !== message.userId || 
                  index === 0
                );

                const showTime = index === 0 || 
                  new Date(message.createdAt).getTime() - new Date(messages[index - 1]?.createdAt).getTime() > 300000;

                const isConsecutive = prevMessage && 
                  prevMessage.userId === message.userId && 
                  new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 60000;

                return (
                  <div key={`${message.id}-${index}`} className="space-y-1">
                    {showTime && (
                      <div className="text-center my-8">
                        <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/20">
                          <span className="text-xs text-white/70 font-medium">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={cn(
                      "flex items-end gap-3 max-w-[85%]",
                      isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto",
                      isConsecutive && !isOwnMessage ? "ml-11" : ""
                    )}>
                      {!isOwnMessage && (
                        <div className={cn(
                          "flex-shrink-0", 
                          showAvatar ? "opacity-100" : "opacity-0"
                        )}>
                          <Avatar className="w-8 h-8 border-2 border-white/20 shadow-lg">
                            <AvatarImage 
                              src={message.userProfileImageUrl} 
                              alt={message.userFirstName}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                              {message.userFirstName?.[0]?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}

                      <div className="flex flex-col max-w-[80%]">
                        {!isOwnMessage && showName && (
                          <div className="flex items-center gap-2 mb-2 px-4">
                            <span className="text-sm font-semibold text-white/90">
                              {message.userFirstName}
                            </span>
                            {message.isAdmin && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                                <span className="text-xs text-blue-300 font-medium">Admin</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className={cn(
                          "relative px-5 py-3 rounded-2xl max-w-full break-words text-sm leading-relaxed shadow-xl backdrop-blur-xl",
                          isOwnMessage
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border border-blue-400/30"
                            : "bg-white/10 text-white border border-white/20",
                          isOwnMessage && !isConsecutive ? "rounded-br-md" : "",
                          !isOwnMessage && !isConsecutive ? "rounded-bl-md" : ""
                        )}>
                          <p className="whitespace-pre-wrap">{message.content}</p>

                          {/* Message timestamp */}
                          <div className={cn(
                            "text-xs mt-2 opacity-70",
                            isOwnMessage ? "text-white/70" : "text-white/50"
                          )}>
                            {new Date(message.createdAt).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Modern Message Input */}
        <div className="backdrop-blur-xl bg-white/10 border-t border-white/20 px-6 py-4 shadow-2xl relative z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-white/20 text-white/70 hover:text-white flex-shrink-0 transition-all duration-300"
            >
              <Camera className="w-5 h-5" />
            </Button>

            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez un message..."
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white/20 transition-all resize-none text-white placeholder-white/50 shadow-lg"
                disabled={sendMessageMutation.isPending}
                maxLength={1000}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-white/20 text-white/70 hover:text-white flex-shrink-0 transition-all duration-300"
            >
              <Mic className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-white/20 text-white/70 hover:text-white flex-shrink-0 transition-all duration-300"
            >
              <Smile className="w-5 h-5" />
            </Button>

            {newMessage.trim() ? (
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                size="icon"
                className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white flex-shrink-0 shadow-lg transition-all duration-300 hover:scale-105"
              >
                {sendMessageMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-white/20 text-white/70 hover:text-white flex-shrink-0 transition-all duration-300"
              >
                <ThumbsUp className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Indicateur d'activité */}
          <div className="text-xs text-gray-500 mt-2 px-2 flex items-center justify-between">
            <span className="animate-pulse">🌸 Chat global en temps réel</span>
            <span className="text-green-500">● En ligne</span>
          </div>
        </div>
      </div>
    </div>
  );
}