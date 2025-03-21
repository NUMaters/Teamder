import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Edit2 } from 'lucide-react-native';

export type Profile = {
  id: string;
  name: string;
  title: string;
  university: string;
  department: string;
  location: string;
  github_username: string;
  twitter_username: string;
  bio: string;
  image_url: string;
  cover_url: string;
  skills: Array<{ name: string; years: string }>;
  interests: string[];
};

interface ProfileCardProps {
  profile?: Profile;
  profileData?: Profile;
  onEdit?: () => void;
}

export default function ProfileCard({ profile, profileData, onEdit }: ProfileCardProps) {
  const displayProfile = profile || profileData;
  if (!displayProfile) return null;

  return (
    <View style={styles.container}>
      <View style={styles.coverImageContainer}>
        {displayProfile.cover_url ? (
          <Image 
            source={{ uri: displayProfile.cover_url }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverImagePlaceholder} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {displayProfile.image_url ? (
              <Image 
                source={{ uri: displayProfile.image_url }} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder} />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{displayProfile.name}</Text>
            <Text style={styles.title}>{displayProfile.title}</Text>
            {onEdit && (
              <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                <Edit2 size={16} color="#6b7280" />
                <Text style={styles.editButtonText}>プロフィールを編集</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学歴</Text>
          <View style={styles.educationContainer}>
            <Text style={styles.educationText}>
              {displayProfile.university} {displayProfile.department}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>スキル</Text>
          <View style={styles.skillsContainer}>
            {displayProfile.skills && displayProfile.skills.length > 0 ? (
              displayProfile.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>
                    {skill.name} ({skill.years})
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>スキルが設定されていません</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>興味のある分野</Text>
          <View style={styles.interestsContainer}>
            {displayProfile.interests && displayProfile.interests.length > 0 ? (
              displayProfile.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>興味のある分野が設定されていません</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自己紹介</Text>
          <Text style={styles.bio}>{displayProfile.bio || '自己紹介が設定されていません'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SNS</Text>
          <View style={styles.socialLinks}>
            {displayProfile.github_username ? (
              <TouchableOpacity style={styles.socialLink}>
                <Text style={styles.socialLinkText}>GitHub: @{displayProfile.github_username}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.emptyText}>GitHubアカウントが設定されていません</Text>
            )}
            {displayProfile.twitter_username ? (
              <TouchableOpacity style={styles.socialLink}>
                <Text style={styles.socialLinkText}>Twitter: @{displayProfile.twitter_username}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.emptyText}>Twitterアカウントが設定されていません</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  coverImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  educationContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
  },
  educationText: {
    fontSize: 14,
    color: '#4b5563',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    color: '#4f46e5',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 14,
    color: '#4b5563',
  },
  bio: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  socialLinks: {
    gap: 8,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
  },
  socialLinkText: {
    fontSize: 14,
    color: '#4b5563',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
}); 