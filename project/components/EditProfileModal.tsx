import { useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Image, Alert, Linking } from 'react-native';
import { X, Plus, ChevronDown, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

type ProfileFormData = {
  name: string;
  title: string;
  university: string;
  department: string;
  location: string;
  githubUsername: string;
  twitterUsername: string;
  bio: string;
  imageUrl: string;
  coverUrl: string;
  skills: Array<{ name: string; years: string }>;
  interests: string[];
};

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: ProfileFormData) => void;
  initialData: ProfileFormData;
}

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

const SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust',
  'React', 'Vue.js', 'Angular', 'Node.js', 'Django', 'Flask',
  'Spring Boot', 'Ruby on Rails', 'Swift', 'Kotlin'
];

const INTERESTS = [
  'Web開発', 'モバイルアプリ開発', 'AI/機械学習', 'データサイエンス',
  'クラウド', 'セキュリティ', 'ブロックチェーン', 'IoT', 'AR/VR',
  'UI/UXデザイン', 'DevOps', 'ゲーム開発'
];

const EXPERIENCE_YEARS = [
  '1年未満', '1-2年', '2-3年', '3-5年', '5-7年', '7-10年', '10年以上'
];

export default function EditProfileModal({ isVisible, onClose, onSubmit, initialData }: EditProfileModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showSkillsPicker, setShowSkillsPicker] = useState(false);
  const [showInterestsPicker, setShowInterestsPicker] = useState(false);
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const handleImagePick = async (type: 'profile' | 'cover') => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'アクセス権限が必要です',
          'アプリが写真ライブラリにアクセスするには許可が必要です。',
          [
            {
              text: '設定を開く',
              onPress: () => Linking.openSettings(),
            },
            {
              text: 'キャンセル',
              style: 'cancel',
            },
          ]
        );
        return;
      }

      // Launch image picker with correct configuration
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 1,
        selectionLimit: 1,
        presentationStyle: Platform.OS === 'ios' ? 'pageSheet' : undefined,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setFormData(prev => ({
          ...prev,
          [type === 'profile' ? 'imageUrl' : 'coverUrl']: imageUri
        }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        'エラー',
        '画像の選択中にエラーが発生しました。もう一度お試しください。'
      );
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const addSkill = (skillName: string, years: string) => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: skillName, years }]
    }));
    setSelectedSkill(null);
    setShowExperiencePicker(false);
  };

  const removeSkill = (skillName: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.name !== skillName)
    }));
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>プロフィール編集</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.coverImageContainer}>
              {formData.coverUrl ? (
                <Image source={{ uri: formData.coverUrl }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverImagePlaceholder} />
              )}
              <TouchableOpacity 
                style={styles.coverImageButton} 
                onPress={() => handleImagePick('cover')}>
                <Camera size={20} color="#fff" />
                <Text style={styles.imageButtonText}>カバー画像を選択</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileImageContainer}>
              {formData.imageUrl ? (
                <Image source={{ uri: formData.imageUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder} />
              )}
              <TouchableOpacity 
                style={styles.profileImageButton} 
                onPress={() => handleImagePick('profile')}>
                <Camera size={20} color="#fff" />
                <Text style={styles.imageButtonText}>プロフィール画像を選択</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>名前</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="フルネームを入力"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>肩書き</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="例：フルスタックエンジニア"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>学校名</Text>
              <TextInput
                style={styles.input}
                value={formData.university}
                onChangeText={(text) => setFormData(prev => ({ ...prev, university: text }))}
                placeholder="例：東京大学"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>学部・学科</Text>
              <TextInput
                style={styles.input}
                value={formData.department}
                onChangeText={(text) => setFormData(prev => ({ ...prev, department: text }))}
                placeholder="例：工学部情報工学科"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>場所</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowLocationPicker(true)}>
                <Text style={styles.selectButtonText}>
                  {formData.location || '都道府県を選択'}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>GitHubユーザー名</Text>
              <TextInput
                style={styles.input}
                value={formData.githubUsername}
                onChangeText={(text) => setFormData(prev => ({ ...prev, githubUsername: text }))}
                placeholder="例：johndoe"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Twitterユーザー名</Text>
              <TextInput
                style={styles.input}
                value={formData.twitterUsername}
                onChangeText={(text) => setFormData(prev => ({ ...prev, twitterUsername: text }))}
                placeholder="例：johndoe"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>スキル</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowSkillsPicker(true)}>
                <Text style={styles.selectButtonText}>
                  {formData.skills.length > 0
                    ? `${formData.skills.length}個のスキルを選択中`
                    : 'スキルを選択'}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>
              {formData.skills.length > 0 && (
                <View style={styles.tagsContainer}>
                  {formData.skills.map((skill) => (
                    <View key={skill.name} style={styles.tag}>
                      <Text style={styles.tagText}>
                        {skill.name} ({skill.years})
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeSkill(skill.name)}
                        style={styles.tagRemoveButton}>
                        <X size={12} color="#6366f1" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>興味のある分野</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowInterestsPicker(true)}>
                <Text style={styles.selectButtonText}>
                  {formData.interests.length > 0
                    ? `${formData.interests.length}個の分野を選択中`
                    : '興味のある分野を選択'}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>
              {formData.interests.length > 0 && (
                <View style={styles.tagsContainer}>
                  {formData.interests.map((interest) => (
                    <View key={interest} style={styles.tag}>
                      <Text style={styles.tagText}>{interest}</Text>
                      <TouchableOpacity
                        onPress={() => toggleInterest(interest)}
                        style={styles.tagRemoveButton}>
                        <X size={12} color="#6366f1" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                onSubmit(formData);
                onClose();
              }}>
              <Text style={styles.submitButtonText}>保存</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Location Picker Modal */}
          <Modal
            visible={showLocationPicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowLocationPicker(false)}>
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>都道府県を選択</Text>
                  <TouchableOpacity
                    style={styles.pickerModalCloseButton}
                    onPress={() => setShowLocationPicker(false)}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerModalList}>
                  {PREFECTURES.map((prefecture) => (
                    <TouchableOpacity
                      key={prefecture}
                      style={styles.pickerModalItem}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, location: prefecture }));
                        setShowLocationPicker(false);
                      }}>
                      <Text style={[
                        styles.pickerModalItemText,
                        formData.location === prefecture && styles.pickerModalItemTextSelected
                      ]}>
                        {prefecture}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Skills Picker Modal */}
          <Modal
            visible={showSkillsPicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
              setShowSkillsPicker(false);
              setSelectedSkill(null);
            }}>
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>スキルを選択</Text>
                  <TouchableOpacity
                    style={styles.pickerModalCloseButton}
                    onPress={() => {
                      setShowSkillsPicker(false);
                      setSelectedSkill(null);
                    }}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerModalList}>
                  {SKILLS.filter(skill => !formData.skills.some(s => s.name === skill)).map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={styles.pickerModalItem}
                      onPress={() => {
                        setSelectedSkill(skill);
                        setShowExperiencePicker(true);
                      }}>
                      <Text style={styles.pickerModalItemText}>{skill}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Experience Picker Modal */}
          <Modal
            visible={showExperiencePicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
              setShowExperiencePicker(false);
              setSelectedSkill(null);
            }}>
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>経験年数を選択</Text>
                  <TouchableOpacity
                    style={styles.pickerModalCloseButton}
                    onPress={() => {
                      setShowExperiencePicker(false);
                      setSelectedSkill(null);
                    }}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerModalList}>
                  {EXPERIENCE_YEARS.map((years) => (
                    <TouchableOpacity
                      key={years}
                      style={styles.pickerModalItem}
                      onPress={() => {
                        if (selectedSkill) {
                          addSkill(selectedSkill, years);
                        }
                      }}>
                      <Text style={styles.pickerModalItemText}>{years}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Interests Picker Modal */}
          <Modal
            visible={showInterestsPicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowInterestsPicker(false)}>
            <View style={styles.pickerModalContainer}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>興味のある分野を選択</Text>
                  <TouchableOpacity
                    style={styles.pickerModalCloseButton}
                    onPress={() => setShowInterestsPicker(false)}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerModalList}>
                  {INTERESTS.map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      style={[
                        styles.pickerModalItem,
                        formData.interests.includes(interest) && styles.pickerModalItemSelected
                      ]}
                      onPress={() => toggleInterest(interest)}>
                      <Text style={[
                        styles.pickerModalItemText,
                        formData.interests.includes(interest) && styles.pickerModalItemTextSelected
                      ]}>
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.pickerModalDoneButton}
                  onPress={() => setShowInterestsPicker(false)}>
                  <Text style={styles.pickerModalDoneButtonText}>完了</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
  },
  modalContent: {
    backgroundColor: '#fff',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 20,
  },
  coverImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  coverImageButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    marginBottom: 16,
  },
  profileImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    color: '#4f46e5',
  },
  tagRemoveButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#c7d2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  pickerModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalList: {
    padding: 20,
  },
  pickerModalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerModalItemSelected: {
    backgroundColor: '#e0e7ff',
  },
  pickerModalItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  pickerModalItemTextSelected: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  pickerModalDoneButton: {
    backgroundColor: '#6366f1',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pickerModalDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});