import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Save, X, MapPin, Users, Clock, CreditCard, Plus, Trash2 } from 'lucide-react-native';

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
  'Go',
  'Rust',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Django',
  'Flask',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
];

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showSkillSelector, setShowSkillSelector] = useState(false);

  // In a real app, this would be fetched from your backend
  const [project, setProject] = useState({
    id: '1',
    title: 'AIチャットボットプラットフォーム開発',
    company: 'テックスタートアップ株式会社',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400',
    location: 'リモート可',
    description: '最新のAI技術を活用したチャットボットプラットフォームの開発。自然言語処理とマルチモーダルAIの統合が主なチャレンジです。',
    skills: ['Python', 'TensorFlow', 'React', 'Node.js', 'AWS'],
    teamSize: '4-6名',
    duration: '6ヶ月',
    budget: '〜100万円/月',
    type: 'スタートアップ',
    status: '募集中',
  });

  const handleSave = () => {
    // In a real app, this would save to your backend
    setIsEditing(false);
    Alert.alert('成功', 'プロジェクトが更新されました');
  };

  const handleDelete = () => {
    Alert.alert(
      'プロジェクトの削除',
      'このプロジェクトを削除してもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would delete from your backend
            router.back();
          },
        },
      ],
    );
  };

  const toggleSkill = (skill: string) => {
    setProject(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <X size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'プロジェクトを編集' : 'プロジェクトの詳細'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.headerButton, styles.saveButton]}
                onPress={handleSave}>
                <Save size={20} color="#fff" />
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerButton, styles.cancelButton]}
                onPress={() => setIsEditing(false)}>
                <X size={20} color="#fff" />
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.headerButton, styles.editButton]}
                onPress={() => setIsEditing(true)}>
                <Text style={styles.editButtonText}>編集</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerButton, styles.deleteButton]}
                onPress={handleDelete}>
                <Trash2 size={20} color="#dc2626" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: project.image }} style={styles.image} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>プロジェクト名</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={project.title}
              onChangeText={(text) => setProject({ ...project, title: text })}
              placeholder="プロジェクト名を入力"
            />
          ) : (
            <Text style={styles.value}>{project.title}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>会社名</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={project.company}
              onChangeText={(text) => setProject({ ...project, company: text })}
              placeholder="会社名を入力"
            />
          ) : (
            <Text style={styles.value}>{project.company}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>プロジェクト概要</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={project.description}
              onChangeText={(text) => setProject({ ...project, description: text })}
              placeholder="プロジェクトの詳細な説明を入力"
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.value}>{project.description}</Text>
          )}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MapPin size={20} color="#6b7280" />
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={project.location}
                onChangeText={(text) => setProject({ ...project, location: text })}
                placeholder="勤務地"
              />
            ) : (
              <Text style={styles.infoText}>{project.location}</Text>
            )}
          </View>
          <View style={styles.infoItem}>
            <Users size={20} color="#6b7280" />
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={project.teamSize}
                onChangeText={(text) => setProject({ ...project, teamSize: text })}
                placeholder="チーム規模"
              />
            ) : (
              <Text style={styles.infoText}>{project.teamSize}</Text>
            )}
          </View>
          <View style={styles.infoItem}>
            <Clock size={20} color="#6b7280" />
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={project.duration}
                onChangeText={(text) => setProject({ ...project, duration: text })}
                placeholder="期間"
              />
            ) : (
              <Text style={styles.infoText}>{project.duration}</Text>
            )}
          </View>
          <View style={styles.infoItem}>
            <CreditCard size={20} color="#6b7280" />
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={project.budget}
                onChangeText={(text) => setProject({ ...project, budget: text })}
                placeholder="予算"
              />
            ) : (
              <Text style={styles.infoText}>{project.budget}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>必要なスキル</Text>
            {isEditing && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowSkillSelector(!showSkillSelector)}>
                <Plus size={20} color="#6366f1" />
                <Text style={styles.addButtonText}>追加</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.skillsContainer}>
            {project.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
                {isEditing && (
                  <TouchableOpacity
                    onPress={() => toggleSkill(skill)}
                    style={styles.removeSkillButton}>
                    <X size={12} color="#4f46e5" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {showSkillSelector && (
            <View style={styles.skillSelector}>
              {TECH_STACKS.filter(skill => !project.skills.includes(skill)).map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={styles.skillOption}
                  onPress={() => {
                    toggleSkill(skill);
                    setShowSkillSelector(false);
                  }}>
                  <Text style={styles.skillOptionText}>{skill}</Text>
                  <Plus size={16} color="#6366f1" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#6366f1',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  value: {
    fontSize: 16,
    color: '#1f2937',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '500',
  },
  removeSkillButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#c7d2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillSelector: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
  },
  skillOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  skillOptionText: {
    fontSize: 14,
    color: '#1f2937',
  },
});