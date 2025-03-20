import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ProfileCard from './ProfileCard';

type ProjectCardProps = {
  project: {
    id: string;
    title: string;
    school: string;
    image_url: string;
    location: string;
    description: string;
    team_size: string;
    duration: string;
    budget: string;
    status: string;
    owner_id: string;
  };
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isOwnerProfileVisible, setIsOwnerProfileVisible] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);

  const handlePress = () => {
    navigation.navigate('ProjectDetail', { projectId: project.id });
  };

  const handleOwnerPress = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', project.owner_id)
        .single();

      if (error) throw error;
      setOwnerProfile(profileData);
      setIsOwnerProfileVisible(true);
    } catch (error) {
      console.error('Error fetching owner profile:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={{ uri: project.image_url }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{project.title}</Text>
          <TouchableOpacity onPress={handleOwnerPress}>
            <Ionicons name="person-circle-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.school}>{project.school}</Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{project.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{project.team_size}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{project.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="wallet-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{project.budget}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {project.description}
        </Text>
      </View>

      <Modal
        visible={isOwnerProfileVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOwnerProfileVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>作成者のプロフィール</Text>
              <TouchableOpacity onPress={() => setIsOwnerProfileVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {ownerProfile && <ProfileCard profileData={ownerProfile} />}
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  school: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 