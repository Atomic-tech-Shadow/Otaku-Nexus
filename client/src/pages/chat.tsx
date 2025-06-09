import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, Users, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");

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
      toast({
        title: "Message envoyé !",
        description: "Votre message a été envoyé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder au chat.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Chat Global</h1>
            <p className="text-sm text-white/70">
              {messages.length} messages • Communauté Anime
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4">
        <Card className="h-[calc(100vh-200px)] bg-black/40 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full flex flex-col gap-4">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-white/50" />
                    <p className="text-white/70">
                      Aucun message pour le moment. Soyez le premier à écrire !
                    </p>
                  </div>
                ) : (
                  messages.map((message: Message) => (
                    <div
                      key={`${message.id}-${message.createdAt}`}
                      className={cn(
                        "flex gap-3 p-4 rounded-lg transition-all hover:bg-white/5",
                        message.userId === user.id ? "bg-purple-500/20" : "bg-white/10"
                      )}
                    >
                      <Avatar className="h-10 w-10 border-2 border-white/20">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                          {message.userFirstName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">
                            {message.userFirstName} {message.userLastName}
                          </span>
                          {message.isAdmin && (
                            <Crown className="h-4 w-4 text-yellow-400" title="Créateur" />
                          )}
                          <span className="text-xs text-white/50">
                            {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-white/90 break-words">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400"
                disabled={sendMessageMutation.isPending}
                maxLength={500}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {sendMessageMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}