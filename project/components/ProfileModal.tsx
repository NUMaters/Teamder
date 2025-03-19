import { Modal, View, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import ProfileContent from './ProfileContent';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  profileData: any;
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
});