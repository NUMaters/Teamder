import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { X, MapPin, Users, Clock, CreditCard, Building2, Code, FileText } from 'lucide-react-native';

type Project = {
  id: string;
  title: string;
  company: string;
  image: string;
  location: string;
  description: string;
  skills: string[];
  teamSize: string;
  duration: string;
  budget: string;
  type: string;
};

interface ProjectModalProps {
  isVisible: boolean;
  onClose: () => void;
  project: Project;
}

export default function ProjectModal({ isVisible, onClose, project }: ProjectModalProps) {
  return (
    <Modal
      visible={isVisible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>

          <ScrollView style={styles.content}>
            <Text style={styles.title}>{project.title}</Text>
            
            <View style={styles.companyInfo}>
              <Building2 size={20} color="#6366f1" />
              <Text style={styles.company}>{project.company}</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <MapPin size={20} color="#6b7280" />
                <Text style={styles.infoLabel}>勤務地</Text>
                <Text style={styles.infoValue}>{project.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <Users size={20} color="#6b7280" />
                <Text style={styles.infoLabel}>チーム規模</Text>
                <Text style={styles.infoValue}>{project.teamSize}</Text>
              </View>
              <View style={styles.infoItem}>
                <Clock size={20} color="#6b7280" />
                <Text style={styles.infoLabel}>期間</Text>
                <Text style={styles.infoValue}>{project.duration}</Text>
              </View>
              <View style={styles.infoItem}>
                <CreditCard size={20} color="#6b7280" />
                <Text style={styles.infoLabel}>予算</Text>
                <Text style={styles.infoValue}>{project.budget}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={20} color="#1f2937" />
                <Text style={styles.sectionTitle}>プロジェクト概要</Text>
              </View>
              <Text style={styles.description}>{project.description}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Code size={20} color="#1f2937" />
                <Text style={styles.sectionTitle}>必要なスキル</Text>
              </View>
              <View style={styles.skillsContainer}>
                {project.skills.map((skill, index) => (
                  <View key={index} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
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
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  company: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
});