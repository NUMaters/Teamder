import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { createApiRequest, removeToken } from '@/lib/api-client';
import { Profile } from '@/types/profile';
import ProfileContent from '@/components/ProfileContent';
import EditProfileModal from '@/components/EditProfileModal';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await createApiRequest('/profile', 'GET');
      if (response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('エラー', 'プロフィールの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    fetchProfile(); // プロフィールを再取得
  };

  const handleSignOut = async () => {
    try {
      await removeToken();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('エラー', 'ログアウトに失敗しました。');
    }
  };

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
                image: profile.image || '',
                coverUrl: profile.coverUrl || '',
                bio: profile.bio || '',
                githubUsername: profile.githubUsername || '',
                twitterUsername: profile.twitterUsername || '',
                interests: profile.interests || [],
                skills: profile.skills?.map(skill => ({
                  name: skill.name,
                  years: skill.years
                })) || [],
                age: profile.age?.toString() || '',
                university: profile.university || '',
                activities: profile.activities || [],
                certifications: []
              }}
              isOwnProfile={true}
              onEditPress={() => setIsEditModalVisible(true)}
            />
            <Link href="/profile/edit" asChild>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>プロフィール編集</Text>
              </TouchableOpacity>
            </Link>
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
          university: profile?.university || '',
          location: profile?.location || '',
          githubUsername: profile?.githubUsername || '',
          twitterUsername: profile?.twitterUsername || '',
          bio: profile?.bio || '',
          imageUrl: profile?.image || '',
          coverUrl: profile?.coverUrl || '',
          skills: profile?.skills || [],
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
  signOutButton: {
    backgroundColor: '#FF3B30',
  },
});