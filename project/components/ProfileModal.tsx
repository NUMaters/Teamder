import { Modal, View, StyleSheet, TouchableOpacity, Platform, Dimensions, Text } from 'react-native';
import { X, Github, Twitter } from 'lucide-react-native';
import ProfileContent from './ProfileContent';
import { Linking } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type ProfileData = {
  name: string;
  title: string;
  location: string;
  email: string;
  website: string;
  image: string;
  cover: string;
  bio: string;
  academic: {
    school: string; // 学校情報を単一のフィールドに変更
  };
  skills: Array<{ name: string; level: string }>;
  interests: string[];
  github_username: string | null;
  twitter_username: string | null;
  activities: Array<{
    id: string;
    title: string;
    organization: string;
    period: string;
    description: string;
  }>;
  certifications: string[];
};

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  profileData: ProfileData;
  isOwnProfile?: boolean;
}

export default function ProfileModal({ isVisible, onClose, profileData, isOwnProfile = false }: ProfileModalProps) {
  // Don't render the ProfileContent if there's no profile data
  if (!profileData) {
    return null;
  }

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
          <ProfileContent profileData={profileData} isOwnProfile={isOwnProfile} />

          {/* 学歴セクション */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>学歴</Text>
            <Text style={styles.sectionText}>{profileData.academic.school}</Text>
          </View>

          {/* SNSアカウントセクション */}
          {(profileData.github_username || profileData.twitter_username) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SNSアカウント</Text>
              <View style={styles.socialLinks}>
                {profileData.github_username && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => Linking.openURL(`https://github.com/${profileData.github_username}`)}>
                    <Github size={20} color="#333" />
                    <Text style={styles.socialButtonText}>{profileData.github_username}</Text>
                  </TouchableOpacity>
                )}
                {profileData.twitter_username && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => Linking.openURL(`https://twitter.com/${profileData.twitter_username}`)}>
                    <Twitter size={20} color="#1DA1F2" />
                    <Text style={styles.socialButtonText}>{profileData.twitter_username}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#f3f4f6',
    width: '100%',
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
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
    top: Platform.OS === 'web' ? 20 : 40,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#374151',
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});