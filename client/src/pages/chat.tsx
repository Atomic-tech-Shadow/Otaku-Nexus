
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Phone, Video, Settings, Send, Smile, ThumbsUp, Camera, Mic } from "lucide-react";
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
      // Auto-scroll to bottom after sending
      setTimeout(() => {
        const container = document.getElementById('messages-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const container = document.getElementById('messages-container');
    if (container && messages.length > 0) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

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

  const goBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - Facebook Messenger style */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-10 w-10 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-500 text-white font-medium">
              OC
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">Otaku Community</h2>
            <p className="text-xs text-gray-500">Actif maintenant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-gray-100"
          >
            <Phone className="w-5 h-5 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-gray-100"
          >
            <Video className="w-5 h-5 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-gray-100"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 px-4" id="messages-container">
          <div className="py-4 space-y-1">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="text-gray-500 text-lg">Commencer la conversation</p>
                <p className="text-gray-400 text-sm mt-1">Dites bonjour à la communauté !</p>
              </div>
            ) : (
              messages.map((message: Message, index: number) => {
                const isOwnMessage = message.userId === user?.id;
                const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.userId !== message.userId);
                const showTime = index === 0 || 
                  new Date(message.createdAt).getTime() - new Date(messages[index - 1]?.createdAt).getTime() > 300000; // 5 minutes

                return (
                  <div key={message.id} className="space-y-1">
                    {showTime && (
                      <div className="text-center my-4">
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={cn(
                      "flex items-end gap-2 max-w-[80%]",
                      isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}>
                      {!isOwnMessage && (
                        <Avatar className={cn("h-7 w-7", showAvatar ? "opacity-100" : "opacity-0")}>
                          <AvatarFallback className="text-xs bg-gray-300 text-gray-700">
                            {message.userFirstName?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "relative px-3 py-2 rounded-2xl max-w-full break-words text-sm",
                        isOwnMessage
                          ? "bg-blue-500 text-white rounded-br-md"
                          : "bg-gray-200 text-gray-900 rounded-bl-md"
                      )}>
                        {!isOwnMessage && showAvatar && (
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            {message.userFirstName}
                          </div>
                        )}
                        <p>{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input - Facebook Messenger style */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100 text-blue-500"
            >
              <Camera className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message"
                className="bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                disabled={sendMessageMutation.isPending}
                maxLength={500}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100 text-blue-500"
            >
              <Mic className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100 text-blue-500"
            >
              <Smile className="w-5 h-5" />
            </Button>

            {newMessage.trim() ? (
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                size="icon"
                className="h-9 w-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
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
                className="h-9 w-9 rounded-full hover:bg-gray-100 text-blue-500"
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
