import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Star } from 'lucide-react-native';
import { chatService } from '@/lib/chat';
import { supabase } from '@/lib/supabase';

export default function ChatListScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });

    loadRooms();
    const subscription = chatService.subscribeToRooms((room) => {
      setRooms(prev => {
        const index = prev.findIndex(r => r.id === room.id);
        if (index >= 0) {
          const newRooms = [...prev];
          newRooms[index] = { ...newRooms[index], ...room };
          return newRooms.sort((a, b) => 
            new Date(b.last_message_at || b.created_at).getTime() - 
            new Date(a.last_message_at || a.created_at).getTime()
          );
        }
        return [...prev, room].sort((a, b) => 
          new Date(b.last_message_at || b.created_at).getTime() - 
          new Date(a.last_message_at || a.created_at).getTime()
        );
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const rooms = await chatService.getRooms();
      setRooms(rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setError('チャットの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days}日前`;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) {
      return `${hours}時間前`;
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) {
      return `${minutes}分前`;
    }
    
    return '今';
  };

  const renderChatItem = ({ item }: { item: any }) => {
    if (!userId) return null;

    const isProject = !!item.match.project;
    const chatPartner = isProject
      ? {
          name: item.match.project.title,
          image: item.match.project.image_url,
          title: item.match.project.company,
        }
      : {
          name: item.match.user1.id === userId
            ? item.match.user2.name
            : item.match.user1.name,
          image: item.match.user1.id === userId
            ? item.match.user2.image_url
            : item.match.user1.image_url,
          title: item.match.user1.id === userId
            ? item.match.user2.title
            : item.match.user1.title,
        };

    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => router.push(`/chat/${item.id}`)}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: chatPartner.image }} style={styles.avatar} />
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <View>
              <Text style={styles.name}>{chatPartner.name}</Text>
              <Text style={styles.title}>{chatPartner.title}</Text>
            </View>
          </View>
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message || 'まだメッセージはありません'}
            </Text>
          </View>
          <Text style={styles.timestamp}>
            {item.last_message_at
              ? formatTime(item.last_message_at)
              : formatTime(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>メッセージ</Text>

      {rooms.length > 0 ? (
        <FlatList
          data={rooms}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>まだマッチがありません</Text>
          <Text style={styles.emptyText}>
            「探す」タブでエンジニアやプロジェクトを見つけて、マッチングしましょう！
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  likeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  normalLikeStatus: {
    backgroundColor: '#ec4899',
  },
  superLikeStatus: {
    backgroundColor: '#6366f1',
  },
  likeStatusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
});