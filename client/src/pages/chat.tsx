import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/layout/main-layout";
import { TwitterVerificationBadge } from "@/components/ui/verification-badges";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";

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
    queryFn: async () => {
      const response = await fetch("/api/chat/messages", {
        headers: {
          "Authorization": localStorage.getItem('auth_token') ? `Bearer ${localStorage.getItem('auth_token')}` : ''
        },
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    refetchInterval: 5000,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('auth_token') ? `Bearer ${localStorage.getItem('auth_token')}` : ''
        },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || "Failed to send message");
      }
      return response.json();
    },
    onMutate: async (newMessageContent) => {
      await queryClient.cancelQueries({ queryKey: ["/api/chat/messages"] });
      const previousMessages = queryClient.getQueryData(["/api/chat/messages"]);
      
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: newMessageContent,
        userId: user?.id || '',
        userFirstName: user?.firstName,
        userLastName: user?.lastName,
        userProfileImageUrl: user?.profileImageUrl,
        isAdmin: user?.isAdmin,
        timestamp: new Date().toISOString(),
        isOwn: true
      };

      queryClient.setQueryData(["/api/chat/messages"], (old: any) => {
        return [...(old || []), optimisticMessage];
      });

      setNewMessage("");
      return { previousMessages };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/chat/messages"], (old: any) => {
        const messages = old || [];
        const filteredMessages = messages.filter((msg: any) => !msg.id.startsWith('temp-'));
        return [...filteredMessages, data];
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["/api/chat/messages"], context.previousMessages);
      }
      setNewMessage(variables);
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
      id: `${msg.id}-${msg.createdAt || msg.timestamp}-${index}`,
      isOwn: msg.userId === user?.id
    }))
    .sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.timestamp).getTime();
      const dateB = new Date(b.createdAt || b.timestamp).getTime();
      return dateA - dateB;
    }) : [];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 bg-nexus-cyan"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-5 w-24 h-24 rounded-full opacity-15 bg-nexus-pink"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-5 w-20 h-20 rounded-full opacity-25 bg-nexus-purple"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Chat Header */}
        <motion.section 
          className="mb-4 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-morphism rounded-2xl p-6 relative overflow-hidden card-hover">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-nexus-cyan to-transparent rounded-full opacity-30" />
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8 text-nexus-cyan" />
              <div>
                <h1 className="text-xl font-bold text-white">Otaku Chat</h1>
                <p className="text-gray-300 text-sm">Connect with fellow anime fans</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-nexus-cyan">💬</div>
                <div className="text-xs text-gray-400">Live Chat</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-nexus-pink">👥</div>
                <div className="text-xs text-gray-400">Community</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-nexus-purple">⚡</div>
                <div className="text-xs text-gray-400">Real Time</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Messages Container */}
        <motion.div 
          className="flex-1 px-4 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="glass-morphism rounded-2xl p-4 h-96 overflow-y-auto custom-scroll">
            <div className="space-y-4">
              {processedMessages.length === 0 ? (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <MessageCircle className="w-16 h-16 text-nexus-cyan mx-auto mb-4 opacity-50" />
                  <p className="text-gray-300 mb-2">No messages yet</p>
                  <p className="text-sm text-gray-400">Be the first to start the conversation!</p>
                </motion.div>
              ) : (
                processedMessages.map((message: any, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isOwn 
                        ? 'bg-gradient-to-r from-nexus-cyan to-nexus-purple text-white' 
                        : 'bg-nexus-surface text-white'
                    }`}>
                      {!message.isOwn && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-semibold text-nexus-cyan">
                            {message.userFirstName || message.username}
                          </span>
                          {message.isAdmin && <TwitterVerificationBadge size="sm" />}
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.createdAt || message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </motion.div>

        {/* Message Input */}
        <motion.div 
          className="px-4 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="glass-morphism rounded-2xl p-4">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-nexus-surface border-nexus-cyan/30 text-white placeholder-gray-400 focus:border-nexus-cyan"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="btn-hover bg-gradient-to-r from-nexus-cyan to-nexus-purple hover:from-nexus-purple hover:to-nexus-pink"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}