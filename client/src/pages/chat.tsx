import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle, Plus, Users, Send, Hash, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"

const createRoomSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

const sendMessageSchema = z.object({
  message: z.string().min(1, "Le message ne peut pas être vide"),
  messageType: z.string().default("text"),
});

interface ChatRoom {
  id: number;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  memberCount?: number;
}

interface ChatMessage {
  id: number;
  roomId: number;
  userId: string;
  content: string;
  messageType: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  }
}

// Placeholder AppHeader component
const AppHeader = () => (
  <header className="bg-gradient-to-r from-purple-700 to-blue-700 text-white py-4 shadow-md">
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold">💬 Chat Otaku</h1>
      <p className="text-sm">Discutez avec d'autres fans d'anime</p>
    </div>
  </header>
);

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté. Redirection...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, toast]);

  const createRoomForm = useForm<z.infer<typeof createRoomSchema>>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });

  const sendMessageForm = useForm<z.infer<typeof sendMessageSchema>>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      message: "",
      messageType: "text",
    },
  });

  // Fetch user's chat rooms
  const { data: userRooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/chat/rooms"],
    enabled: isAuthenticated,
  });

  // Fetch public chat rooms
  const { data: publicRooms = [] } = useQuery({
    queryKey: ["/api/chat/rooms/public"],
  });

  // Fetch messages for selected room
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat/rooms", selectedRoom?.id, "messages"],
    enabled: !!selectedRoom,
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createRoomSchema>) => {
      return await apiRequest("/api/chat/rooms", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      setIsCreateRoomOpen(false);
      createRoomForm.reset();
      toast({
        title: "Salon créé",
        description: "Votre salon de discussion a été créé avec succès.",
      });
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
        description: "Impossible de créer le salon.",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sendMessageSchema>) => {
      if (!selectedRoom) throw new Error("Aucun salon sélectionné");
      return await apiRequest(`/api/chat/rooms/${selectedRoom.id}/messages`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/rooms", selectedRoom?.id, "messages"] 
      });
      sendMessageForm.reset();
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

  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      return await apiRequest(`/api/chat/rooms/${roomId}/join`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      toast({
        title: "Rejoint",
        description: "Vous avez rejoint le salon avec succès.",
      });
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
        description: "Impossible de rejoindre le salon.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]);

  const rooms = [...userRooms, ...publicRooms];

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistically update the message list
    const tempMessage = {
      id: Date.now(),
      roomId: selectedRoom?.id,
      userId: user?.id,
      content: newMessage,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      user: {
        firstName: user?.firstName || 'Me',
        lastName: user?.lastName || '',
        profileImageUrl: user?.image || '',
      },
    };

    // Update local state immediately
    const optimisticMessages = [...messages, tempMessage];
    // messages.push(tempMessage)
    // setMessages(optimisticMessages);
    setNewMessage(''); // Clear the input field

    try {
      // Await the actual send message mutation
      await sendMessageMutation.mutateAsync({ message: newMessage, messageType: 'text' });
      // If successful, the query will invalidate and refetch
    } catch (error) {
      // If there's an error, revert the changes
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    } finally {
      setNewMessage('');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppHeader />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Chat Rooms Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="font-bold">Salons</span>
                </CardTitle>
                <Button 
                  onClick={() => setIsCreateRoomOpen(true)}
                  className="w-full bg-white/20 hover:bg-white/30 border-white/30 text-white font-medium"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un salon
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {rooms?.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-4 border-b border-white/10 cursor-pointer transition-all duration-200 ${
                        selectedRoom?.id === room.id 
                          ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-l-4 border-l-purple-400 shadow-lg' 
                          : 'hover:bg-white/5 hover:transform hover:scale-[1.02]'
                      }`}
                    >
                      <h3 className="font-semibold text-white text-sm">{room.name}</h3>
                      <p className="text-xs text-gray-300 mt-1 line-clamp-2">{room.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
                          <Users className="h-3 w-3 text-purple-300" />
                          <span className="text-xs text-purple-200 font-medium">{room.memberCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-3">
            {selectedRoom ? (
              <Card className="h-full flex flex-col bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                <CardHeader className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Hash className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold">{selectedRoom.name}</h2>
                      <p className="text-sm text-blue-100 font-normal">{selectedRoom.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-6" ref={messagesEndRef}>
                    <div className="space-y-6">
                      {messages?.map((message) => (
                        <div key={message.id} className="flex gap-4 group hover:bg-white/5 p-3 rounded-lg transition-all duration-200">
                          <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-purple-400/50">
                            <AvatarImage src={message.user?.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold">
                              {message.user?.firstName?.[0]}{message.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                {message.user?.firstName} {message.user?.lastName}
                              </span>
                              <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                                {formatMessageTime(message.createdAt)}
                              </span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                              <p className="text-white break-words leading-relaxed">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t border-white/20 p-6 flex-shrink-0 bg-white/5">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <div className="flex-1 relative">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Tapez votre message..."
                          className="bg-white/10 border-white/30 text-white placeholder:text-gray-300 focus:ring-purple-400 focus:border-purple-400 rounded-xl py-3 px-4 pr-12"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                <CardContent className="text-center p-12">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-6 rounded-full mx-auto mb-6 w-24 h-24 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Sélectionnez un salon
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
                    Choisissez un salon de discussion pour commencer à chatter avec la communauté
                  </p>
                  <div className="mt-8 flex justify-center">
                    <div className="bg-white/10 rounded-full px-6 py-2 border border-white/20">
                      <span className="text-purple-300 text-sm font-medium">💬 Discussions en temps réel</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}