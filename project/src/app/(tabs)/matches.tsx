import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { createApiRequest } from '@/lib/api-client';

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
  };
  project: {
    id: string;
    title: string;
    image_url: string;
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
      const response = await createApiRequest('/matches', 'GET');
      if (response.data) {
        setMatches(response.data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToChat = (matchId: string) => {
    router.push(`/chat/${matchId}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>マッチング一覧</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.matchCard}
            onPress={() => navigateToChat(item.id)}
          >
            <Image
              source={{ uri: item.user.image || 'https://via.placeholder.com/50' }}
              style={styles.avatar}
            />
            <View style={styles.matchInfo}>
              <Text style={styles.username}>{item.user.username}</Text>
              <Text style={styles.projectTitle}>{item.project.title}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>マッチングはまだありません</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  matchCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
});