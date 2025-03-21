import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Save, X, MapPin, Users, Clock, CreditCard, Plus, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

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

export default function CreateProjectScreen() {
  const router = useRouter();
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [project, setProject] = useState({
    title: '',
    company: '',
    image: '',
    location: '',
    description: '',
    teamSize: '',
    duration: '',
    budget: '',
    skills: [],
  });

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            owner_id: user.id,
            title: project.title,
            company: project.company,
            image: project.image,
            location: project.location,
            description: project.description,
            team_size: project.teamSize,
            duration: project.duration,
            budget: project.budget,
            skills: project.skills,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      router.push(`/projects/${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('エラー', 'プロジェクトの作成に失敗しました。');
    }
  };

  const toggleSkill = (skill: string) => {
    setProject(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const pickImage = async () => {
    try {
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
        const filePath = `${fileName}`;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('ユーザーが見つかりません');

        const response = await fetch(file.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        setProject(prev => ({ ...prev, image: publicUrl }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('エラー', '画像のアップロードに失敗しました。もう一度お試しください。');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <X size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>新規プロジェクト作成</Text>
        </View>
        <TouchableOpacity
          style={[styles.headerButton, styles.saveButton]}
          onPress={handleSave}>
          <Save size={20} color="#fff" />
          <Text style={styles.saveButtonText}>作成</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {project.image ? (
            <Image source={{ uri: project.image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Upload size={32} color="#6b7280" />
              <Text style={styles.imagePlaceholderText}>画像を選択</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={pickImage}>
            <Upload size={24} color="#fff" />
            <Text style={styles.imageUploadText}>画像を選択</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>プロジェクト名</Text>
          <TextInput
            style={styles.input}
            value={project.title}
            onChangeText={(text) => setProject({ ...project, title: text })}
            placeholder="プロジェクト名を入力"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>会社名</Text>
          <TextInput
            style={styles.input}
            value={project.company}
            onChangeText={(text) => setProject({ ...project, company: text })}
            placeholder="会社名を入力"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>プロジェクト概要</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={project.description}
            onChangeText={(text) => setProject({ ...project, description: text })}
            placeholder="プロジェクトの詳細な説明を入力"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MapPin size={20} color="#6b7280" />
            <TextInput
              style={styles.infoInput}
              value={project.location}
              onChangeText={(text) => setProject({ ...project, location: text })}
              placeholder="勤務地"
            />
          </View>
          <View style={styles.infoItem}>
            <Users size={20} color="#6b7280" />
            <TextInput
              style={styles.infoInput}
              value={project.teamSize}
              onChangeText={(text) => setProject({ ...project, teamSize: text })}
              placeholder="チーム規模"
            />
          </View>
          <View style={styles.infoItem}>
            <Clock size={20} color="#6b7280" />
            <TextInput
              style={styles.infoInput}
              value={project.duration}
              onChangeText={(text) => setProject({ ...project, duration: text })}
              placeholder="期間"
            />
          </View>
          <View style={styles.infoItem}>
            <CreditCard size={20} color="#6b7280" />
            <TextInput
              style={styles.infoInput}
              value={project.budget}
              onChangeText={(text) => setProject({ ...project, budget: text })}
              placeholder="予算"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>必要なスキル</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowSkillSelector(!showSkillSelector)}>
              <Plus size={20} color="#6366f1" />
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.skillsContainer}>
            {project.skills.map((skill: string, index: number) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity
                  onPress={() => toggleSkill(skill)}
                  style={styles.removeSkillButton}>
                  <X size={12} color="#4f46e5" />
                </TouchableOpacity>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
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
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#6b7280',
  },
  imageUploadButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  imageUploadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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