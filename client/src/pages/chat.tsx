import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Send, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  content: string;
  userId: string;
  userEmail: string;
  userName: string;
  isAdmin: boolean;
  timestamp: Date;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connexion WebSocket simulée (à remplacer par vraie implémentation)
    const connectWebSocket = () => {
      // Simulation de connexion
      setIsConnected(true);

      // Messages de démonstration
      const demoMessages: Message[] = [
        {
          id: '1',
          content: 'Bienvenue dans le chat communautaire !',
          userId: 'admin',
          userEmail: 'admin@app.com',
          userName: 'Admin',
          isAdmin: true,
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: '2',
          content: 'Salut tout le monde !',
          userId: 'user1',
          userEmail: 'user1@test.com',
          userName: 'Utilisateur1',
          isAdmin: false,
          timestamp: new Date(Date.now() - 1800000)
        },
        {
          id: '3',
          content: 'Comment ça va ?',
          userId: 'user2',
          userEmail: 'user2@test.com',
          userName: 'Utilisateur2',
          isAdmin: false,
          timestamp: new Date(Date.now() - 900000)
        }
      ];

      setMessages(demoMessages);
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      userId: user.id,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      isAdmin: user.isAdmin || false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat Communautaire</h1>
            <p className="text-sm text-gray-600">
              {isConnected ? (
                <span className="text-green-600">● En ligne</span>
              ) : (
                <span className="text-red-600">● Hors ligne</span>
              )}
            </p>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {messages.length} messages
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={`msg-${message.id}`}
              className={`flex items-start space-x-3 ${
                message.userId === user?.id ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                <AvatarFallback className={`text-white font-semibold ${
                  message.isAdmin 
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                    : message.userId === user?.id
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-600'
                }`}>
                  {message.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className={`flex-1 max-w-xs md:max-w-md ${
                message.userId === user?.id ? 'text-right' : 'text-left'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {message.userName}
                  </span>
                  {message.isAdmin && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-2 py-0.5">
                      <Crown className="w-3 h-3 mr-1" />
                      Créateur
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                <div className={`p-3 rounded-2xl ${
                  message.userId === user?.id
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="pr-12 border-2 border-gray-200 focus:border-purple-500 rounded-full"
              disabled={!isConnected}
            />
          </div>
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {!isConnected && (
          <p className="text-sm text-red-600 mt-2 text-center">
            Connexion en cours...
          </p>
        )}
      </div>
    </div>
  );
}