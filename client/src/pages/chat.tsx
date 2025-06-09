
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Users, Hash, Plus, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/chat/rooms"],
    enabled: isAuthenticated,
  });

  // Fetch messages for selected room
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/rooms", selectedRoom, "messages"],
    enabled: isAuthenticated && selectedRoom !== null,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string }) => {
      if (!selectedRoom) throw new Error("No room selected");
      return apiRequest(`/api/chat/rooms/${selectedRoom}/messages`, {
        method: "POST",
        body: messageData,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/rooms", selectedRoom, "messages"] 
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !selectedRoom) return;
    sendMessageMutation.mutate({ content: message.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-black/20 backdrop-blur-lg border-blue-500/30">
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Connexion requise</h2>
            <p className="text-gray-300">Vous devez être connecté pour accéder au chat</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <AppHeader />
      
      <div className="pt-16 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
            
            {/* Sidebar - Chat Rooms */}
            <div className="lg:col-span-1">
              <Card className="h-full bg-black/20 backdrop-blur-lg border-blue-500/30">
                <div className="p-4 border-b border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Hash className="h-5 w-5 text-blue-400" />
                      Salles de chat
                    </h2>
                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(100%-80px)]">
                  {roomsLoading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-700/30 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {rooms.map((room: any) => (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room.id)}
                          className={`w-full p-3 rounded-lg text-left transition-all hover:bg-blue-500/20 ${
                            selectedRoom === room.id 
                              ? "bg-blue-500/30 border border-blue-400/50" 
                              : "hover:bg-gray-700/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium"># {room.name}</span>
                            <Badge variant="secondary" className="bg-gray-700/50 text-gray-300">
                              {room.memberCount || 0}
                            </Badge>
                          </div>
                          {room.description && (
                            <p className="text-sm text-gray-400 mt-1 truncate">
                              {room.description}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              {selectedRoom ? (
                <Card className="h-full bg-black/20 backdrop-blur-lg border-blue-500/30 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Hash className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {rooms.find((r: any) => r.id === selectedRoom)?.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {rooms.find((r: any) => r.id === selectedRoom)?.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {rooms.find((r: any) => r.id === selectedRoom)?.memberCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex gap-3">
                            <div className="h-8 w-8 bg-gray-700/30 rounded-full animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-700/30 rounded animate-pulse w-1/3" />
                              <div className="h-6 bg-gray-700/30 rounded animate-pulse w-2/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Aucun message dans cette salle</p>
                        <p className="text-sm text-gray-500 mt-1">Soyez le premier à démarrer la conversation !</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg: any, index: number) => (
                          <div key={`${msg.id}-${index}`} className="flex gap-3 group hover:bg-gray-800/20 p-2 rounded-lg -mx-2 transition-colors">
                            <Avatar className="h-8 w-8 ring-2 ring-blue-500/30">
                              <AvatarImage src={msg.user?.profileImageUrl} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                                {msg.user?.firstName?.[0] || msg.user?.email?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white">
                                  {msg.user?.firstName || msg.user?.email?.split('@')[0] || "Utilisateur"}
                                </span>
                                {msg.user?.isAdmin && (
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                    Créateur
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(msg.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-gray-200 leading-relaxed break-words">
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-blue-500/20">
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tapez votre message..."
                        className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="h-full bg-black/20 backdrop-blur-lg border-blue-500/30 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Bienvenue dans le chat !</h3>
                    <p className="text-gray-400">Sélectionnez une salle pour commencer à discuter</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation currentPath="/chat" />
    </div>
  );
}
