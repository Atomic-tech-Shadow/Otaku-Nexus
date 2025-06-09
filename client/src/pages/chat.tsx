
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Plus, 
  Users, 
  Settings, 
  Search, 
  Phone, 
  Video, 
  Info,
  Smile,
  Paperclip,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";

interface ChatRoom {
  id: number;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
}

interface ChatMessage {
  id: number;
  roomId: number;
  userId: string;
  message: string;
  messageType: string;
  createdAt: string;
}

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat rooms
  const { data: chatRooms = [] } = useQuery({
    queryKey: ["/api/chat/rooms/public"],
    enabled: isAuthenticated,
  });

  // Fetch messages for selected room
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat/rooms", selectedRoom?.id, "messages"],
    queryFn: () => selectedRoom ? apiRequest(`/api/chat/rooms/${selectedRoom.id}/messages`) : [],
    enabled: !!selectedRoom,
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string }) => {
      if (!selectedRoom) throw new Error("No room selected");
      return await apiRequest(`/api/chat/rooms/${selectedRoom.id}/messages`, {
        method: "POST",
        body: JSON.stringify(messageData),
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/rooms", selectedRoom?.id, "messages"] 
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (roomData: { name: string; description?: string; isPrivate: boolean }) => {
      return await apiRequest("/api/chat/rooms", {
        method: "POST",
        body: JSON.stringify(roomData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms/public"] });
      setNewRoomName("");
      setShowCreateRoom(false);
      toast({
        title: "Salon créé",
        description: "Le salon de discussion a été créé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le salon",
        variant: "destructive",
      });
    },
  });

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      return await apiRequest(`/api/chat/rooms/${roomId}/join`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Rejoint",
        description: "Vous avez rejoint le salon",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;
    sendMessageMutation.mutate({ message: newMessage });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleJoinRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    joinRoomMutation.mutate(room.id);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Card className="bg-card-bg border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-white mb-4">Vous devez être connecté pour accéder au chat</p>
            <Button onClick={() => window.location.href = "/auth"}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
      <AppHeader />
      
      <div className="flex h-[calc(100vh-140px)]">
        {/* Sidebar - Chat List */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-blue-500" />
                Messages
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher des conversations..."
                className="pl-10 bg-gray-100 dark:bg-gray-700 border-none"
              />
            </div>
          </div>

          {/* Create Room Form */}
          {showCreateRoom && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b">
              <Input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Nom du salon..."
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => createRoomMutation.mutate({
                    name: newRoomName,
                    description: `Salon créé par ${user?.firstName}`,
                    isPrivate: false,
                  })}
                  disabled={!newRoomName.trim() || createRoomMutation.isPending}
                  className="flex-1"
                >
                  Créer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateRoom(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Chat Rooms List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {chatRooms.map((room: ChatRoom) => (
                <div
                  key={room.id}
                  onClick={() => handleJoinRoom(room)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1
                    ${selectedRoom?.id === room.id 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {room.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">{room.name}</p>
                        <span className="text-xs opacity-75">
                          {formatTime(room.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs opacity-75 truncate">
                        {room.description || "Salon de discussion"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {selectedRoom.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {selectedRoom.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedRoom.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-blue-500">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-500">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-500">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message: ChatMessage) => {
                    const isOwnMessage = message.userId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                          {!isOwnMessage && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                                {message.userId.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`
                              px-4 py-2 rounded-2xl relative
                              ${isOwnMessage 
                                ? 'bg-blue-500 text-white rounded-br-md' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                              }
                            `}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-blue-500">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tapez un message..."
                      className="pr-20 bg-gray-100 dark:bg-gray-700 border-none rounded-full"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choisissez un salon dans la liste pour commencer à discuter
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation currentPath="/chat" />
    </div>
  );
}
