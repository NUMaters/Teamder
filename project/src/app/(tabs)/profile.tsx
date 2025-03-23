import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileContent from '@/components/ProfileContent';
import EditProfileModal from '@/components/EditProfileModal';

const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;

// 興味のある分野の英語から日本語への変換マップ
const interestTranslations: { [key: string]: string } = {
  'web_development': 'Web開発',
  'mobile_development': 'モバイル開発',
  'game_development': 'ゲーム開発',
  'machine_learning': '機械学習',
  'artificial_intelligence': 'AI',
  'data_science': 'データサイエンス',
  'cloud_computing': 'クラウドコンピューティング',
  'cybersecurity': 'サイバーセキュリティ',
  'blockchain': 'ブロックチェーン',
  'devops': 'DevOps',
  'iot': 'IoT',
  'ar_vr': 'AR/VR',
  'ui_ux': 'UI/UXデザイン',
  'frontend': 'フロントエンド',
  'backend': 'バックエンド',
  'fullstack': 'フルスタック',
  'database': 'データベース',
  'networking': 'ネットワーク',
  'testing': 'テスト',
  'project_management': 'プロジェクトマネジメント'
};

// 英語の興味を日本語に変換する関数
const translateInterest = (interest: string): string => {
  return interestTranslations[interest] || interest;
};

interface Skill {
  name: string;
  years: string;
}

interface Activity {
  id: string;
  title: string;
  period: string;
  description: string;
  link?: string;
}

interface Profile {
  username: string;
  title?: string;
  location?: string;
  email: string;
  website?: string;
  icon_url?: string;
  cover_url?: string;
  bio?: string;
  githubUsername?: string;
  twitterUsername?: string;
  interests: string[];
  skills: Skill[];
  age?: number;
  school?: string;
  activities: Activity[];
}

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found, redirecting to login');
        router.replace('/(auth)/login');
        return;
      }

      console.log('Fetching profile with token:', token);
      const response = await axios.post(
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

      console.log('Profile API Response:', response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          Alert.alert('エラー', '認証エラーが発生しました。再度ログインしてください。');
          await AsyncStorage.removeItem('userToken');
          router.replace('/(auth)/login');
        } else {
          Alert.alert('エラー', 'プロフィールの取得に失敗しました。');
        }
      } else {
        Alert.alert('エラー', 'プロフィールの取得に失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    fetchProfile();
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('エラー', 'ログアウトに失敗しました。');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>プロフィール</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleSignOut}
          disabled={loading}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>
            {loading ? 'ログアウト中...' : 'ログアウト'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {profile ? (
          <>
            <ProfileContent
              profile={{
                name: profile.username || '',
                title: profile.title || '',
                location: profile.location || '',
                email: profile.email || '',
                website: profile.website || '',
                image: profile.icon_url || '',
                coverUrl: profile.cover_url || '',
                bio: profile.bio || '',
                githubUsername: profile.githubUsername || '',
                twitterUsername: profile.twitterUsername || '',
                interests: (profile.interests || []).map(translateInterest),
                skills: Array.isArray(profile.skills) 
                  ? profile.skills.map(skill => ({
                      name: typeof skill === 'string' ? skill : skill.name || '',
                      years: typeof skill === 'string' ? '未設定' : skill.years || '未設定'
                    }))
                  : [],
                age: profile.age?.toString() || '',
                university: profile.school || '',
                activities: profile.activities || [],
                certifications: []
              }}
              isOwnProfile={true}
              onEditPress={() => setIsEditModalVisible(true)}
            />
          </>
        ) : (
          <Text>プロフィールが見つかりません</Text>
        )}
      </ScrollView>

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onUpdate={handleProfileUpdate}
        initialData={{
          name: profile?.username || '',
          title: profile?.title || '',
          university: profile?.school || '',
          location: profile?.location || '',
          githubUsername: profile?.githubUsername || '',
          twitterUsername: profile?.twitterUsername || '',
          bio: profile?.bio || '',
          imageUrl: profile?.icon_url || '',
          coverUrl: profile?.cover_url || '',
          skills: Array.isArray(profile?.skills)
            ? profile.skills.map(skill => ({
                name: typeof skill === 'string' ? skill : skill.name || '',
                years: typeof skill === 'string' ? '未設定' : skill.years || '未設定'
              }))
            : [],
          interests: profile?.interests || [],
          age: profile?.age?.toString() || '',
          activities: profile?.activities || []
        }}
      />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});