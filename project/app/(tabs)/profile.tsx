import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import ProfileContent from '@/components/ProfileContent';
import EditProfileModal from '@/components/EditProfileModal';

type Profile = {
  id: string;
  name: string | null;
  title: string | null;
  location: string | null;
  email: string | null;
  website: string | null;
  image_url: string | null;
  cover_url: string | null;
  bio: string | null;
  university: string | null;
  github_username: string | null;
  twitter_username: string | null;
  interests: string[] | null;
  skills: { name: string; years: string }[] | null;
  created_at: string;
  updated_at: string;
  age: number | null;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザー情報が見つかりません');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('プロフィール取得エラー:', error);
        // エラーが発生した場合、ログアウトを実行
        await supabase.auth.signOut();
        router.replace('/(auth)/login');
        return;
      }

      if (!data) {
        throw new Error('プロフィールが見つかりません');
      }

      setProfile(data);
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      // エラーが発生した場合、ログアウトを実行
      await supabase.auth.signOut();
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = () => {
    fetchProfile(); // プロフィールを再取得
  };

  const handleLogout = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>プロフィール</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>
            {loading ? 'ログアウト中...' : 'ログアウト'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <ProfileContent
          profile={{
            name: profile.name || '',
            title: profile.title || '',
            location: profile.location || '',
            email: profile.email || '',
            website: profile.website || '',
            image: profile.image_url || '',
            coverUrl: profile.cover_url || '',
            bio: profile.bio || '',
            githubUsername: profile.github_username || '',
            twitterUsername: profile.twitter_username || '',
            interests: profile.interests || [],
            skills: profile.skills?.map(skill => ({
              name: skill.name,
              years: skill.years
            })) || [],
            age: profile.age?.toString() || '',
            university: profile.university || '',
            activities: [],
            certifications: []
          }}
          isOwnProfile={true}
          onEditPress={() => setIsEditModalVisible(true)}
        />
      </ScrollView>

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onUpdate={handleProfileUpdate}
        initialData={{
          name: profile.name || '',
          title: profile.title || '',
          university: profile.university || '',
          department: profile.university || '',
          location: profile.location || '',
          githubUsername: profile.github_username || '',
          twitterUsername: profile.twitter_username || '',
          bio: profile.bio || '',
          imageUrl: profile.image_url || '',
          coverUrl: profile.cover_url || '',
          skills: profile.skills || [],
          interests: profile.interests || [],
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
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
});