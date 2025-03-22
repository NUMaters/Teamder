import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Users, Clock, CreditCard } from 'lucide-react-native';
import { createApiRequest, DEFAULT_COVER_URL } from '@/lib/api-client';

type Project = {
  id: string;
  title: string;
  university: string;
  image_url: string;
  location: string;
  description: string;
  team_size: string;
  duration: string;
  budget: string;
  status: string;
  created_at: string;
  owner_id: string;
};

type SwipeCardProps = {
  project: Project;
  onSwipe: (direction: 'left' | 'right') => void;
};

export default function SwipeCard({ project, onSwipe }: SwipeCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: project.image_url || DEFAULT_COVER_URL }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.university}>{project.university}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Users size={16} color="#6b7280" />
            <Text style={styles.statText}>{project.team_size}</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={16} color="#6b7280" />
            <Text style={styles.statText}>{project.duration}</Text>
          </View>
          <View style={styles.statItem}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.statText}>{project.location}</Text>
          </View>
          <View style={styles.statItem}>
            <CreditCard size={16} color="#6b7280" />
            <Text style={styles.statText}>{project.budget}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {project.description}
        </Text>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={handleViewDetails}>
          <Text style={styles.viewButtonText}>詳細を見る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  university: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  viewButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 