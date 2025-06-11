
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Phone, Video, Settings, Send, Smile, ThumbsUp, Camera, Mic, MoreHorizontal } from "lucide-react";
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
    onSuccess: (newMessage) => {
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
    <div className="min-h-screen bg-app-bg flex flex-col">
      <ConnectionStatus />
      {/* Header - Style Facebook Messenger */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-10 w-10 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium text-sm">
                🌸
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 text-lg">🌸 Chat Global Otaku</h2>
            <p className="text-xs text-green-600 font-medium">● Chat de groupe global • {messages.filter((m, i, arr) => arr.findIndex(msg => msg.userId === m.userId) === i).length} membres</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-gray-100 text-blue-600"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-gray-100 text-blue-600"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Container - Style Facebook */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="py-4 space-y-3">
            {error && (
              <div className="text-center py-4">
                <p className="text-red-400 text-sm">Erreur de chargement des messages</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="mt-2 border-border hover:bg-accent-hover/10"
                >
                  Réessayer
                </Button>
              </div>
            )}
            
            {!error && messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center border border-blue-200">
                  <span className="text-3xl">👋</span>
                </div>
                <p className="text-gray-900 text-lg font-medium">Commencez la conversation</p>
                <p className="text-gray-600 text-sm mt-1">Dites bonjour à la communauté otaku !</p>
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
                      <div className="text-center my-6">
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    <div className={cn(
                      "flex items-end gap-2 max-w-[75%]",
                      isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto",
                      isConsecutive && !isOwnMessage ? "ml-9" : ""
                    )}>
                      {!isOwnMessage && (
                        <Avatar className={cn(
                          "h-8 w-8 flex-shrink-0 border-2 border-white shadow-sm", 
                          showAvatar ? "opacity-100" : "opacity-0"
                        )}>
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white border-0 font-medium">
                            {message.userFirstName?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex flex-col max-w-[70%]">
                        {!isOwnMessage && showName && (
                          <div className="text-xs font-medium text-gray-600 mb-1 px-3">
                            {message.userFirstName}
                            {message.isAdmin && (
                              <span className="ml-1 text-blue-600">✓</span>
                            )}
                          </div>
                        )}
                        
                        <div className={cn(
                          "relative px-4 py-3 rounded-3xl max-w-full break-words text-sm leading-relaxed shadow-sm",
                          isOwnMessage
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-900 border border-gray-200",
                          isOwnMessage && !isConsecutive ? "rounded-br-lg" : "",
                          !isOwnMessage && !isConsecutive ? "rounded-bl-lg" : "",
                          isConsecutive && isOwnMessage ? "rounded-br-3xl" : "",
                          isConsecutive && !isOwnMessage ? "rounded-bl-3xl" : ""
                        )}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        {/* Réactions (pour l'instant en placeholder) */}
                        <div className="flex items-center gap-1 mt-1 px-2">
                          <span className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">👍</span>
                          <span className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">❤️</span>
                          <span className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">😂</span>
                          <span className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">😮</span>
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

        {/* Message Input - Style Facebook */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100 text-blue-600 flex-shrink-0"
            >
              <Camera className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez un message..."
                className="bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-gray-900 placeholder-gray-500"
                disabled={sendMessageMutation.isPending}
                maxLength={1000}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100 text-blue-600 flex-shrink-0"
            >
              <Mic className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100 text-blue-600 flex-shrink-0"
            >
              <Smile className="w-5 h-5" />
            </Button>

            {newMessage.trim() ? (
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                size="icon"
                className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 shadow-sm"
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
                className="h-9 w-9 rounded-full hover:bg-gray-100 text-blue-600 flex-shrink-0"
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
