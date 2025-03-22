import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, Image as ImageIcon, ArrowLeft } from 'lucide-react-native';
import { createApiRequest, DEFAULT_ICON_URL } from '@/lib/api-client';
import { ChatMessage, chatService } from '@/lib/chat';

interface LocalChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  match: {
    user2: {
      name: string;
      image_url: string;
      title?: string;
    };
    project?: {
      title: string;
      image_url: string;
      company?: string;
    };
  };
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [room, setRoom] = useState<LocalChatRoom | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await createApiRequest('/user/current', 'GET');
      if (response.data?.id) {
        setUserId(response.data.id);
      } else {
        throw new Error('ユーザーIDが取得できません');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('ユーザー情報の取得に失敗しました');
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await createApiRequest(`/chat/${id}/messages`, 'GET');
      if (response.data) {
        setMessages(response.data.messages);
        setRoom(response.data.room);
        setError(null);
      } else {
        throw new Error('メッセージを取得できません');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('メッセージの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCurrentUser();
    fetchMessages();

    // メッセージの定期更新
    intervalRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchCurrentUser, fetchMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await createApiRequest(`/chat/${id}/messages`, 'POST', {
        content: newMessage.trim()
      });
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('エラー', 'メッセージの送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.sender_id === userId;

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.otherMessage]}>
        {!isUser && room?.match?.user2 && (
          <Image 
            source={{ uri: room.match.user2.image_url || DEFAULT_ICON_URL }} 
            style={styles.avatar}
          />
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.otherText]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>{formatTime(item.created_at)}</Text>
            {isUser && (
              <Text style={[styles.readStatus, item.read_at ? styles.read : styles.unread]}>
                {item.read_at ? '既読' : '未読'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }, [userId, room, formatTime]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMessages}>
          <Text style={styles.retryButtonText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>チャットが見つかりません</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chatPartner = room.match.project
    ? {
        name: room.match.project.title,
        image: room.match.project.image_url,
        title: room.match.project.company,
      }
    : {
        name: room.match.user2.name,
        image: room.match.user2.image_url,
        title: room.match.user2.title,
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
        <Image 
          source={{ uri: chatPartner.image || DEFAULT_ICON_URL }} 
          style={styles.partnerAvatar}
        />
        <View style={styles.partnerInfo}>
          <Text style={styles.partnerName} numberOfLines={1}>{chatPartner.name}</Text>
          {chatPartner.title && (
            <Text style={styles.partnerTitle} numberOfLines={1}>{chatPartner.title}</Text>
          )}
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
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={[styles.attachButton, sending && styles.buttonDisabled]}
          disabled={sending}
        >
          <ImageIcon size={24} color="#6366f1" />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, sending && styles.inputDisabled]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="メッセージを入力..."
          multiline
          maxLength={1000}
          editable={!sending}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (newMessage.trim() === '' || sending) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={newMessage.trim() === '' || sending}>
          {sending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Send size={20} color={newMessage.trim() === '' ? '#9ca3af' : '#ffffff'} />
          )}
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
  partnerTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
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
    }),
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  inputDisabled: {
    backgroundColor: '#e5e7eb',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});