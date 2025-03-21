import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProfileContent from '@/components/ProfileContent';

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
  age: number | null;
  activities: {
    id: string;
    title: string;
    period: string;
    description: string;
    link?: string;
  }[] | null;
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            title,
            location,
            email,
            website,
            image_url,
            cover_url,
            bio,
            university,
            github_username,
            twitter_username,
            interests,
            skills,
            age,
            activities
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        console.log('Fetched profile data:', data); // デバッグ用
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('プロフィールの取得に失敗しました');
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          activities: Array.isArray(profile.activities) ? profile.activities.map(activity => ({
            id: activity.id || String(Date.now()),
            title: activity.title || '',
            period: activity.period || '',
            description: activity.description || '',
            link: activity.link
          })) : [],
          certifications: []
        }}
        isOwnProfile={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
  },
});