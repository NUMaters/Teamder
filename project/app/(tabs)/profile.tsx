import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import ProfileContent from '@/components/ProfileContent';
import EditProfileModal from '@/components/EditProfileModal';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setProfileData({
          name: profile.name || '',
          title: profile.title || '',
          location: profile.location || '',
          email: profile.email || '',
          website: profile.website || '',
          image: profile.image_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
          coverUrl: profile.cover_url,
          bio: profile.bio || '',
          skills: profile.skills?.map((name: string) => ({ name, level: '中級' })) || [],
          interests: profile.interests || [],
          githubUsername: profile.github_username || '',
          twitterUsername: profile.twitter_username || '',
        });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('エラー', 'プロフィールの取得に失敗しました');
    }
  };

  const handleProfileUpdate = async (updatedData: any) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザー情報が見つかりません');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: updatedData.name,
          title: updatedData.title,
          location: updatedData.location,
          website: updatedData.website,
          image_url: updatedData.imageUrl,
          cover_url: updatedData.coverUrl,
          github_username: updatedData.githubUsername,
          twitter_username: updatedData.twitterUsername,
          interests: updatedData.interests,
          skills: updatedData.skills.map((s: any) => s.name),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      await fetchProfile();
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('エラー', 'プロフィールの更新に失敗しました');
    } finally {
      setLoading(false);
    }
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

  if (!profileData) {
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
          profileData={profileData} 
          isOwnProfile={true} 
          onEdit={() => setIsEditModalVisible(true)} 
        />
      </ScrollView>

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSubmit={handleProfileUpdate}
        initialData={profileData}
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