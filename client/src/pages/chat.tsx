import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/layout/app-header";

import { Link } from "wouter";
import { TwitterVerificationBadge } from "@/components/ui/verification-badges";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Message {
  id: string;
  content: string;
  userId: string;
  username?: string;
  userFirstName?: string;
  userLastName?: string;
  userProfileImageUrl?: string;
  isAdmin?: boolean;
  timestamp: string;
  createdAt?: string;
  isOwn?: boolean;
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/chat/messages"],
    refetchInterval: 5000, // Moins fréquent pour réduire la charge
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Éviter les refetch inutiles
    staleTime: 30000, // Cache les données pendant 30 secondes
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onMutate: async (content: string) => {
      // Optimistic update - afficher le message immédiatement
      const previousMessages = queryClient.getQueryData(["/api/chat/messages"]);
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content,
        userId: user?.id,
        userFirstName: user?.firstName,
        userLastName: user?.lastName,
        userProfileImageUrl: user?.profileImageUrl,
        isAdmin: user?.isAdmin,
        createdAt: new Date().toISOString(),
        isOwn: true,
        isPending: true
      };
      
      queryClient.setQueryData(["/api/chat/messages"], (old: any) => 
        [...(old || []), tempMessage]
      );
      
      setNewMessage(""); // Vider le champ immédiatement
      return { previousMessages };
    },
    onSuccess: (data) => {
      // Remplacer le message temporaire par le vrai message
      queryClient.setQueryData(["/api/chat/messages"], (old: any) => {
        const messages = old || [];
        const filteredMessages = messages.filter((msg: any) => !msg.id.startsWith('temp-'));
        return [...filteredMessages, data];
      });
    },
    onError: (error, variables, context) => {
      // Restaurer l'état précédent en cas d'erreur
      if (context?.previousMessages) {
        queryClient.setQueryData(["/api/chat/messages"], context.previousMessages);
      }
      setNewMessage(variables); // Remettre le message dans le champ
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processedMessages = Array.isArray(messages) ? messages
    .map((msg: any, index: number) => ({
      ...msg,
      id: `${msg.id}-${msg.createdAt || msg.timestamp}-${index}`, // ID unique
      isOwn: msg.userId === user?.id
    }))
    .sort((a: any, b: any) => {
      // Tri par date de création pour afficher les plus récents en bas
      const dateA = new Date(a.createdAt || a.timestamp).getTime();
      const dateB = new Date(b.createdAt || b.timestamp).getTime();
      return dateA - dateB;
    }) : [];

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-electric-blue rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-5 w-24 h-24 bg-hot-pink rounded-full opacity-15 animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-5 w-20 h-20 bg-otaku-purple rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Custom Header for Chat */}
        <header className="bg-gradient-to-r from-card-bg to-secondary-bg p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>

              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-electric-blue">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-electric-blue to-hot-pink flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {(user?.firstName || user?.username || 'O').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold">Chat Global</h2>
                <span className="text-sm text-green-400">Otakus en ligne</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue"></div>
            </div>
          ) : processedMessages.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <span>Aucun message pour le moment</span>
            </div>
          ) : (
            processedMessages.map((message: any) => (
              <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-xs lg:max-w-md ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!message.isOwn && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      {message.userProfileImageUrl ? (
                        <img 
                          src={message.userProfileImageUrl} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-avatar')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'fallback-avatar w-full h-full bg-gradient-to-br from-electric-blue to-hot-pink flex items-center justify-center';
                              fallback.innerHTML = `<span class="text-xs font-bold text-white">${(message.userFirstName || message.username || 'A').charAt(0).toUpperCase()}</span>`;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-electric-blue to-hot-pink flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {(message.userFirstName || message.username || 'A').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.isOwn 
                      ? 'bg-gradient-to-r from-electric-blue to-hot-pink text-white ml-auto' 
                      : 'bg-gray-700 text-white'
                  }`}>
                    {!message.isOwn && (
                      <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <span>{message.userFirstName || message.username || 'Anonyme'}</span>
                        {message.isAdmin && (
                          <TwitterVerificationBadge size="sm" className="ml-1" />
                        )}
                      </div>
                    )}
                    <div className="text-sm">
                      {message.content}
                      {message.isPending && (
                        <span className="ml-2 opacity-50">
                          <LoadingSpinner size="sm" />
                        </span>
                      )}
                    </div>
                    <div className={`text-xs mt-1 ${message.isOwn ? 'text-gray-200' : 'text-gray-400'}`}>
                      {new Date(message.createdAt || message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="fixed bottom-16 left-0 right-0 bg-card-bg border-t border-gray-800 p-4">
          <div className="flex items-center space-x-2 max-w-md mx-auto">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez un message..."
              className="flex-1 bg-gray-700 border-none text-white placeholder-gray-400"
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-electric-blue to-hot-pink hover:opacity-90"
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>


      </div>
    </div>
  );
}