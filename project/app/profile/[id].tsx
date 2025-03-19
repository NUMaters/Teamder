import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import ProfileContent from '@/components/ProfileContent';

// This would typically come from an API
const DUMMY_PROFILES = {
  '1': {
    name: '田中 美咲',
    title: '情報工学専攻',
    location: '東京都',
    email: 'misaki.tanaka@university.ac.jp',
    website: 'https://misaki-tanaka.dev',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'AIと機械学習を専攻している3年生です。特に自然言語処理に興味があり、現在は感情分析の研究を行っています。',
    academic: {
      university: '東京理科大学',
      faculty: '工学部',
      department: '情報工学科',
      grade: '3年生',
      researchLab: 'AI研究室',
      advisor: '山本 教授',
      gpa: '3.9',
    },
    skills: [
      { name: 'Python', level: '上級' },
      { name: 'TensorFlow', level: '中級' },
      { name: 'NLP', level: '中級' },
      { name: 'React', level: '初級' },
    ],
    interests: ['AI', '機械学習', 'ロボティクス', 'Web開発'],
    languages: [
      { name: '日本語', level: 'ネイティブ' },
      { name: '英語', level: 'TOEIC 850' },
    ],
    achievements: {
      githubContributions: 234,
      projectsCompleted: 12,
      hackathonsWon: 2,
      papers: 1,
    },
    activities: [
      {
        id: '1',
        title: 'AI研究会代表',
        organization: 'AITech',
        period: '2023年4月 - 現在',
        description: 'AIに関する勉強会の企画・運営、研究発表会の開催',
      }
    ],
    coursework: [
      '機械学習特論',
      'データマイニング',
      '統計学',
      'アルゴリズム論',
      'プログラミング言語理論',
    ],
    certifications: [
      'JDLA Deep Learning for GENERAL 2023#3',
      'Python3 エンジニア認定基礎試験',
      'G検定',
    ],
  },
  '2': {
    name: '佐藤 健一',
    title: '情報科学専攻',
    location: '大阪府',
    email: 'kenichi.sato@university.ac.jp',
    website: 'https://kenichi-sato.dev',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'データベースとバックエンド開発に情熱を持つ修士1年生です。現在は分散データベースの研究に取り組んでいます。',
    academic: {
      university: '大阪工業大学',
      faculty: '情報科学部',
      department: '情報科学科',
      grade: 'M1',
      researchLab: 'データベースシステム研究室',
      advisor: '田中 教授',
      gpa: '3.7',
    },
    skills: [
      { name: 'Go', level: '上級' },
      { name: 'PostgreSQL', level: '上級' },
      { name: 'Docker', level: '中級' },
      { name: 'Kubernetes', level: '中級' },
    ],
    interests: ['分散システム', 'データベース', 'マイクロサービス', 'DevOps'],
    languages: [
      { name: '日本語', level: 'ネイティブ' },
      { name: '英語', level: 'TOEIC 780' },
    ],
    achievements: {
      githubContributions: 567,
      projectsCompleted: 15,
      hackathonsWon: 1,
      papers: 2,
    },
    activities: [
      {
        id: '1',
        title: 'OSS開発者',
        organization: 'GitHub',
        period: '2022年 - 現在',
        description: 'データベース関連のOSSプロジェクトにコントリビュート',
      }
    ],
    coursework: [
      'データベース特論',
      '分散システム',
      'ソフトウェアアーキテクチャ',
      'セキュリティ工学',
      'クラウドコンピューティング',
    ],
    certifications: [
      'データベーススペシャリスト',
      'AWS Solutions Architect Associate',
      'Certified Kubernetes Administrator',
    ],
  },
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const [profileData, setProfileData] = useState(DUMMY_PROFILES[id as keyof typeof DUMMY_PROFILES]);

  // In a real app, you would fetch the profile data here
  useEffect(() => {
    // Simulate API call
    setProfileData(DUMMY_PROFILES[id as keyof typeof DUMMY_PROFILES]);
  }, [id]);

  if (!profileData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>プロフィールが見つかりません</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ProfileContent profileData={profileData} isOwnProfile={false} />
    </ScrollView>
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