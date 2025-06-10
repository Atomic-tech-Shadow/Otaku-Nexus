
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
    refetchInterval: 3000,
    retry: 3,
    retryDelay: 1000,
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
      return await apiRequest("POST", "/api/chat/messages", { content: content.trim() });
    },
    onSuccess: () => {
      setNewMessage("");
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
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
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
      {/* Header - Chat style avec le thème de l'app */}
      <div className="bg-card-bg border-b border-border px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-10 w-10 rounded-full hover:bg-accent-hover/10 text-text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-accent-primary text-white font-medium text-sm">
              OC
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold text-text-primary text-lg">Otaku Community</h2>
            <p className="text-xs text-accent-hover font-medium">● Actif maintenant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-accent-hover/10 text-accent-primary"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-accent-hover/10 text-accent-primary"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-accent-hover/10 text-text-secondary"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 flex flex-col bg-app-bg">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="py-4 space-y-2">
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
                <div className="w-20 h-20 bg-accent-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center border border-accent-primary/20">
                  <span className="text-3xl">👋</span>
                </div>
                <p className="text-text-primary text-lg font-medium">Commencez la conversation</p>
                <p className="text-text-secondary text-sm mt-1">Dites bonjour à la communauté !</p>
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
                        <span className="text-xs text-text-secondary bg-card-bg px-3 py-1 rounded-full shadow-sm border border-border">
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
                          "h-7 w-7 flex-shrink-0", 
                          showAvatar ? "opacity-100" : "opacity-0"
                        )}>
                          <AvatarFallback className="text-xs bg-card-bg text-text-primary border border-border">
                            {message.userFirstName?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex flex-col">
                        {!isOwnMessage && showName && (
                          <div className="text-xs font-medium text-text-secondary mb-1 px-3">
                            {message.userFirstName}
                          </div>
                        )}
                        
                        <div className={cn(
                          "relative px-4 py-2 rounded-2xl max-w-full break-words text-sm leading-relaxed",
                          isOwnMessage
                            ? "bg-accent-primary text-white"
                            : "bg-card-bg text-text-primary border border-border shadow-sm",
                          isOwnMessage && !isConsecutive ? "rounded-br-lg" : "",
                          !isOwnMessage && !isConsecutive ? "rounded-bl-lg" : "",
                          isConsecutive && isOwnMessage ? "rounded-br-2xl" : "",
                          isConsecutive && !isOwnMessage ? "rounded-bl-2xl" : ""
                        )}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
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

        {/* Message Input */}
        <div className="bg-card-bg border-t border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-accent-hover/10 text-accent-primary flex-shrink-0"
            >
              <Camera className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez un message..."
                className="bg-app-bg border-border rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-accent-primary focus:bg-card-bg transition-all resize-none text-text-primary placeholder-text-secondary"
                disabled={sendMessageMutation.isPending}
                maxLength={1000}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-accent-hover/10 text-accent-primary flex-shrink-0"
            >
              <Mic className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-accent-hover/10 text-accent-primary flex-shrink-0"
            >
              <Smile className="w-5 h-5" />
            </Button>

            {newMessage.trim() ? (
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                size="icon"
                className="h-9 w-9 rounded-full bg-accent-primary hover:bg-accent-hover text-white flex-shrink-0"
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
                className="h-9 w-9 rounded-full hover:bg-accent-hover/10 text-accent-primary flex-shrink-0"
              >
                <ThumbsUp className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
