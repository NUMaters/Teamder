import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, TextInput } from 'react-native';
import { X, Mail, Lock, User, Briefcase, MapPin, GraduationCap, Code2, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

const prefectures = [
  '北海道あ', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  locationOption: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#6366f1',
  },
  locationOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  locationOptionTextActive: {
    color: '#6366f1',
  },
  selectedLocation: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedLocationText: {
    fontSize: 15,
    color: '#1f2937',
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
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !title || !university || !department || (!isOnline && !location)) {
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name,
            title,
            university,
            department,
            location: isOnline ? 'オンライン' : location,
          })
          .eq('id', user.id);

        if (error) throw error;

        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>プロフィール設定</Text>
        <Text style={styles.headerSubtitle}>あなたの情報を入力してください</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本情報</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="名前"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.inputContainer}>
            <Briefcase size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="タイトル（例：フロントエンドエンジニア）"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学歴</Text>
          <View style={styles.inputContainer}>
            <GraduationCap size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="大学名"
              value={university}
              onChangeText={setUniversity}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.inputContainer}>
            <GraduationCap size={20} color="#6b7280" />
            <TextInput
              style={styles.input}
              placeholder="学部・学科"
              value={department}
              onChangeText={setDepartment}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>場所</Text>
          <View style={styles.locationContainer}>
            <TouchableOpacity
              style={[
                styles.locationOption,
                isOnline && styles.locationOptionActive
              ]}
              onPress={() => {
                setIsOnline(true);
                setLocation('オンライン');
              }}>
              <Text style={[
                styles.locationOptionText,
                isOnline && styles.locationOptionTextActive
              ]}>オンライン</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.locationOption,
                !isOnline && styles.locationOptionActive
              ]}
              onPress={() => {
                setIsOnline(false);
                setShowLocationPicker(true);
              }}>
              <Text style={[
                styles.locationOptionText,
                !isOnline && styles.locationOptionTextActive
              ]}>オフライン</Text>
            </TouchableOpacity>
          </View>

          {!isOnline && (
            <View style={styles.selectedLocation}>
              <Text style={styles.selectedLocationText}>
                {location || '都道府県を選択してください'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? '保存中...' : '保存する'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showLocationPicker && (
        <Modal
          visible={showLocationPicker}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>都道府県を選択</Text>
                <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.prefectureList}>
                {prefectures.map((prefecture) => (
                  <TouchableOpacity
                    key={prefecture}
                    style={[
                      styles.prefectureItem,
                      location === prefecture && styles.prefectureItemActive
                    ]}
                    onPress={() => {
                      setLocation(prefecture);
                      setShowLocationPicker(false);
                    }}>
                    <Text style={[
                      styles.prefectureText,
                      location === prefecture && styles.prefectureTextActive
                    ]}>{prefecture}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
} 