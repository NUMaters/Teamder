import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';

interface Match {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
  };
  project: {
    id: string;
    title: string;
    company: string;
    image_url: string;
  };
  chat_room: {
    id: string;
    last_message: string;
    last_message_at: string;
  };
}

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          project_id,
          user1_id,
          user2_id,
          status,
          chat_rooms (
            id,
            last_message,
            last_message_at
          ),
          projects (
            id,
            title,
            company,
            image_url,
            owner_id
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'active');

      if (error) throw error;

      // マッチした相手のユーザー情報を取得
      const matchedUsers = await Promise.all(
        data.map(async (match) => {
          const matchedUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', matchedUserId)
            .single();

          if (userError) throw userError;

          return {
            id: match.id,
            user: userData,
            project: match.projects,
            chat_room: match.chat_rooms,
          };
        })
      );

      setMatches(matchedUsers);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMatchItem = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => router.push(`/chat/${item.chat_room.id}`)}>
      <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
      <View style={styles.matchInfo}>
        <Text style={styles.userName}>{item.user.name}</Text>
        <Text style={styles.projectTitle}>{item.project.title}</Text>
        {item.chat_room.last_message && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.chat_room.last_message}
          </Text>
        )}
      </View>
      {item.chat_room.last_message_at && (
        <Text style={styles.timestamp}>
          {formatLastMessageTime(item.chat_room.last_message_at)}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>マッチング</Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle size={48} color="#6b7280" />
          <Text style={styles.emptyStateText}>
            まだマッチしているユーザーがいません
          </Text>
          <Text style={styles.emptyStateSubText}>
            プロジェクトをスワイプして、チームメンバーを見つけましょう
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.matchList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  matchList: {
    padding: 16,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  matchInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});