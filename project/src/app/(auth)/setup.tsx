import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Image, ScrollView, Alert, KeyboardAvoidingView, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, Upload, X, ChevronDown, Code2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 環境変数の型定義
const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const AUTH_TOKEN = process.env.EXPO_PUBLIC_AUTH_TOKEN;

// 環境変数の検証
if (!API_GATEWAY_URL || !API_KEY || !AUTH_TOKEN) {
  throw new Error('必要な環境変数が設定されていません。');
}

// スキルの選択肢
const SKILLS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'csharp', label: 'C#' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'php', label: 'PHP' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'swift', label: 'Swift' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue.js' },
  { id: 'angular', label: 'Angular' },
  { id: 'svelte', label: 'Svelte' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'nuxtjs', label: 'Nuxt.js' },
  { id: 'nodejs', label: 'Node.js' },
  { id: 'django', label: 'Django' },
  { id: 'flask', label: 'Flask' },
  { id: 'spring', label: 'Spring Boot' },
  { id: 'rails', label: 'Ruby on Rails' },
  { id: 'laravel', label: 'Laravel' },
  { id: 'express', label: 'Express.js' },
  { id: 'fastapi', label: 'FastAPI' },
  { id: 'graphql', label: 'GraphQL' },
  { id: 'docker', label: 'Docker' },
  { id: 'kubernetes', label: 'Kubernetes' },
  { id: 'aws', label: 'AWS' },
  { id: 'gcp', label: 'Google Cloud' },
  { id: 'azure', label: 'Azure' },
];

// 経験年数の選択肢
const EXPERIENCE_YEARS = [
  '半年未満',
  '1年未満',
  '1-2年',
  '2-3年',
  '3-5年',
  '5-7年',
  '7-10年',
  '10年以上'
];

// 興味のある分野の選択肢
const INTERESTS = [
  { id: 'web', label: 'Web開発' },
  { id: 'mobile', label: 'モバイル開発' },
  { id: 'ai', label: 'AI/機械学習' },
  { id: 'blockchain', label: 'ブロックチェーン' },
  { id: 'game', label: 'ゲーム開発' },
  { id: 'iot', label: 'IoT' },
  { id: 'security', label: 'セキュリティ' },
  { id: 'cloud', label: 'クラウド' },
];

const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
] as const;

// 年齢の選択肢
const AGES = Array.from({ length: 11 }, (_, i) => (i + 15).toString());

// 画像の型定義
type ImageType = {
  uri: string;
};

export default function SetupScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // フォームの状態
  const [formData, setFormData] = useState({
    username: '',
    school: '',
    age: '',
    location: '',
    bio: '',
    skills: [] as Array<{ id: string; years: string }>,
    interests: [] as string[],
    twitterUsername: '',
    githubUsername: '',
  });

  // 画像の状態とデフォルト画像のURIを定義
  const defaultImages: Record<'icon' | 'cover', string> = {
    icon: 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-icon.png',
    cover: 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-cover.png',
  };

  const [images, setImages] = useState<Record<'icon' | 'cover', ImageType>>({
    icon: { uri: defaultImages.icon },
    cover: { uri: defaultImages.cover },
  });

  // スキル選択のモーダル状態
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // 場所選択のモーダル状態
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // 年齢選択のモーダル状態
  const [showAgePicker, setShowAgePicker] = useState(false);

  useEffect(() => {
    // トークンの存在確認
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('No token found in setup');
          router.replace('/(auth)/register');
          return;
        }
        console.log('Token found in setup:', token);
      } catch (error) {
        console.error('Error checking token:', error);
        router.replace('/(auth)/register');
      }
    };

    checkToken();
  }, []);

  const pickImage = async (type: 'icon' | 'cover') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'icon' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        setImages(prev => ({
          ...prev,
          [type]: { uri: selectedImage.uri }
        }));
      }
    } catch (error) {
      console.error('画像の選択に失敗しました:', error);
      Alert.alert('エラー', '画像の選択に失敗しました。');
    }
  };

  const removeImage = (type: 'icon' | 'cover') => {
    setImages(prev => ({
      ...prev,
      [type]: { uri: defaultImages[type] }
    }));
  };

  const addSkillWithExperience = (skill: string, years: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.some(s => s.id === skill)
        ? prev.skills.map(s => s.id === skill ? { id: skill, years } : s)
        : [...prev.skills, { id: skill, years }]
    }));
    setSelectedSkill(null);
    setShowExperiencePicker(false);
  };

  const removeSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== skillId)
    }));
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('ユーザー名を入力してください');
      return false;
    }
    if (!formData.school.trim()) {
      setError('学校名を入力してください');
      return false;
    }
    if (!formData.age.trim()) {
      setError('年齢を入力してください');
      return false;
    }
    if (!formData.location.trim()) {
      setError('場所を入力してください');
      return false;
    }
    return true;
  };

  const handleSetup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('エラー', '認証情報が見つかりません。再度ログインしてください。');
        router.replace('/(auth)/login');
        return;
      }

      // 画像のアップロード処理
      const uploadImage = async (type: 'icon' | 'cover') => {
        if (images[type].uri === defaultImages[type]) {
          return defaultImages[type];
        }

        const fileExt = images[type].uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}-${type}.${fileExt}`;
        const contentType = `image/${fileExt}`;

        try {
          // 1. Presigned URLを取得
          const cleanToken = token.replace('Bearer ', '');
          const presignedUrlResponse = await axios.post(
            `${API_GATEWAY_URL}/get-upload-url`,
            {
              fileName: fileName,
              fileType: contentType,
              uploadType: type === 'icon' ? 'profile-image' : 'cover-image'
            },
            {
              headers: {
                'Authorization': cleanToken,
                'Content-Type': 'application/json',
                'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
              }
            }
          );

          if (!presignedUrlResponse.data?.uploadUrl) {
            throw new Error('アップロードURLの取得に失敗しました');
          }

          const { uploadUrl, objectUrl } = presignedUrlResponse.data;

          // 2. 画像データを取得
          const response = await fetch(images[type].uri);
          const blob = await response.blob();

          // 3. Presigned URLを使用してS3に直接アップロード
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': contentType,
              'x-amz-acl': 'public-read'
            }
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`アップロード失敗: ${errorText}`);
          }

          console.log(`${type} image uploaded successfully to S3:`, objectUrl);
          return objectUrl;

        } catch (error) {
          console.error(`Error uploading ${type} image:`, error);
          if (axios.isAxiosError(error)) {
            console.error('Error details:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
            });
          }
          throw error;
        }
      };

      // 画像のアップロード
      let iconUrl = defaultImages.icon;
      let coverUrl = defaultImages.cover;

      try {
        if (images.icon.uri !== defaultImages.icon) {
          iconUrl = await uploadImage('icon');
        }
        if (images.cover.uri !== defaultImages.cover) {
          coverUrl = await uploadImage('cover');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        Alert.alert('警告', '画像のアップロードに失敗しましたが、プロフィールの保存は続行します。');
      }

      // プロフィールデータの作成
      const profileData = {
        ...formData,
        icon_url: iconUrl,
        cover_url: coverUrl,
        skills: formData.skills.map(skill => ({
          name: skill.id,
          years: skill.years
        })),
        twitterUsername: formData.twitterUsername?.replace('@', '').trim(),
        githubUsername: formData.githubUsername?.replace('@', '').trim(),
      };

      console.log('Sending profile data:', profileData);

      const response = await axios.post(
        `${API_GATEWAY_URL}/set_profile`,
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Profile setup response:', response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // プロフィール設定が成功したら、トークンを保持したまま画面遷移
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error setting up profile:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          Alert.alert('エラー', '認証エラーが発生しました。再度ログインしてください。');
          await AsyncStorage.removeItem('userToken');
          router.replace('/(auth)/login');
        } else {
          Alert.alert('エラー', 'プロフィールの設定に失敗しました。');
        }
      } else {
        Alert.alert('エラー', 'プロフィールの設定に失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageComparison = (type: 'icon' | 'cover', imageUri: string) => {
    return imageUri === defaultImages[type];
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>プロフィール設定</Text>
        <Text style={styles.headerSubtitle}>
          あなたの情報を入力して、プロジェクトに参加しましょう
        </Text>
      </View>

      <ScrollView 
        style={styles.form}
        keyboardShouldPersistTaps="handled">
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.coverImageContainer}>
          <Image 
            source={images.cover}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.coverImageButton} 
            onPress={() => pickImage('cover')}>
            <Camera size={20} color="#fff" />
            <Text style={styles.imageButtonText}>
              {handleImageComparison('cover', images.cover.uri) ? 'カバー画像を選択' : 'カバー画像を変更'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileImageContainer}>
          <Image 
            source={images.icon}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.profileImageButton} 
            onPress={() => pickImage('icon')}>
            <Camera size={20} color="#fff" />
            <Text style={styles.imageButtonText}>
              {handleImageComparison('icon', images.icon.uri) ? 'プロフィール画像を選択' : 'プロフィール画像を変更'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ユーザー名 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'username' && styles.inputFocused
            ]}
            value={formData.username}
            onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
            onFocus={() => setFocusedInput('username')}
            onBlur={() => setFocusedInput(null)}
            placeholder="ユーザー名を入力"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>学校名 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'school' && styles.inputFocused
            ]}
            value={formData.school}
            onChangeText={(text) => setFormData(prev => ({ ...prev, school: text }))}
            onFocus={() => setFocusedInput('school')}
            onBlur={() => setFocusedInput(null)}
            placeholder="学校名を入力"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>年齢 <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.ageButton}
            onPress={() => setShowAgePicker(true)}>
            <Text style={[
              styles.ageButtonText,
              !formData.age && styles.ageButtonPlaceholder
            ]}>
              {formData.age ? `${formData.age}歳` : '年齢を選択してください'}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>都道府県 <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setShowLocationPicker(true)}>
            <Text style={[
              styles.locationButtonText,
              !formData.location && styles.locationButtonPlaceholder
            ]}>
              {formData.location || '都道府県を選択してください'}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>自己紹介</Text>
          <TextInput
            style={[
              styles.textArea,
              focusedInput === 'bio' && styles.inputFocused
            ]}
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            onFocus={() => setFocusedInput('bio')}
            onBlur={() => setFocusedInput(null)}
            placeholder="自己紹介を入力"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>スキル</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowExperiencePicker(true)}>
            <Text style={styles.dropdownButtonText}>
              {formData.skills.length > 0 ? `${formData.skills.length}個のスキルを選択中` : 'スキルを選択'}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>
          {formData.skills.length > 0 && (
            <View style={styles.selectedSkillsContainer}>
              {formData.skills.map((skill) => (
                <View key={skill.id} style={styles.skillItem}>
                  <View style={styles.skillHeader}>
                    <Code2 size={16} color="#6366f1" />
                    <Text style={styles.skillName}>
                      {SKILLS.find(s => s.id === skill.id)?.label}
                    </Text>
                  </View>
                  <Text style={styles.skillYears}>
                    経験年数: {skill.years}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeSkill(skill.id)}
                    style={styles.removeSkillButton}>
                    <X size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>興味のある分野</Text>
          <View style={styles.interestsContainer}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.interestButton,
                  formData.interests.includes(interest.id) && styles.interestButtonSelected
                ]}
                onPress={() => handleInterestToggle(interest.id)}>
                <Text style={[
                  styles.interestButtonText,
                  formData.interests.includes(interest.id) && styles.interestButtonTextSelected
                ]}>
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Twitter ユーザーネーム</Text>
          <View style={styles.socialInputContainer}>
            <Text style={styles.socialPrefix}>@</Text>
            <TextInput
              style={[
                styles.socialInput,
                focusedInput === 'twitter' && styles.inputFocused
              ]}
              value={formData.twitterUsername}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                twitterUsername: text.replace('@', '') 
              }))}
              onFocus={() => setFocusedInput('twitter')}
              onBlur={() => setFocusedInput(null)}
              placeholder="Twitterユーザーネーム"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>GitHub ユーザーネーム</Text>
          <View style={styles.socialInputContainer}>
            <Text style={styles.socialPrefix}>@</Text>
            <TextInput
              style={[
                styles.socialInput,
                focusedInput === 'github' && styles.inputFocused
              ]}
              value={formData.githubUsername}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                githubUsername: text.replace('@', '') 
              }))}
              onFocus={() => setFocusedInput('github')}
              onBlur={() => setFocusedInput(null)}
              placeholder="GitHubユーザーネーム"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSetup}
          disabled={loading}>
          <Text style={styles.submitButtonText}>
            {loading ? '設定中...' : 'プロフィールを設定'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
                {selectedSkill 
                  ? `${SKILLS.find(s => s.id === selectedSkill)?.label}の経験年数を選択`
                  : 'スキルを選択'}
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
              {!selectedSkill ? (
                SKILLS.map((skill) => (
                  <TouchableOpacity
                    key={skill.id}
                    style={styles.pickerModalItem}
                    onPress={() => setSelectedSkill(skill.id)}>
                    <Text style={styles.pickerModalItemText}>{skill.label}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                EXPERIENCE_YEARS.map((years) => (
                  <TouchableOpacity
                    key={years}
                    style={styles.pickerModalItem}
                    onPress={() => {
                      if (selectedSkill) {
                        addSkillWithExperience(selectedSkill, years);
                      }
                    }}>
                    <Text style={styles.pickerModalItemText}>{years}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationPicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>都道府県を選択</Text>
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.prefectureList}>
              {prefectures.map((prefecture: string) => (
                <TouchableOpacity
                  key={prefecture}
                  style={[
                    styles.prefectureItem,
                    formData.location === prefecture && styles.prefectureItemActive
                  ]}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      location: prefecture
                    }));
                    setShowLocationPicker(false);
                  }}>
                  <Text style={[
                    styles.prefectureText,
                    formData.location === prefecture && styles.prefectureTextActive
                  ]}>{prefecture}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Age Picker Modal */}
      <Modal
        visible={showAgePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAgePicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>年齢を選択</Text>
              <TouchableOpacity onPress={() => setShowAgePicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.ageList}>
              {AGES.map((age) => (
                <TouchableOpacity
                  key={age}
                  style={[
                    styles.ageItem,
                    formData.age === age && styles.ageItemActive
                  ]}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      age
                    }));
                    setShowAgePicker(false);
                  }}>
                  <Text style={[
                    styles.ageText,
                    formData.age === age && styles.ageTextActive
                  ]}>{age}歳</Text>
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
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    lineHeight: 20,
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
  textArea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    height: 120,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: '#6366f1',
    backgroundColor: '#fff',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  skillLabel: {
    fontSize: 14,
    color: '#1f2937',
    marginRight: 8,
  },
  skillInput: {
    width: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 4,
    textAlign: 'center',
  },
  skillUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  interestButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  interestButtonText: {
    fontSize: 14,
    color: '#1f2937',
  },
  interestButtonTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  selectedSkillsContainer: {
    marginTop: 12,
    gap: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  skillYears: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 12,
  },
  removeSkillButton: {
    padding: 4,
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
  pickerModalItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  required: {
    color: '#ef4444',
    marginLeft: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  locationButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  locationButtonPlaceholder: {
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  prefectureList: {
    maxHeight: 400,
  },
  prefectureItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  prefectureItemActive: {
    backgroundColor: '#eff6ff',
  },
  prefectureText: {
    fontSize: 16,
    color: '#1f2937',
  },
  prefectureTextActive: {
    color: '#6366f1',
    fontWeight: '500',
  },
  ageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  ageButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  ageButtonPlaceholder: {
    color: '#6b7280',
  },
  ageList: {
    maxHeight: 400,
  },
  ageItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  ageItemActive: {
    backgroundColor: '#eff6ff',
  },
  ageText: {
    fontSize: 16,
    color: '#1f2937',
  },
  ageTextActive: {
    color: '#6366f1',
    fontWeight: '500',
  },
  socialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  socialPrefix: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 8,
  },
  socialInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
}); 