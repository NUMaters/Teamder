import { useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Image, Alert, Linking, KeyboardAvoidingView } from 'react-native';
import { X, Plus, ChevronDown, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { createApiRequest, DEFAULT_ICON_URL, DEFAULT_COVER_URL } from '@/lib/api-client';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ImageType = {
  uri: string;
};

type Activity = {
  id: string;
  title: string;
  period: string;
  description: string;
  link?: string;
};

type ProfileFormData = {
  name: string;
  title: string;
  university: string;
  location: string;
  githubUsername: string;
  twitterUsername: string;
  bio: string;
  imageUrl: string;
  coverUrl: string;
  skills: Array<{ name: string; years: string }>;
  interests: string[];
  age: string;
  activities: Activity[];
};

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUpdate: () => void;
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

const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;

export default function EditProfileModal({ isVisible, onClose, onUpdate, initialData }: EditProfileModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    ...initialData,
    activities: initialData.activities || []
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showInterestsPicker, setShowInterestsPicker] = useState(false);
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [images, setImages] = useState<Record<'icon' | 'cover', ImageType>>({
    icon: { uri: initialData.imageUrl || DEFAULT_ICON_URL },
    cover: { uri: initialData.coverUrl || DEFAULT_COVER_URL },
  });

  const handleImagePick = async (type: 'profile' | 'cover') => {
    try {
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

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        // トークンを取得
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('エラー', '認証情報が見つかりません。再度ログインしてください。');
          return;
        }

        // FormDataを作成
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          type: `image/${fileExt}`,
          name: fileName,
        } as any);

        console.log('Uploading image:', {
          uri: file.uri,
          type: `image/${fileExt}`,
          name: fileName,
        });

        // 画像をアップロード
        const response = await axios.post(
          `${API_GATEWAY_URL}${type === 'profile' ? '/upload/profile-image' : '/upload/cover-image'}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`,
              'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
            },
            timeout: 10000, // 10秒のタイムアウトを設定
          }
        );

        console.log('Upload response:', response.data);

        if (response.data?.url) {
          setImages(prev => ({
            ...prev,
            [type === 'profile' ? 'icon' : 'cover']: { uri: response.data.url }
          }));

          // フォームデータも更新
          setFormData(prev => ({
            ...prev,
            [type === 'profile' ? 'imageUrl' : 'coverUrl']: response.data.url
          }));
        } else {
          throw new Error('画像URLが返されませんでした');
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          Alert.alert('エラー', 'アップロードがタイムアウトしました。ネットワーク接続を確認して、もう一度お試しください。');
        } else if (error.response?.status === 413) {
          Alert.alert('エラー', '画像サイズが大きすぎます。より小さい画像を選択してください。');
        } else if (error.response?.status === 403) {
          Alert.alert('エラー', '認証エラーが発生しました。再度ログインしてください。');
        } else {
          Alert.alert('エラー', '画像のアップロードに失敗しました。ネットワーク接続を確認して、もう一度お試しください。');
        }
      } else {
        Alert.alert('エラー', '画像の選択中にエラーが発生しました。もう一度お試しください。');
      }
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

  const toggleSkill = (skill: string) => {
    setSelectedSkill(skill);
    setShowExperiencePicker(true);
  };

  const addSkillWithExperience = (skill: string, years: string) => {
    setFormData(prev => {
      // 既存のスキルを確認
      const existingSkillIndex = prev.skills.findIndex(s => s.name === skill);
      
      if (existingSkillIndex !== -1) {
        // 既存のスキルを更新
        const updatedSkills = [...prev.skills];
        updatedSkills[existingSkillIndex] = { name: skill, years };
        return { ...prev, skills: updatedSkills };
      } else {
        // 新しいスキルを追加
        return {
          ...prev,
          skills: [...prev.skills, { name: skill, years }]
        };
      }
    });
    setSelectedSkill(null);
    setShowExperiencePicker(false);
  };

  const removeSkill = (skillName: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  const addNewActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, {
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: '',
        period: '',
        description: '',
        link: ''
      }]
    }));
  };

  const updateActivity = (id: string, field: keyof Activity, value: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map(activity =>
        activity.id === id ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const removeActivity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter(activity => activity.id !== id)
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('エラー', '認証情報が見つかりません。再度ログインしてください。');
        return;
      }

      // スキルデータを整形
      const formattedData = {
        ...formData,
        skills: formData.skills.map(skill => ({
          name: skill.name,
          years: skill.years
        }))
      };

      console.log('Updating profile with token:', token);
      console.log('Profile update data:', formattedData);

      const response = await axios.post(
        `${API_GATEWAY_URL}/set_profile`,
        formattedData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
          }
        }
      );

      console.log('Profile update response:', response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      Alert.alert('成功', 'プロフィールを更新しました');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          Alert.alert('エラー', '認証エラーが発生しました。再度ログインしてください。');
        } else {
          Alert.alert('エラー', 'プロフィールの更新に失敗しました。');
        }
      } else {
        Alert.alert('エラー', 'プロフィールの更新に失敗しました。');
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>プロフィール編集</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.form}
            keyboardShouldPersistTaps="handled">
            <View style={styles.coverImageContainer}>
              {images.cover.uri ? (
                <Image source={{ uri: images.cover.uri }} style={styles.coverImage} />
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
              {images.icon.uri ? (
                <Image source={{ uri: images.icon.uri }} style={styles.profileImage} />
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
              <Text style={styles.label}>年齢</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                placeholder="年齢を入力"
                keyboardType="numeric"
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>スキル</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowSkillsDropdown(!showSkillsDropdown)}>
                <Text style={styles.dropdownButtonText}>
                  {formData.skills.length > 0 ? `${formData.skills.length}個選択中` : 'スキルを選択'}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>
              {showSkillsDropdown && (
                <View style={styles.skillsDropdownContent}>
                  <ScrollView>
                    <View style={styles.skillsGrid}>
                      {SKILLS.map((skill) => (
                        <TouchableOpacity
                          key={`skill-${skill}`}
                          style={[
                            styles.skillButton,
                            formData.skills.some(s => s.name === skill) && styles.skillButtonActive,
                          ]}
                          onPress={() => toggleSkill(skill)}>
                          <Text
                            style={[
                              styles.skillButtonText,
                              formData.skills.some(s => s.name === skill) && styles.skillButtonTextActive,
                            ]}>
                            {skill}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              {formData.skills.length > 0 && (
                <View style={styles.selectedSkillsContainer}>
                  {formData.skills.map((skill) => (
                    <View key={`selected-skill-${skill.name}`} style={styles.selectedSkillTag}>
                      <Text style={styles.selectedSkillText}>
                        {skill.name} ({skill.years})
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeSkill(skill.name)}
                        style={styles.selectedSkillRemoveButton}>
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
                    <View key={`interest-tag-${interest}`} style={styles.tag}>
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>活動</Text>
              {formData.activities.map((activity) => (
                <View key={`activity-item-${activity.id}`} style={styles.activityContainer}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>活動情報</Text>
                    <TouchableOpacity
                      onPress={() => removeActivity(activity.id)}
                      style={styles.removeActivityButton}>
                      <X size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    style={styles.input}
                    value={activity.title}
                    onChangeText={(text) => updateActivity(activity.id, 'title', text)}
                    placeholder="活動タイトル"
                  />
                  
                  <TextInput
                    style={styles.input}
                    value={activity.period}
                    onChangeText={(text) => updateActivity(activity.id, 'period', text)}
                    placeholder="活動期間（例：2022年4月 - 2023年3月）"
                  />
                  
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={activity.description}
                    onChangeText={(text) => updateActivity(activity.id, 'description', text)}
                    placeholder="活動内容"
                    multiline
                    numberOfLines={4}
                  />
                  
                  <TextInput
                    style={styles.input}
                    value={activity.link}
                    onChangeText={(text) => updateActivity(activity.id, 'link', text)}
                    placeholder="関連リンク（任意）"
                  />
                </View>
              ))}
              
              <TouchableOpacity
                style={styles.addActivityButton}
                onPress={addNewActivity}>
                <Plus size={20} color="#6366f1" />
                <Text style={styles.addActivityButtonText}>活動を追加</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}>
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
                      key={`prefecture-${prefecture}`}
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
                  <Text style={styles.pickerModalTitle}>
                    {selectedSkill}の経験年数を選択
                  </Text>
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
                      key={`experience-${years}`}
                      style={styles.pickerModalItem}
                      onPress={() => {
                        if (selectedSkill) {
                          addSkillWithExperience(selectedSkill, years);
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
                      key={`interest-${interest}`}
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  inputGroup: {
    marginBottom: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  skillsDropdownContent: {
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 300,
    zIndex: 1000,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  skillButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  skillButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  skillButtonTextActive: {
    color: '#ffffff',
  },
  selectedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  selectedSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    gap: 4,
  },
  selectedSkillText: {
    fontSize: 14,
    color: '#4f46e5',
  },
  selectedSkillRemoveButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#c7d2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  removeActivityButton: {
    padding: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e0e7ff',
    gap: 8,
  },
  addActivityButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366f1',
  },
});