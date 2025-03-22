import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Save, X, MapPin, Users, Clock, CreditCard, Plus, Trash2, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

type Project = {
  id: string;
  title: string;
  university: string;
  image: string;
  location: string;
  description: string;
  teamSize: string;
  duration: string;
  budget: string;
  skills: string[];
  status: string;
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
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      Alert.alert('エラー', 'プロジェクトの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: project.title,
          university: project.university,
          image_url: project.image,
          location: project.location,
          description: project.description,
          team_size: project.teamSize,
          duration: project.duration,
          budget: project.budget,
          skills: project.skills,
        })
        .eq('id', project.id);

      if (error) throw error;
      setIsEditing(false);
      Alert.alert('成功', 'プロジェクトが更新されました');
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert('エラー', 'プロジェクトの更新に失敗しました。');
    }
  };

  const handleDelete = async () => {
    if (!project) return;

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
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', project.id);

              if (error) throw error;
              router.back();
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert('エラー', 'プロジェクトの削除に失敗しました。');
            }
          },
        },
      ],
    );
  };

  const toggleSkill = (skill: string) => {
    setProject(prev => {
      if (!prev) return null;
      return {
        ...prev,
        skills: prev.skills.includes(skill)
          ? prev.skills.filter(s => s !== skill)
          : [...prev.skills, skill],
      };
    });
  };

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
        const filePath = `${fileName}`;

        // ユーザーIDを取得
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('ユーザーが見つかりません');

        // 画像をアップロード
        const response = await fetch(file.uri);
        const blob = await response.blob();

        console.log('Uploading image to path:', filePath);

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        console.log('Upload successful, public URL:', publicUrl);

        setProject(prev => {
          if (!prev) return null;
          return { ...prev, image: publicUrl };
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('エラー', '画像のアップロードに失敗しました。もう一度お試しください。');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <Text>プロジェクトが見つかりません</Text>
      </View>
    );
  }

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

      <ScrollView 
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: project.image }} style={styles.image} />
          {isEditing && (
            <TouchableOpacity
              style={styles.imageUploadButton}
              onPress={pickImage}>
              <Upload size={24} color="#fff" />
              <Text style={styles.imageUploadText}>画像を変更</Text>
            </TouchableOpacity>
          )}
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
          <Text style={styles.label}>大学名</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={project.university}
              onChangeText={(text) => setProject({ ...project, university: text })}
              placeholder="大学名を入力"
            />
          ) : (
            <Text style={styles.value}>{project.university}</Text>
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
                placeholder="場所"
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
            {project.skills.map((skill: string, index: number) => (
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
  },
  image: {
    width: '100%',
    height: '100%',
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