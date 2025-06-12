import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

interface Message {
  id: string;
  content: string;
  userId: string;
  username?: string;
  userFirstName?: string;
  userLastName?: string;
  isAdmin?: boolean;
  timestamp: string;
  isOwn?: boolean;
}

interface ChatRoom {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  memberCount?: number;
}

export default function ChatScreen({ navigation }: any) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    loadChatRooms();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    if (currentRoom) {
      loadMessages();
      connectWebSocket();
    }
  }, [currentRoom]);

  const loadChatRooms = async () => {
    try {
      const rooms = await apiService.getChatRooms();
      setChatRooms(rooms);
      if (rooms.length > 0) {
        setCurrentRoom(rooms[0]); // Select first room by default
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!currentRoom) return;
    
    try {
      const roomMessages = await apiService.getChatMessages(currentRoom.id);
      const processedMessages = roomMessages.map(msg => ({
        ...msg,
        isOwn: msg.userId === user?.id,
      }));
      setMessages(processedMessages);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const connectWebSocket = () => {
    if (!currentRoom) return;

    // Close existing connection
    if (ws) {
      ws.close();
    }

    try {
      const websocket = new WebSocket(`ws://localhost:5000/chat/${currentRoom.id}`);
      
      websocket.onopen = () => {
        console.log('WebSocket connected');
      };

      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages(prev => [...prev, {
          ...message,
          isOwn: message.userId === user?.id,
        }]);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      setWs(websocket);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom || !user) return;

    try {
      const message = await apiService.sendChatMessage({
        roomId: currentRoom.id,
        content: newMessage.trim(),
        userId: user.id,
      });

      setNewMessage('');
      
      // If WebSocket is not connected, add message locally
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setMessages(prev => [...prev, {
          ...message,
          isOwn: true,
        }]);
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      {!item.isOwn && (
        <Text style={styles.senderName}>
          {item.userFirstName || item.username || 'Anonyme'}
          {item.isAdmin && ' 👑'}
        </Text>
      )}
      <Text style={[
        styles.messageText,
        item.isOwn ? styles.ownMessageText : styles.otherMessageText
      ]}>
        {item.content}
      </Text>
      <Text style={[
        styles.messageTime,
        item.isOwn ? styles.ownMessageTime : styles.otherMessageTime
      ]}>
        {formatMessageTime(item.timestamp)}
      </Text>
    </View>
  );

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={[
        styles.chatRoomItem,
        currentRoom?.id === item.id && styles.activeChatRoom
      ]}
      onPress={() => setCurrentRoom(item)}
    >
      <View style={styles.chatRoomInfo}>
        <Text style={[
          styles.chatRoomName,
          currentRoom?.id === item.id && styles.activeChatRoomText
        ]}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={styles.chatRoomDescription}>{item.description}</Text>
        )}
      </View>
      {item.memberCount && (
        <Text style={styles.memberCount}>{item.memberCount} membres</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2ecc71', '#27ae60']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Chat</Text>
        <Text style={styles.headerSubtitle}>
          {currentRoom ? currentRoom.name : 'Sélectionnez un salon'}
        </Text>
      </LinearGradient>

      {/* Chat Rooms List */}
      <View style={styles.roomsContainer}>
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roomsList}
        />
      </View>

      {currentRoom ? (
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Tapez votre message..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Text style={styles.sendButtonText}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.noChatContainer}>
          <Text style={styles.noChatText}>Sélectionnez un salon pour commencer à chatter</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  roomsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  roomsList: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chatRoomItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 100,
  },
  activeChatRoom: {
    backgroundColor: '#2ecc71',
  },
  chatRoomInfo: {
    alignItems: 'center',
  },
  chatRoomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeChatRoomText: {
    color: '#fff',
  },
  chatRoomDescription: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  memberCount: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2ecc71',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9ecef',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noChatText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});