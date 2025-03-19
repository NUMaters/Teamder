import { useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { X, Plus, ChevronDown } from 'lucide-react-native';

export type ProjectFormData = {
  title: string;
  type: string;
  description: string;
  skills: string[];
  teamSize: string;
  locations: string[];
};

interface CreateProjectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (project: ProjectFormData) => void;
}

const INITIAL_FORM_DATA: ProjectFormData = {
  title: '',
  type: '',
  description: '',
  skills: [],
  teamSize: '',
  locations: [],
};

const PROJECT_TYPES = [
  'ハッカソン',
  '勉強会',
  'LT会',
  '交流会',
  'アプリ開発',
  'Web開発',
  'AI/ML開発',
  'オープンソース',
  'ゲーム開発',
];

const TEAM_SIZES = [
  '1人',
  '2-3人',
  '4-5人',
  '6-10人',
  '10人以上',
];

const TECH_STACKS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C',
  'C++',
  'C#',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'PHP',
  'Ruby',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Django',
  'Flask',
  'Spring',
  'Laravel',
  'Ruby on Rails',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'Firebase',
];

const LOCATIONS = [
  'オンライン',
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

export default function CreateProjectModal({ isVisible, onClose, onSubmit }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [showTeamSizeDropdown, setShowTeamSizeDropdown] = useState(false);

  const handleSubmit = () => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

    if (!formData.title) newErrors.title = 'プロジェクト名は必須です';
    if (!formData.type) newErrors.type = 'プロジェクトタイプは必須です';
    if (!formData.description) newErrors.description = 'プロジェクト概要は必須です';
    if (!formData.skills.length) newErrors.skills = '必要なスキルは1つ以上必須です';
    if (!formData.teamSize) newErrors.teamSize = 'チーム規模は必須です';
    if (!formData.locations.length) newErrors.locations = '募集地域は1つ以上必須です';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    onClose();
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location],
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
          <View style={[styles.header, Platform.OS === 'ios' ? { paddingTop: 60 } : { paddingTop: 20 }]}>
            <Text style={styles.headerTitle}>新規プロジェクト作成</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>プロジェクト名</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="プロジェクト名を入力"
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>プロジェクトタイプ</Text>
              <View style={styles.typeContainer}>
                {PROJECT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, type })}>
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === type && styles.typeButtonTextActive,
                      ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>プロジェクト概要</Text>
              <TextInput
                style={[styles.textArea, errors.description && styles.inputError]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="プロジェクトの詳細な説明を入力"
                multiline
                numberOfLines={4}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>必要なスキル</Text>
              <View style={styles.skillsGrid}>
                {TECH_STACKS.map((skill) => (
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
              {errors.skills && <Text style={styles.errorText}>{errors.skills}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>募集人数</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowTeamSizeDropdown(!showTeamSizeDropdown)}>
                <Text style={styles.dropdownButtonText}>
                  {formData.teamSize || '募集人数を選択'}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>
              {showTeamSizeDropdown && (
                <View style={styles.dropdownContent}>
                  {TEAM_SIZES.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({ ...formData, teamSize: size });
                        setShowTeamSizeDropdown(false);
                      }}>
                      <Text style={styles.dropdownItemText}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.teamSize && <Text style={styles.errorText}>{errors.teamSize}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>募集地域</Text>
              <View style={styles.locationsGrid}>
                {LOCATIONS.map((location) => (
                  <TouchableOpacity
                    key={location}
                    style={[
                      styles.locationButton,
                      formData.locations.includes(location) && styles.locationButtonActive,
                    ]}
                    onPress={() => toggleLocation(location)}>
                    <Text
                      style={[
                        styles.locationButtonText,
                        formData.locations.includes(location) && styles.locationButtonTextActive,
                      ]}>
                      {location}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.locations && <Text style={styles.errorText}>{errors.locations}</Text>}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>プロジェクトを作成</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
    height: 100,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#fff',
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
    backgroundColor: '#fff',
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
    color: '#fff',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  dropdownContent: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
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
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  locationButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
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
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateProjectModal