import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Save, X, MapPin, Users, Clock, CreditCard, Plus, Upload, ArrowLeft } from 'lucide-react-native';
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

type ProjectStatus = 'active' | 'paused' | 'completed';

type ProjectFormData = {
  title: string;
  university: string;
  image_url: string;
  location: string;
  description: string;
  team_size: string;
  duration: string;
  budget: string;
  status: ProjectStatus;
};

export default function CreateProjectScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    university: '',
    image_url: '',
    location: '',
    description: '',
    team_size: '',
    duration: '',
    budget: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }

      const { error } = await supabase
        .from('projects')
        .insert([
          {
            ...formData,
            owner_id: user.id,
          }
        ]);

      if (error) throw error;

      Alert.alert('成功', 'プロジェクトを作成しました');
      router.back();
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('エラー', 'プロジェクトの作成に失敗しました');
    } finally {
      setLoading(false);
    }
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('ユーザーが見つかりません');

        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const response = await fetch(file.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('projects')
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('projects')
          .getPublicUrl(filePath);

        setFormData(prev => ({ ...prev, image_url: publicUrl }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('エラー', '画像のアップロードに失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>新規プロジェクト</Text>
        <TouchableOpacity
          style={[styles.headerButton, styles.saveButton]}
          onPress={handleSubmit}
          disabled={loading}>
          <Save size={20} color="#fff" />
          <Text style={styles.saveButtonText}>作成</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={pickImage}>
          {formData.image_url ? (
            <Image source={{ uri: formData.image_url }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Upload size={48} color="#9ca3af" />
              <Text style={styles.imagePlaceholderText}>
                タップして画像を追加
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>プロジェクト名</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="プロジェクト名を入力"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>大学名</Text>
            <TextInput
              style={styles.input}
              value={formData.university}
              onChangeText={(text) => setFormData({ ...formData, university: text })}
              placeholder="大学名を入力"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>説明</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="プロジェクトの詳細な説明を入力"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>基本情報</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <MapPin size={20} color="#6b7280" />
                <TextInput
                  style={styles.infoInput}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  placeholder="勤務地"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.infoItem}>
                <Users size={20} color="#6b7280" />
                <TextInput
                  style={styles.infoInput}
                  value={formData.team_size}
                  onChangeText={(text) => setFormData({ ...formData, team_size: text })}
                  placeholder="チーム規模"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.infoItem}>
                <Clock size={20} color="#6b7280" />
                <TextInput
                  style={styles.infoInput}
                  value={formData.duration}
                  onChangeText={(text) => setFormData({ ...formData, duration: text })}
                  placeholder="期間"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.infoItem}>
                <CreditCard size={20} color="#6b7280" />
                <TextInput
                  style={styles.infoInput}
                  value={formData.budget}
                  onChangeText={(text) => setFormData({ ...formData, budget: text })}
                  placeholder="予算"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    gap: 24,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  infoInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
}); 