import { useState, useEffect } from "react";
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
import { MessageCircle, Plus, Users, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

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
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

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
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💬 Chat Otaku</h1>
          <p className="text-blue-200">Discutez avec d'autres fans d'anime</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - Chat Rooms */}
          <div className="lg:col-span-1">
            <Card className="h-full bg-black/20 backdrop-blur-lg border-blue-500/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Salons
                </CardTitle>
                <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 text-white border-blue-500/30">
                    <DialogHeader>
                      <DialogTitle>Créer un salon</DialogTitle>
                    </DialogHeader>
                    <Form {...createRoomForm}>
                      <form onSubmit={createRoomForm.handleSubmit((data) => createRoomMutation.mutate(data))}>
                        <div className="space-y-4">
                          <FormField
                            control={createRoomForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom du salon</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Discussions Naruto" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createRoomForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (optionnel)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Description du salon..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={createRoomMutation.isPending}
                          >
                            {createRoomMutation.isPending ? "Création..." : "Créer"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-blue-200 mb-2">Mes salons</h4>
                      {roomsLoading ? (
                        <div className="text-gray-400">Chargement...</div>
                      ) : userRooms.length === 0 ? (
                        <div className="text-gray-400 text-sm">Aucun salon rejoint</div>
                      ) : (
                        userRooms.map((room: ChatRoom) => (
                          <Card
                            key={room.id}
                            className={`cursor-pointer transition-colors ${
                              selectedRoom?.id === room.id
                                ? "bg-blue-600/50 border-blue-400"
                                : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-600"
                            }`}
                            onClick={() => setSelectedRoom(room)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-white text-sm">{room.name}</h5>
                                {room.isPrivate && (
                                  <Badge variant="secondary" className="text-xs">Privé</Badge>
                                )}
                              </div>
                              {room.description && (
                                <p className="text-xs text-gray-300 mt-1 truncate">
                                  {room.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-blue-200 mb-2">Salons publics</h4>
                      {publicRooms.map((room: ChatRoom) => (
                        <Card
                          key={room.id}
                          className={`cursor-pointer transition-colors ${
                            selectedRoom?.id === room.id
                              ? "bg-blue-600/50 border-blue-400"
                              : "bg-gray-800/50 hover:bg-gray-700/50 border-gray-600"
                          }`}
                          onClick={() => setSelectedRoom(room)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-white text-sm">{room.name}</h5>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  joinRoomMutation.mutate(room.id);
                                }}
                                disabled={joinRoomMutation.isPending}
                              >
                                Rejoindre
                              </Button>
                            </div>
                            {room.description && (
                              <p className="text-xs text-gray-300 mt-1 truncate">
                                {room.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-black/20 backdrop-blur-lg border-blue-500/30">
              {selectedRoom ? (
                <>
                  <CardHeader className="border-b border-blue-500/30">
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      {selectedRoom.name}
                    </CardTitle>
                    {selectedRoom.description && (
                      <p className="text-blue-200 text-sm">{selectedRoom.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col h-full p-0">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      {messagesLoading ? (
                        <div className="text-gray-400">Chargement des messages...</div>
                      ) : messages.length === 0 ? (
                        <div className="text-gray-400 text-center mt-8">
                          Aucun message dans ce salon. Soyez le premier à écrire !
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.reverse().map((message: ChatMessage) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.userId === user?.id ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.userId === user?.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-700 text-white"
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <p className="text-xs opacity-75 mt-1">
                                  {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="border-t border-blue-500/30 p-4">
                      <Form {...sendMessageForm}>
                        <form 
                          onSubmit={sendMessageForm.handleSubmit((data) => sendMessageMutation.mutate(data))}
                          className="flex gap-2"
                        >
                          <FormField
                            control={sendMessageForm.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="Tapez votre message..."
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={sendMessageMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un salon pour commencer à discuter</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}