import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { createApiRequest } from '@/lib/api-client';
import { MessageCircle, UserCircle2 } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  project_id: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    image: string;
    school: string;
  };
  project: {
    id: string;
    title: string;
    image_url: string;
    description: string;
  };
}

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchMatches = async () => {
    try {
      const response = await createApiRequest('/matches', 'GET');
      if (response.data) {
        setMatches(response.data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchMatches();
  }, []);

  useEffect(() => {
    fetchMatches();
  }, []);

  const navigateToChat = (matchId: string) => {
    router.push(`/chat/${matchId}`);
  };

  const navigateToProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>マッチングを読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>マッチング</Text>
        <Text style={styles.subtitle}>{matches.length}件のマッチング</Text>
      </View>
      
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.matchCard}>
            <View style={styles.userSection}>
              <TouchableOpacity onPress={() => navigateToProfile(item.user.id)}>
                <Image
                  source={{ uri: item.user.image || 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-icon.png' }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.user.username}</Text>
                {item.user.school && (
                  <Text style={styles.school}>{item.user.school}</Text>
                )}
                <Text style={styles.matchTime}>
                  {formatDistanceToNow(new Date(item.created_at), { locale: ja, addSuffix: true })}
                </Text>
              </View>
            </View>

            <View style={styles.projectSection}>
              <Image
                source={{ uri: item.project.image_url || 'https://teamder-aws.s3.us-west-2.amazonaws.com/project-placeholder.png' }}
                style={styles.projectImage}
              />
              <View style={styles.projectInfo}>
                <Text style={styles.projectTitle}>{item.project.title}</Text>
                {item.project.description && (
                  <Text style={styles.projectDescription} numberOfLines={2}>
                    {item.project.description}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigateToProfile(item.user.id)}
              >
                <UserCircle2 size={24} color="#4B5563" />
                <Text style={styles.actionText}>プロフィール</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.chatButton]}
                onPress={() => navigateToChat(item.id)}
              >
                <MessageCircle size={24} color="#4B5563" />
                <Text style={styles.actionText}>チャット</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UserCircle2 size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>マッチングはまだありません</Text>
            <Text style={styles.emptySubtext}>
              プロジェクトやユーザーをスワイプして、マッチングを見つけましょう
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    fontSize: 16,
    color: '#4B5563',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  school: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  matchTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  projectSection: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  projectImage: {
    width: 80,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  projectInfo: {
    marginLeft: 12,
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  projectDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },
  chatButton: {
    backgroundColor: '#EEF2FF',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});