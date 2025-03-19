import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Image, KeyboardAvoidingView, Alert, Linking, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, MapPin, Mail, Globe, Plus, X, ChevronDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

// 47都道府県
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// 興味のある分野
const INTERESTS = [
  'Web開発', 'モバイルアプリ開発', 'AI/機械学習', 'データサイエンス',
  'クラウド', 'セキュリティ', 'ブロックチェーン', 'IoT', 'AR/VR',
  'UI/UXデザイン', 'DevOps', 'ゲーム開発'
];

// プログラミング言語とフレームワーク
const SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust',
  'React', 'Vue.js', 'Angular', 'Node.js', 'Django', 'Flask',
  'Spring Boot', 'Ruby on Rails', 'Swift', 'Kotlin'
];

// 経験年数オプション
const EXPERIENCE_YEARS = [
  '1年未満', '1-2年', '2-3年', '3-5年', '5-7年', '7-10年', '10年以上'
];

type Skill = {
  name: string;
  years: string;
};

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrefectureModal, setShowPrefectureModal] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showExperienceModal, setShowExperienceModal] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    location: '',
    website: '',
    bio: '',
    image_url: '',
    cover_url: '',
    interests: [] as string[],
    skills: [] as Skill[],
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
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 1,
        selectionLimit: 1,
        presentationStyle: Platform.OS === 'ios' ? 'pageSheet' : undefined,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setProfileData(prev => ({
          ...prev,
          [type === 'profile' ? 'image_url' : 'cover_url']: imageUri
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
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const addSkill = (skillName: string, years: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: skillName, years }]
    }));
    setSelectedSkill(null);
    setShowExperienceModal(false);
    setShowSkillsModal(false);
  };

  const removeSkill = (skillName: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.name !== skillName)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザー情報が見つかりません');
      }

      if (!profileData.name) {
        throw new Error('名前は必須です');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          title: profileData.title,
          location: profileData.location,
          website: profileData.website,
          bio: profileData.bio,
          image_url: profileData.image_url,
          cover_url: profileData.cover_url,
          interests: profileData.interests,
          skills: profileData.skills.map(skill => skill.name),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Profile setup error:', error);
      setError(error instanceof Error ? error.message : 'プロフィールの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>プロフィール設定</Text>
          <Text style={styles.subtitle}>
            プロフィールを設定して、他のユーザーに自己紹介しましょう
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.coverImageContainer}>
          {profileData.cover_url ? (
            <Image source={{ uri: profileData.cover_url }} style={styles.coverImage} />
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

        <View style={styles.imageContainer}>
          {profileData.image_url ? (
            <Image source={{ uri: profileData.image_url }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          <TouchableOpacity 
            style={styles.imageButton} 
            onPress={() => handleImagePick('profile')}>
            <Camera size={20} color="#fff" />
            <Text style={styles.imageButtonText}>プロフィール画像を選択</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>名前</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
              placeholder="フルネームを入力"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>肩書き</Text>
            <TextInput
              style={styles.input}
              value={profileData.title}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, title: text }))}
              placeholder="例：フルスタックエンジニア"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>場所</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowPrefectureModal(true)}>
              <MapPin size={20} color="#6b7280" />
              <Text style={styles.selectButtonText}>
                {profileData.location || '都道府県を選択'}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ウェブサイト</Text>
            <View style={styles.inputWithIcon}>
              <Globe size={20} color="#6b7280" />
              <TextInput
                style={styles.inputText}
                value={profileData.website}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, website: text }))}
                placeholder="https://example.com"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>興味のある分野</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowInterestsModal(true)}>
              <Plus size={20} color="#6b7280" />
              <Text style={styles.selectButtonText}>
                {profileData.interests.length > 0
                  ? `${profileData.interests.length}個の分野を選択中`
                  : '興味のある分野を選択'}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </TouchableOpacity>
            {profileData.interests.length > 0 && (
              <View style={styles.tagsContainer}>
                {profileData.interests.map((interest) => (
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>スキル</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowSkillsModal(true)}>
              <Plus size={20} color="#6b7280" />
              <Text style={styles.selectButtonText}>
                {profileData.skills.length > 0
                  ? `${profileData.skills.length}個のスキルを選択中`
                  : 'スキルを選択'}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </TouchableOpacity>
            {profileData.skills.length > 0 && (
              <View style={styles.tagsContainer}>
                {profileData.skills.map((skill) => (
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>自己紹介</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
              placeholder="あなたのスキルや経験について教えてください"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? '保存中...' : 'プロフィールを保存'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 都道府県選択モーダル */}
      <Modal
        visible={showPrefectureModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrefectureModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>都道府県を選択</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPrefectureModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {PREFECTURES.map((prefecture) => (
                <TouchableOpacity
                  key={prefecture}
                  style={styles.modalItem}
                  onPress={() => {
                    setProfileData(prev => ({ ...prev, location: prefecture }));
                    setShowPrefectureModal(false);
                  }}>
                  <Text style={[
                    styles.modalItemText,
                    profileData.location === prefecture && styles.modalItemTextSelected
                  ]}>
                    {prefecture}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 興味のある分野選択モーダル */}
      <Modal
        visible={showInterestsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInterestsModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>興味のある分野を選択</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowInterestsModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.modalItem,
                    profileData.interests.includes(interest) && styles.modalItemSelected
                  ]}
                  onPress={() => toggleInterest(interest)}>
                  <Text style={[
                    styles.modalItemText,
                    profileData.interests.includes(interest) && styles.modalItemTextSelected
                  ]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setShowInterestsModal(false)}>
              <Text style={styles.modalDoneButtonText}>完了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* スキル選択モーダル */}
      <Modal
        visible={showSkillsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSkillsModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>スキルを選択</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSkillsModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {SKILLS.filter(skill => !profileData.skills.some(s => s.name === skill)).map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSkill(skill);
                    setShowExperienceModal(true);
                  }}>
                  <Text style={styles.modalItemText}>{skill}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 経験年数選択モーダル */}
      <Modal
        visible={showExperienceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowExperienceModal(false);
          setSelectedSkill(null);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>経験年数を選択</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowExperienceModal(false);
                  setSelectedSkill(null);
                }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {EXPERIENCE_YEARS.map((years) => (
                <TouchableOpacity
                  key={years}
                  style={styles.modalItem}
                  onPress={() => {
                    if (selectedSkill) {
                      addSkill(selectedSkill, years);
                    }
                  }}>
                  <Text style={styles.modalItemText}>{years}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    margin: 20,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  coverImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
    marginBottom: 20,
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
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    marginBottom: 16,
  },
  imageButton: {
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
  form: {
    padding: 20,
  },
  inputGroup: {
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputText: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  selectButtonText: {
    flex: 1,
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
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    padding: 20,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalItemSelected: {
    backgroundColor: '#e0e7ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  modalItemTextSelected: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  modalDoneButton: {
    backgroundColor: '#6366f1',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});