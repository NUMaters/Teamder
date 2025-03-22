import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, Alert, KeyboardAvoidingView, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, X, ChevronDown, Code2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// スキルの選択肢
const SKILLS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue.js' },
  { id: 'angular', label: 'Angular' },
  { id: 'nodejs', label: 'Node.js' },
  { id: 'aws', label: 'AWS' },
  { id: 'docker', label: 'Docker' },
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

// 都道府県の選択肢
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// 年齢の選択肢
const AGES = Array.from({ length: 11 }, (_, i) => (i + 15).toString());

interface Skill {
  id: string;
  years: string;
}

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
    skills: [] as Skill[],
    interests: [] as string[],
  });

  // モーダルの状態
  const [showExperiencePicker, setShowExperiencePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/register');
    }
  }, [token]);

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
    if (!formData.age) {
      setError('年齢を選択してください');
      return false;
    }
    if (!formData.location) {
      setError('都道府県を選択してください');
      return false;
    }
    return true;
  };

  const handleSetup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/profile/setup', {
        username: formData.username,
        school: formData.school,
        age: formData.age,
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills,
        interests: formData.interests,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert('エラー', 'プロフィールの設定に失敗しました。');
    } finally {
      setLoading(false);
    }
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedSkill 
                  ? `${SKILLS.find(s => s.id === selectedSkill)?.label}の経験年数を選択`
                  : 'スキルを選択'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowExperiencePicker(false);
                  setSelectedSkill(null);
                }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {!selectedSkill ? (
                SKILLS.map((skill) => (
                  <TouchableOpacity
                    key={skill.id}
                    style={styles.modalItem}
                    onPress={() => setSelectedSkill(skill.id)}>
                    <Text style={styles.modalItemText}>{skill.label}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                EXPERIENCE_YEARS.map((years) => (
                  <TouchableOpacity
                    key={years}
                    style={styles.modalItem}
                    onPress={() => {
                      if (selectedSkill) {
                        addSkillWithExperience(selectedSkill, years);
                      }
                    }}>
                    <Text style={styles.modalItemText}>{years}</Text>
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
            <ScrollView style={styles.modalList}>
              {PREFECTURES.map((prefecture) => (
                <TouchableOpacity
                  key={prefecture}
                  style={[
                    styles.modalItem,
                    formData.location === prefecture && styles.modalItemActive
                  ]}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      location: prefecture
                    }));
                    setShowLocationPicker(false);
                  }}>
                  <Text style={[
                    styles.modalItemText,
                    formData.location === prefecture && styles.modalItemTextActive
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
            <ScrollView style={styles.modalList}>
              {AGES.map((age) => (
                <TouchableOpacity
                  key={age}
                  style={[
                    styles.modalItem,
                    formData.age === age && styles.modalItemActive
                  ]}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      age
                    }));
                    setShowAgePicker(false);
                  }}>
                  <Text style={[
                    styles.modalItemText,
                    formData.age === age && styles.modalItemTextActive
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
  formGroup: {
    marginBottom: 20,
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
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inputFocused: {
    borderColor: '#6366f1',
    backgroundColor: '#fff',
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
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
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
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalItemActive: {
    backgroundColor: '#eff6ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  modalItemTextActive: {
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
});