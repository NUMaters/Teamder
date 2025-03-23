import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Upload, X, ChevronDown, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { createApiRequest } from '@/lib/api-client';

interface ProjectFormData {
  title: string;
  description: string;
  required_skills: string[];
  image_url: string;
  location: string;
  max_members: string;
}

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

const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
] as const;

export default function CreateProjectScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    required_skills: [],
    image_url: 'https://teamder-aws.s3.us-west-2.amazonaws.com/project-placeholder.png',
    location: '',
    max_members: '',
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('画像の選択に失敗しました:', error);
      Alert.alert('エラー', '画像の選択に失敗しました。');
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `project-${Date.now()}.${fileExt}`;
      const contentType = `image/${fileExt}`;

      // Presigned URLを取得
      const presignedUrlResponse = await createApiRequest('/get-upload-url', 'POST', {
        fileName,
        fileType: contentType,
        uploadType: 'project-image',
        bucketName: 'teamder-s3-3twztfaxci8ero71ohusp3888uh6ausw2a-s3alias'
      });

      if (!presignedUrlResponse.data?.uploadUrl) {
        throw new Error('アップロードURLの取得に失敗しました');
      }

      const { uploadUrl, objectUrl } = presignedUrlResponse.data;

      // 画像データを取得
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // S3にアップロード
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': contentType,
          'x-amz-acl': 'public-read'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      return objectUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('画像のアップロードに失敗しました');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('プロジェクト名を入力してください');
      return;
    }
    if (!formData.location.trim()) {
      setError('場所を選択してください');
      return;
    }
    if (!formData.max_members.trim()) {
      setError('チーム規模を入力してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let imageUrl = formData.image_url;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const projectData = {
        id: uuidv4(),
        ...formData,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
        status: 'active'
      };

      await createApiRequest('/set_project', 'POST', projectData);

      Alert.alert('成功', 'プロジェクトを作成しました', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('プロジェクトの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: [...prev.required_skills, skillId]
    }));
    setShowSkillPicker(false);
  };

  const removeSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(id => id !== skillId)
    }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>プロジェクトを作成</Text>
          <Text style={styles.subtitle}>
            プロジェクトの詳細を入力して、メンバーを募集しましょう
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.imageContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.projectImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Upload size={32} color="#9ca3af" />
              <Text style={styles.imagePlaceholderText}>
                プロジェクト画像を選択
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.imageButton}
            onPress={pickImage}>
            <Camera size={20} color="#fff" />
            <Text style={styles.imageButtonText}>
              {selectedImage ? '画像を変更' : '画像を選択'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>プロジェクト名 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="プロジェクト名を入力"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>プロジェクトの説明</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="プロジェクトの説明を入力（任意）"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>必要なスキル</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowSkillPicker(true)}>
            <Text style={styles.dropdownButtonText}>
              {formData.required_skills.length > 0
                ? `${formData.required_skills.length}個のスキルを選択中`
                : 'スキルを選択（任意）'}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>
          {formData.required_skills.length > 0 && (
            <View style={styles.selectedSkillsContainer}>
              {formData.required_skills.map((skillId) => (
                <View key={skillId} style={styles.skillItem}>
                  <Text style={styles.skillName}>
                    {SKILLS.find(s => s.id === skillId)?.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeSkill(skillId)}
                    style={styles.removeSkillButton}>
                    <X size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>場所 <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowLocationPicker(true)}>
            <Text style={[
              styles.dropdownButtonText,
              !formData.location && styles.dropdownButtonPlaceholder
            ]}>
              {formData.location || '場所を選択'}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>チーム規模 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.max_members}
            onChangeText={(text) => setFormData(prev => ({ ...prev, max_members: text }))}
            placeholder="チーム規模を入力（例：3-5人）"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.submitButtonText}>
            {loading ? '作成中...' : 'プロジェクトを作成'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* スキル選択モーダル */}
      <Modal
        visible={showSkillPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSkillPicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>スキルを選択</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSkillPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {SKILLS.map((skill) => (
                <TouchableOpacity
                  key={skill.id}
                  style={[
                    styles.modalItem,
                    formData.required_skills.includes(skill.id) && styles.modalItemSelected
                  ]}
                  onPress={() => addSkill(skill.id)}>
                  <Text style={[
                    styles.modalItemText,
                    formData.required_skills.includes(skill.id) && styles.modalItemTextSelected
                  ]}>
                    {skill.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 場所選択モーダル */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationPicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>場所を選択</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowLocationPicker(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {prefectures.map((prefecture) => (
                <TouchableOpacity
                  key={prefecture}
                  style={[
                    styles.modalItem,
                    formData.location === prefecture && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, location: prefecture }));
                    setShowLocationPicker(false);
                  }}>
                  <Text style={[
                    styles.modalItemText,
                    formData.location === prefecture && styles.modalItemTextSelected
                  ]}>
                    {prefecture}
                  </Text>
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
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    margin: 16,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  imageButton: {
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
  imageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  formGroup: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dropdownButtonPlaceholder: {
    color: '#9ca3af',
  },
  selectedSkillsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  skillName: {
    fontSize: 14,
    color: '#1f2937',
  },
  removeSkillButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
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
  modalList: {
    padding: 20,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalItemSelected: {
    backgroundColor: '#eff6ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  modalItemTextSelected: {
    color: '#6366f1',
    fontWeight: '500',
  },
}); 