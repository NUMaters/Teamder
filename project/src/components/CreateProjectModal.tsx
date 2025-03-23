import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Image, Alert, KeyboardAvoidingView } from 'react-native';
import { X, Upload, MapPin, Users, Clock, CreditCard, Activity, ChevronDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';

const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;
const API_GATEWAY_URL_PRJ = process.env.EXPO_PUBLIC_API_GATEWAY_URL_PROJECT;

const LOCATIONS = [
  'オンライン',
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

const TEAM_SIZES = [
  '1-2名',
  '3-4名',
  '5-6名',
  '7-10名',
  '10名以上'
];

const PROJECT_STATUSES = [
  '募集中',
  '停止中',
  '準備中'
];

const SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust',
  'Swift', 'Kotlin', 'PHP', 'Ruby', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Django', 'Flask', 'Spring', 'Laravel', 'Ruby on Rails', 'PostgreSQL',
  'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Firebase', 'Git', 'CI/CD', 'UI/UX', 'デザイン', 'プロジェクトマネジメント'
];

export type ProjectFormData = {
  title: string;
  school: string;
  image_url: string;
  location: string;
  description: string;
  team_size: string;
  duration: string;
  budget: string;
  status: string;
  skills: string[];
};

type CreateProjectModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
};

export default function CreateProjectModal({ isVisible, onClose, onSubmit }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    school: '',
    image_url: '',
    location: '',
    description: '',
    team_size: '',
    duration: '',
    budget: '',
    status: '募集中',
    skills: [],
  });

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showTeamSizeDropdown, setShowTeamSizeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  const pickImage = async () => {
    try {
      // 権限をリクエスト
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('エラー', '画像を選択するには権限が必要です。');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;

        // 画像をアップロード
        const response = await fetch(file.uri);
        const blob = await response.blob();

        // ユーザートークンを取得
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('ユーザートークンが見つかりません');
        }

        const userResponse = await axios.post(
          `${API_GATEWAY_URL}/get_profile`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
            }
          }
        );

        if (!userResponse.data?.id) {
          throw new Error('ユーザーが見つかりません');
        }

        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          type: `image/${fileExt}`,
          name: fileName,
        } as any);

        const uploadResponse = await axios.post(
          `${API_GATEWAY_URL}/upload/project-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': token
            }
          }
        );

        if (!uploadResponse.data?.url) {
          throw new Error('画像のアップロードに失敗しました');
        }

        setFormData(prev => ({ ...prev, image_url: uploadResponse.data.url }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('エラー', '画像のアップロードに失敗しました。');
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const generateUUID = async () => {
    const randomBytes = await Crypto.getRandomValues(new Uint8Array(16));
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (randomBytes[0] & 0x0f) | 0x0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return uuid;
  };

  const handleSubmit = async () => {
    try {
      // ユーザートークンを取得
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('ユーザートークンが見つかりません');
      }
      
      // ユーザー情報を取得
      const userResponse = await axios.post(
        `${API_GATEWAY_URL}/get_profile`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
          }
        }
      );

      if (!userResponse.data?.id) {
        throw new Error('ユーザーが見つかりません');
      }

      const projectData = {
        id: await generateUUID(),
        owner_id: userResponse.data.id,
        title: formData.title,
        school: formData.school,
        image_url: formData.image_url,
        location: formData.location,
        description: formData.description,
        team_size: formData.team_size,
        duration: formData.duration,
        budget: formData.budget,
        status: formData.status,
        skills: formData.skills,
      };

      const response = await axios.post(
        `${API_GATEWAY_URL_PRJ}/set_project`,
        projectData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        }
      );

      if (!response.data) {
        throw new Error('プロジェクトの作成に失敗しました');
      }

      onSubmit(response.data);
      setFormData({
        title: '',
        school: '',
        image_url: '',
        location: '',
        description: '',
        team_size: '',
        duration: '',
        budget: '',
        status: '募集中',
        skills: [],
      });
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('エラー', 'プロジェクトの作成に失敗しました。');
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>新規プロジェクト作成</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {formData.image_url ? (
                <Image source={{ uri: formData.image_url }} style={styles.previewImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Upload size={32} color="#6b7280" />
                  <Text style={styles.uploadText}>画像をアップロード</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>プロジェクト名</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="プロジェクト名を入力"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>場所</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowLocationDropdown(!showLocationDropdown)}>
                <Text style={styles.dropdownButtonText}>
                  {formData.location || '場所を選択'}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>
              {showLocationDropdown && (
                <View style={styles.dropdownContent}>
                  <ScrollView>
                    {LOCATIONS.map((location) => (
                      <TouchableOpacity
                        key={location}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, location }));
                          setShowLocationDropdown(false);
                        }}>
                        <Text style={styles.dropdownItemText}>{location}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>チーム規模</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowTeamSizeDropdown(!showTeamSizeDropdown)}>
                <Text style={styles.dropdownButtonText}>
                  {formData.team_size || 'チーム規模を選択'}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>
              {showTeamSizeDropdown && (
                <View style={styles.dropdownContent}>
                  <ScrollView>
                    {TEAM_SIZES.map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, team_size: size }));
                          setShowTeamSizeDropdown(false);
                        }}>
                        <Text style={styles.dropdownItemText}>{size}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>期間</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color="#6b7280" />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.duration}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
                  placeholder="例: 3ヶ月"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>予算</Text>
              <View style={styles.inputWithIcon}>
                <CreditCard size={20} color="#6b7280" />
                <TextInput
                  style={[styles.input, styles.inputWithIconText]}
                  value={formData.budget}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, budget: text }))}
                  placeholder="例: 〜50万円/月"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ステータス</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}>
                <Text style={styles.dropdownButtonText}>
                  {formData.status || 'ステータスを選択'}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>
              {showStatusDropdown && (
                <View style={styles.dropdownContent}>
                  <ScrollView>
                    {PROJECT_STATUSES.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, status }));
                          setShowStatusDropdown(false);
                        }}>
                        <Text style={styles.dropdownItemText}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>求めるスキル</Text>
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
                  <View style={styles.skillsGrid}>
                    {SKILLS.map((skill) => (
                      <TouchableOpacity
                        key={skill}
                        style={[
                          styles.skillButton,
                          formData.skills.includes(skill) && styles.skillButtonActive,
                        ]}
                        onPress={() => toggleSkill(skill)}>
                        <Text
                          style={[
                            styles.skillButtonText,
                            formData.skills.includes(skill) && styles.skillButtonTextActive,
                          ]}>
                          {skill}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>プロジェクトの説明</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="プロジェクトの詳細を入力"
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>作成</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  imageUpload: {
    width: '100%',
    height: 200,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    color: '#6b7280',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWithIconText: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 12,
    paddingLeft: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dropdownContent: {
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  skillsDropdownContent: {
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});