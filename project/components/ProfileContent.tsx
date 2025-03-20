import { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
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
  BookOpen
} from 'lucide-react-native';

type ProfileData = {
  name: string;
  title: string;
  location: string;
  email: string;
  website: string;
  image: string;
  coverUrl?: string;
  bio?: string;
  academic?: {
    university: string;
    faculty: string;
    department: string;
    grade: string;
    researchLab?: string;
    advisor?: string;
    gpa?: string;
  };
  skills: Array<{ name: string; level: string }>;
  interests: string[];
  languages?: Array<{ name: string; level: string }>;
  achievements?: {
    githubContributions?: number;
    projectsCompleted?: number;
    hackathonsWon?: number;
    papers?: number;
  };
  activities?: Array<{
    id: string;
    title: string;
    organization: string;
    period: string;
    description: string;
  }>;
  coursework?: string[];
  certifications?: string[];
  githubUsername?: string;
  twitterUsername?: string;
};

interface ProfileContentProps {
  profileData: ProfileData;
  isOwnProfile: boolean;
  onEdit?: () => void;
}

export default function ProfileContent({ profileData, isOwnProfile, onEdit }: ProfileContentProps) {
  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const handleSocialLink = (type: 'github' | 'twitter' | 'website') => {
    let url = '';
    switch (type) {
      case 'github':
        if (profileData.githubUsername) {
          url = `https://github.com/${profileData.githubUsername}`;
        }
        break;
      case 'twitter':
        if (profileData.twitterUsername) {
          url = `https://twitter.com/${profileData.twitterUsername}`;
        }
        break;
      case 'website':
        if (profileData.website) {
          url = profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`;
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
        {profileData.coverUrl && (
          <Image 
            source={{ uri: profileData.coverUrl }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
        <Image 
          source={{ uri: profileData.image }} 
          style={styles.profileImage}
          resizeMode="cover"
        />
        
        {isOwnProfile && onEdit && (
          <View style={[styles.editButtonContainer, Platform.OS === 'ios' ? { top: 80 } : { top: 40 }]}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Edit3 size={20} color="#fff" />
              <Text style={styles.editButtonText}>編集</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.headerContent}>
          <Text style={styles.name}>{profileData.name}</Text>
          <Text style={styles.title}>{profileData.title}</Text>
          
          <View style={styles.basicInfo}>
            {profileData.location ? (
              <View style={styles.infoRow}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.infoText}>{profileData.location}</Text>
              </View>
            ) : null}
            {profileData.email ? (
              <View style={styles.infoRow}>
                <Mail size={16} color="#6b7280" />
                <Text style={styles.infoText}>{profileData.email}</Text>
              </View>
            ) : null}
            {profileData.website ? (
              <TouchableOpacity style={styles.infoRow} onPress={() => handleSocialLink('website')}>
                <Globe size={16} color="#6b7280" />
                <Text style={[styles.infoText, styles.link]}>{profileData.website}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.socialLinks}>
          {profileData.githubUsername ? (
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLink('github')}>
              <Github size={20} color="#1f2937" />
            </TouchableOpacity>
          ) : null}
          {profileData.twitterUsername ? (
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
          {profileData.bio && profileData.bio.trim() !== '' ? profileData.bio : '自己紹介がありません。'}
        </Text>
      </View>

      {/* 学歴 */}
      <View style={styles.section}>
        {renderSectionHeader('学歴')}
        {profileData.academic ? (
          <View style={styles.academicInfo}>
            <View style={styles.academicRow}>
              <GraduationCap size={16} color="#6366f1" />
              <Text style={styles.academicText}>
                {profileData.academic.university} {profileData.academic.faculty} {profileData.academic.department}
              </Text>
            </View>
            {profileData.academic.grade ? (
              <View style={styles.academicRow}>
                <Calendar size={16} color="#6366f1" />
                <Text style={styles.academicText}>{profileData.academic.grade}</Text>
              </View>
            ) : null}
            {profileData.academic.researchLab ? (
              <View style={styles.academicRow}>
                <BookOpen size={16} color="#6366f1" />
                <Text style={styles.academicText}>
                  {profileData.academic.researchLab}
                  {profileData.academic.advisor ? ` (${profileData.academic.advisor})` : ''}
                </Text>
              </View>
            ) : null}
            {profileData.academic.gpa ? (
              <View style={styles.academicRow}>
                <Star size={16} color="#6366f1" />
                <Text style={styles.academicText}>GPA: {profileData.academic.gpa}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={styles.text}>学歴情報がありません。</Text>
        )}
      </View>

      {/* スキル */}
      <View style={styles.section}>
        {renderSectionHeader('スキル')}
        {profileData.skills && profileData.skills.length > 0 ? (
          <View style={styles.skillsGrid}>
            {profileData.skills.map((skill, index) => {
              let skillData;
              try {
                skillData = typeof skill === 'string' ? JSON.parse(skill) : skill;
              } catch (e) {
                skillData = { name: skill, years: '未設定' };
              }
              return (
                <View key={index} style={styles.skillItem}>
                  <View style={styles.skillHeader}>
                    <Code2 size={16} color="#6366f1" />
                    <Text style={styles.skillName}>{skillData.name}</Text>
                  </View>
                  <Text style={styles.skillYears}>
                    経験年数: {skillData.years}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.text}>スキルが登録されていません。</Text>
        )}
      </View>

      {profileData.activities && profileData.activities.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('活動')}
          <View style={styles.activitiesContainer}>
            {profileData.activities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <Users size={16} color="#6366f1" />
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                </View>
                <Text style={styles.activityOrg}>{activity.organization}</Text>
                <Text style={styles.activityPeriod}>{activity.period}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {profileData.certifications && profileData.certifications.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('資格・認定')}
          <View style={styles.certificationsContainer}>
            {profileData.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationItem}>
                <Award size={16} color="#6366f1" />
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {profileData.interests && profileData.interests.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('興味のある分野')}
          <View style={styles.interestsContainer}>
            {profileData.interests.map((interest, index) => (
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
  academicInfo: {
    gap: 12,
  },
  academicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  academicText: {
    fontSize: 14,
    color: '#1f2937',
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
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  activityOrg: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 4,
  },
  activityPeriod: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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
