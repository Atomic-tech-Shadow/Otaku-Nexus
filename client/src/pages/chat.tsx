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
    refetchInterval: 3000, // Polling optimisé - 3 secondes
    staleTime: 2 * 1000, // 2 seconds
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col relative overflow-hidden">
      <ConnectionStatus />

      {/* Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 via-otaku-purple/5 to-anime-red/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-electric-blue/8 to-otaku-purple/8 rounded-full blur-3xl animate-pulse opacity-60"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-otaku-purple/8 to-anime-red/8 rounded-full blur-3xl animate-pulse opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-anime-red/6 to-hot-pink/6 rounded-full blur-3xl animate-pulse opacity-40" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-electric-blue/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-otaku-purple/40 rounded-full animate-bounce" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-32 left-16 w-4 h-4 bg-anime-red/25 rounded-full animate-bounce" style={{ animationDelay: '5s' }}></div>
      </div>

      {/* Ultra Modern Glass Header */}
      <div className="backdrop-blur-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-2xl sticky top-0 z-50 relative">
        {/* Animated border gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/20 via-transparent to-otaku-purple/20 opacity-50"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-11 w-11 rounded-2xl hover:bg-gradient-to-r hover:from-electric-blue/20 hover:to-otaku-purple/20 text-white/90 hover:text-white transition-all duration-500 border border-white/10 hover:border-electric-blue/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="relative group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-blue via-otaku-purple to-anime-red flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-300">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 border-3 border-white/20 rounded-full animate-pulse shadow-lg"></div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-electric-blue/30 animate-ping"></div>
          </div>
          
          <div className="flex-1">
            <h2 className="font-bold text-white text-xl bg-gradient-to-r from-white via-electric-blue to-white bg-clip-text">
              Chat Global Otaku
            </h2>
            <p className="text-sm text-white/80 flex items-center gap-2 font-medium">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-green-300">
                {messages.filter((m, i, arr) => arr.findIndex(msg => msg.userId === m.userId) === i).length} otakus en ligne
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-2xl hover:bg-gradient-to-r hover:from-electric-blue/20 hover:to-otaku-purple/20 text-white/70 hover:text-white transition-all duration-500 border border-white/10 hover:border-electric-blue/30"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-2xl hover:bg-gradient-to-r hover:from-electric-blue/20 hover:to-otaku-purple/20 text-white/70 hover:text-white transition-all duration-500 border border-white/10 hover:border-electric-blue/30"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-2xl hover:bg-gradient-to-r hover:from-electric-blue/20 hover:to-otaku-purple/20 text-white/70 hover:text-white transition-all duration-500 border border-white/10 hover:border-electric-blue/30"
          >
            <MoreHorizontal className="w-5 h-5" />
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
                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 max-w-sm mx-auto shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-electric-blue to-otaku-purple rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">Commencez la conversation</h3>
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
                  new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 300000; // 5 minutes

                return (
                  <div key={`${message.id}-${index}`} className="space-y-1">
                    {showTime && (
                      <div className="text-center my-6">
                        <div className="inline-flex items-center px-3 py-1.5 rounded-full backdrop-blur-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10 shadow-lg">
                          <span className="text-xs text-white/80 font-medium">
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
                          <Avatar className="w-10 h-10 border-2 border-white/20 shadow-lg ring-2 ring-electric-blue/20">
                            <AvatarImage 
                              src={message.userProfileImageUrl} 
                              alt={`${message.userFirstName} ${message.userLastName}`}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-sm bg-gradient-to-r from-electric-blue to-otaku-purple text-white font-bold">
                              {(message.userFirstName?.[0] || '') + (message.userLastName?.[0] || '')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}

                      <div className="flex flex-col max-w-[80%]">
                        {!isOwnMessage && showName && (
                          <div className="flex items-center gap-2 mb-3 ml-1">
                            <span className="text-sm font-semibold text-white bg-gradient-to-r from-white to-electric-blue bg-clip-text">
                              {message.userFirstName} {message.userLastName}
                            </span>
                            {message.isAdmin && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-electric-blue/20 to-otaku-purple/20 border border-electric-blue/40 shadow-lg">
                                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-electric-blue to-otaku-purple animate-pulse"></span>
                                <span className="text-xs text-electric-blue font-bold tracking-wide">ADMIN</span>
                              </span>
                            )}
                          </div>
                        )}

                        <div className={cn(
                          "relative px-6 py-4 rounded-3xl max-w-full break-words text-sm leading-relaxed shadow-2xl backdrop-blur-2xl transform hover:scale-[1.02] transition-all duration-300 group",
                          isOwnMessage
                            ? "bg-gradient-to-br from-electric-blue via-otaku-purple to-anime-red text-white border border-electric-blue/40 shadow-electric-blue/20"
                            : "bg-gradient-to-br from-white/15 to-white/5 text-white border border-white/20 hover:border-white/30",
                          isOwnMessage && !isConsecutive ? "rounded-br-lg" : "",
                          !isOwnMessage && !isConsecutive ? "rounded-bl-lg" : ""
                        )}>
                          {/* Message glow effect */}
                          {isOwnMessage && (
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-electric-blue/20 to-otaku-purple/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                          )}
                          
                          <div className="whitespace-pre-wrap font-medium text-base leading-relaxed">{message.content}</div>

                          {/* Enhanced timestamp */}
                          <div className={cn(
                            "text-xs mt-3 opacity-60 group-hover:opacity-80 transition-opacity duration-300 flex items-center gap-2",
                            isOwnMessage ? "text-white/80 justify-end" : "text-white/60"
                          )}>
                            <span className="w-1 h-1 rounded-full bg-current opacity-50"></span>
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
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