import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, Image as ImageIcon, ArrowLeft } from 'lucide-react-native';
import { chatService } from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import type { ChatMessage } from '@/lib/chat';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Get current user ID
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });

    loadMessages();
    const subscription = chatService.subscribeToMessages(id as string, (message) => {
      setMessages(prev => [...prev, message]);
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get room data
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          match:matches (
            user1:user1_id (id, name, image_url),
            user2:user2_id (id, name, image_url),
            project:project_id (
              id,
              title,
              company,
              image_url,
              owner:owner_id (id, name, image_url)
            )
          )
        `)
        .eq('id', id)
        .single();

      if (roomError) throw roomError;
      setRoomData(roomData);

      // Get messages
      const messages = await chatService.getMessages(id as string);
      setMessages(messages);

      // Mark messages as read
      await chatService.markAsRead(id as string);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('メッセージの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim() === '') return;

    try {
      await chatService.sendMessage(id as string, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('メッセージの送信に失敗しました');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.senderId === userId;

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.otherMessage]}>
        {!isUser && roomData?.match?.user2 && (
          <Image source={{ uri: roomData.match.user2.image_url }} style={styles.avatar} />
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.otherText]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
            {isUser && (
              <Text style={[styles.readStatus, item.readAt ? styles.read : styles.unread]}>
                {item.readAt ? '既読' : '未読'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!roomData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>チャットが見つかりません</Text>
      </View>
    );
  }

  const chatPartner = roomData.match.project
    ? {
        name: roomData.match.project.title,
        image: roomData.match.project.image_url,
        title: roomData.match.project.company,
      }
    : {
        name: roomData.match.user2.name,
        image: roomData.match.user2.image_url,
        title: roomData.match.user2.title,
      };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Image source={{ uri: chatPartner.image }} style={styles.partnerAvatar} />
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerName}>{chatPartner.name}</Text>
          <Text style={styles.partnerTitle}>{chatPartner.title}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <ImageIcon size={24} color="#6366f1" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="メッセージを入力..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, newMessage.trim() === '' && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={newMessage.trim() === ''}>
          <Send size={20} color={newMessage.trim() === '' ? '#9ca3af' : '#ffffff'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginTop: Platform.OS === 'ios' ? 47 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  online: {
    backgroundColor: '#10b981',
  },
  offline: {
    backgroundColor: '#9ca3af',
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: '#6366f1',
  },
  otherBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  otherText: {
    color: '#1f2937',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#9ca3af',
  },
  readStatus: {
    fontSize: 10,
  },
  read: {
    color: '#10b981',
  },
  unread: {
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
      },
    }),
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  partnerTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});