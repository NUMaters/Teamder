import React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Code as Code2, 
  Briefcase, 
  MapPin, 
  Github, 
  Twitter, 
  Mail, 
  Globe, 
  CreditCard as Edit3, 
  GraduationCap,
  Award,
  Star,
  Users,
  Calendar,
  Languages,
  BookOpen,
  Building2
} from 'lucide-react-native';
import { ProfileData, Activity, Skill } from '@/types/profile';

type ProfileContentProps = {
  profile: ProfileData;
  isOwnProfile: boolean;
  onEditPress?: () => void;
};

export default function ProfileContent({ profile, isOwnProfile, onEditPress }: ProfileContentProps) {
  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const handleSocialLink = (type: 'github' | 'twitter' | 'website') => {
    let url = '';
    switch (type) {
      case 'github':
        if (profile.githubUsername) {
          url = `https://github.com/${profile.githubUsername}`;
        }
        break;
      case 'twitter':
        if (profile.twitterUsername) {
          url = `https://twitter.com/${profile.twitterUsername}`;
        }
        break;
      case 'website':
        if (profile.website) {
          url = profile.website.startsWith('http') ? profile.website : `https://${profile.website}`;
        }
        break;
    }
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {profile.coverUrl && (
          <Image 
            source={{ uri: profile.coverUrl }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
        <Image 
          source={{ uri: profile.image }} 
          style={styles.profileImage}
          resizeMode="cover"
        />
        
        {isOwnProfile && onEditPress && (
          <View style={[styles.editButtonContainer, Platform.OS === 'ios' ? { top: 80 } : { top: 40 }]}>
            <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
              <Edit3 size={20} color="#fff" />
              <Text style={styles.editButtonText}>編集</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.headerContent}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.title}>{profile.title}</Text>
          
          <View style={styles.basicInfo}>
            {profile.age ? (
              <View style={styles.infoRow}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.infoText}>{profile.age}歳</Text>
              </View>
            ) : null}
            {profile.location ? (
              <View style={styles.infoRow}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.infoText}>{profile.location}</Text>
              </View>
            ) : null}
            {profile.university ? (
              <View style={styles.infoRow}>
                <GraduationCap size={16} color="#6b7280" />
                <Text style={styles.infoText}>{profile.university}</Text>
              </View>
            ) : null}
            {profile.email ? (
              <View style={styles.infoRow}>
                <Mail size={16} color="#6b7280" />
                <Text style={styles.infoText}>{profile.email}</Text>
              </View>
            ) : null}
            {profile.website ? (
              <TouchableOpacity style={styles.infoRow} onPress={() => handleSocialLink('website')}>
                <Globe size={16} color="#6b7280" />
                <Text style={[styles.infoText, styles.link]}>{profile.website}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.socialLinks}>
          {profile.githubUsername ? (
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLink('github')}>
              <Github size={20} color="#1f2937" />
            </TouchableOpacity>
          ) : null}
          {profile.twitterUsername ? (
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLink('twitter')}>
              <Twitter size={20} color="#1f2937" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 自己紹介 */}
      <View style={styles.section}>
        {renderSectionHeader('自己紹介')}
        <Text style={styles.text}>
          {profile.bio && profile.bio.trim() !== '' ? profile.bio : '自己紹介がありません。'}
        </Text>
      </View>

      {/* スキル */}
      <View style={styles.section}>
        {renderSectionHeader('スキル')}
        {profile.skills && profile.skills.length > 0 ? (
          <View style={styles.skillsGrid}>
            {profile.skills.map((skill: Skill, index: number) => (
              <View key={index} style={styles.skillItem}>
                <View style={styles.skillHeader}>
                  <Code2 size={16} color="#6366f1" />
                  <Text style={styles.skillName}>{skill.name}</Text>
                </View>
                <Text style={styles.skillYears}>
                  経験年数: {skill.years}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.text}>スキルが登録されていません。</Text>
        )}
      </View>

      {/* 活動 */}
      {profile.activities && profile.activities.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('活動')}
          <View style={styles.activitiesContainer}>
            {profile.activities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityPeriod}>{activity.period}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                {activity.link && (
                  <TouchableOpacity onPress={() => Linking.openURL(activity.link!)}>
                    <Text style={[styles.activityLink, styles.link]}>{activity.link}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {profile.certifications && profile.certifications.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('資格・認定')}
          <View style={styles.certificationsContainer}>
            {profile.certifications.map((cert: string, index: number) => (
              <View key={index} style={styles.certificationItem}>
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {profile.interests && profile.interests.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('興味のある分野')}
          <View style={styles.interestsContainer}>
            {profile.interests.map((interest: string, index: number) => (
              <View key={index} style={styles.interestItem}>
                <Briefcase size={16} color="#6b7280" />
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const getSkillLevelColor = (level: string) => {
  const colors = {
    上級: '#4f46e5',
    中級: '#059669',
    初級: '#0284c7',
  };
  return colors[level as keyof typeof colors] || '#6b7280';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#fff',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  editButtonContainer: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 12,
  },
  basicInfo: {
    width: '100%',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  link: {
    color: '#6366f1',
    textDecorationLine: 'underline',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    width: '48%',
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  skillYears: {
    fontSize: 12,
    color: '#6b7280',
  },
  activitiesContainer: {
    gap: 16,
  },
  activityItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityPeriod: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  activityLink: {
    fontSize: 14,
    color: '#6366f1',
  },
  certificationsContainer: {
    gap: 12,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
  },
  certificationText: {
    fontSize: 14,
    color: '#1f2937',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  interestText: {
    fontSize: 14,
    color: '#4b5563',
  },
});
