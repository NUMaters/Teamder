import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Image } from 'react-native';
import { X, MapPin, Users, Clock, CreditCard, Building2, Code, FileText, Activity, Send } from 'lucide-react-native';

type LikeType = 'like' | 'superlike';

type Like = {
  userId: string;
  type: LikeType;
};

type Project = {
  id: string;
  owner_id: string;
  title: string;
  school: string;
  image_url: string;
  location: string;
  description: string;
  team_size: string;
  duration: string;
  budget: string;
  status: string;
  created_at: string;
  updated_at: string;
  likes: Like[];
};

type ProjectModalProps = {
  isVisible: boolean;
  onClose: () => void;
  project: Project;
};

export default function ProjectModal({ isVisible, onClose, project }: ProjectModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <View style={styles.imageContainer}>
              <Image source={{ uri: project.image_url }} style={styles.image} />
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>{project.title}</Text>
              <Text style={styles.school}>{project.school}</Text>

              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{project.location}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Users size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{project.team_size}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{project.duration}</Text>
                </View>
                <View style={styles.infoRow}>
                  <CreditCard size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{project.budget}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Activity size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{project.status}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>プロジェクトの説明</Text>
                <Text style={styles.description}>{project.description}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={() => {}}>
              <Send size={20} color="#ffffff" />
              <Text style={styles.applyButtonText}>応募する</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  school: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 24,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  applyButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});