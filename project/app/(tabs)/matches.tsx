import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import { ThumbsUp, X, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ProfileModal from '@/components/ProfileModal';
import ProjectModal from '@/components/ProjectModal';

type InteractionType = 'like' | 'superlike' | 'skip';
type Category = 'all' | 'engineers' | 'projects';

type Engineer = {
  id: string;
  name: string;
  title: string;
  image: string;
  matchTime: string;
  online: boolean;
  skills: string[];
  type: 'engineer';
  interaction: InteractionType;
};

type Project = {
  id: string;
  title: string;
  company: string;
  image: string;
  matchTime: string;
  budget: string;
  skills: string[];
  type: 'project';
  interaction: InteractionType;
};

type Match = Engineer | Project;

const DUMMY_MATCHES: Match[] = [
  {
    id: '1',
    name: '田中 美咲',
    title: 'フルスタックエンジニア',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    matchTime: '2時間前',
    online: true,
    skills: ['React', 'Node.js', 'TypeScript'],
    type: 'engineer',
    interaction: 'superlike',
  },
  {
    id: '2',
    title: 'AIチャットボットプラットフォーム',
    company: 'テックスタートアップ株式会社',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400',
    matchTime: '1時間前',
    budget: '〜100万円/月',
    skills: ['Python', 'TensorFlow', 'FastAPI'],
    type: 'project',
    interaction: 'like',
  },
  {
    id: '3',
    name: '佐藤 健一',
    title: 'バックエンドエンジニア',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    matchTime: '1日前',
    online: false,
    skills: ['Go', 'Python', 'Kubernetes'],
    type: 'engineer',
    interaction: 'skip',
  },
  {
    id: '4',
    title: 'フィンテックアプリ開発',
    company: 'フィンテックラボ株式会社',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    matchTime: '2日前',
    budget: '〜80万円/月',
    skills: ['React Native', 'Node.js', 'Firebase'],
    type: 'project',
    interaction: 'like',
  },
  {
    id: '5',
    name: 'Emily Chen',
    title: 'フロントエンドエンジニア',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    matchTime: '3日前',
    online: true,
    skills: ['React', 'Vue.js', 'WebGL'],
    type: 'engineer',
    interaction: 'superlike',
  },
];

export default function MatchesScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('all');
  const [interactionFilter, setInteractionFilter] = useState<InteractionType | 'all'>('all');
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);

  const handleEngineerPress = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    setIsProfileModalVisible(true);
  };

  const handleProjectPress = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalVisible(true);
  };

  const filteredMatches = DUMMY_MATCHES.filter((match) => {
    const categoryMatch =
      category === 'all' ? true : category === 'engineers' ? match.type === 'engineer' : match.type === 'project';
    const interactionMatch = interactionFilter === 'all' ? true : match.interaction === interactionFilter;
    return categoryMatch && interactionMatch;
  });

  const renderInteractionBadge = (interaction: InteractionType) => {
    switch (interaction) {
      case 'like':
        return (
          <View style={[styles.interactionBadge, styles.likeBadge]}>
            <ThumbsUp size={12} color="#fff" />
          </View>
        );
      case 'superlike':
        return (
          <View style={[styles.interactionBadge, styles.superlikeBadge]}>
            <Star size={12} color="#fff" />
          </View>
        );
      case 'skip':
        return (
          <View style={[styles.interactionBadge, styles.skipBadge]}>
            <X size={12} color="#fff" />
          </View>
        );
    }
  };

  const renderMatch = ({ item }: { item: Match }) => {
    if (item.type === 'engineer') {
      return (
        <TouchableOpacity 
          style={styles.matchCard}
          onPress={() => handleEngineerPress(item)}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.image} />
            {item.online && <View style={styles.onlineIndicator} />}
            {renderInteractionBadge(item.interaction)}
          </View>
          <View style={styles.matchInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.skillsContainer}>
              {item.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.matchTime}>{item.matchTime}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity 
          style={styles.matchCard}
          onPress={() => handleProjectPress(item)}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.projectImage} />
            {renderInteractionBadge(item.interaction)}
          </View>
          <View style={styles.matchInfo}>
            <Text style={styles.projectTitle}>{item.title}</Text>
            <Text style={styles.company}>{item.company}</Text>
            <View style={styles.skillsContainer}>
              {item.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
            <View style={styles.projectFooter}>
              <Text style={styles.matchTime}>{item.matchTime}</Text>
              <Text style={styles.budget}>{item.budget}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>マッチング</Text>

      <View style={styles.filters}>
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            style={[styles.categoryButton, category === 'all' && styles.categoryButtonActive]}
            onPress={() => setCategory('all')}>
            <Text style={[styles.categoryText, category === 'all' && styles.categoryTextActive]}>
              すべて
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, category === 'engineers' && styles.categoryButtonActive]}
            onPress={() => setCategory('engineers')}>
            <Text style={[styles.categoryText, category === 'engineers' && styles.categoryTextActive]}>
              エンジニア
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, category === 'projects' && styles.categoryButtonActive]}
            onPress={() => setCategory('projects')}>
            <Text style={[styles.categoryText, category === 'projects' && styles.categoryTextActive]}>
              プロジェクト
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.interactionContainer}>
          <TouchableOpacity
            style={[styles.interactionButton, interactionFilter === 'all' && styles.interactionButtonActive]}
            onPress={() => setInteractionFilter('all')}>
            <Text style={[styles.interactionText, interactionFilter === 'all' && styles.interactionTextActive]}>
              すべて
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.interactionButton, interactionFilter === 'superlike' && styles.interactionButtonActive]}
            onPress={() => setInteractionFilter('superlike')}>
            <Star size={16} color={interactionFilter === 'superlike' ? '#fff' : '#6366f1'} />
            <Text style={[styles.interactionText, interactionFilter === 'superlike' && styles.interactionTextActive]}>
              スーパーいいね
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.interactionButton, interactionFilter === 'like' && styles.interactionButtonActive]}
            onPress={() => setInteractionFilter('like')}>
            <ThumbsUp size={16} color={interactionFilter === 'like' ? '#fff' : '#4fcc94'} />
            <Text style={[styles.interactionText, interactionFilter === 'like' && styles.interactionTextActive]}>
              いいね
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.interactionButton, interactionFilter === 'skip' && styles.interactionButtonActive]}
            onPress={() => setInteractionFilter('skip')}>
            <X size={16} color={interactionFilter === 'skip' ? '#fff' : '#ff4f6b'} />
            <Text style={[styles.interactionText, interactionFilter === 'skip' && styles.interactionTextActive]}>
              スキップ
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredMatches}
        renderItem={renderMatch}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {selectedEngineer && (
        <ProfileModal
          isVisible={isProfileModalVisible}
          onClose={() => {
            setIsProfileModalVisible(false);
            setSelectedEngineer(null);
          }}
          profileData={{
            name: selectedEngineer.name,
            title: selectedEngineer.title,
            location: '東京都',
            email: 'example@email.com',
            website: 'https://example.com',
            image: selectedEngineer.image,
            bio: '詳細なプロフィール情報',
            academic: {
              university: '東京大学',
              faculty: '工学部',
              department: '情報工学科',
              grade: '4年生',
              researchLab: 'AI研究室',
              advisor: '山田教授',
              gpa: '3.8',
            },
            skills: selectedEngineer.skills.map(name => ({ name, level: '中級' })),
            interests: ['AI', '機械学習', 'Web開発'],
            languages: [
              { name: '日本語', level: 'ネイティブ' },
              { name: '英語', level: 'ビジネスレベル' }
            ],
            achievements: {
              githubContributions: 100,
              projectsCompleted: 5,
              hackathonsWon: 1,
              papers: 0
            },
            activities: [
              {
                id: '1',
                title: 'プログラミングサークル',
                organization: 'Tech Club',
                period: '2023年4月 - 現在',
                description: '週1回の勉強会を企画・運営'
              }
            ],
            coursework: [
              'プログラミング基礎',
              'アルゴリズムとデータ構造',
              'データベース'
            ],
            certifications: [
              '基本情報技術者',
              'AWS Certified Cloud Practitioner'
            ]
          }}
          isOwnProfile={false}
        />
      )}

      {selectedProject && (
        <ProjectModal
          isVisible={isProjectModalVisible}
          onClose={() => {
            setIsProjectModalVisible(false);
            setSelectedProject(null);
          }}
          project={{
            id: selectedProject.id,
            title: selectedProject.title,
            company: selectedProject.company,
            image: selectedProject.image,
            location: '東京都',
            description: '詳細なプロジェクト情報',
            skills: selectedProject.skills,
            teamSize: '4-6名',
            duration: '6ヶ月',
            budget: selectedProject.budget,
            type: 'フルタイム'
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  filters: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#fff',
  },
  interactionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  interactionButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  interactionText: {
    fontSize: 12,
    color: '#6b7280',
  },
  interactionTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  projectImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4fcc94',
    borderWidth: 2,
    borderColor: '#fff',
  },
  interactionBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  likeBadge: {
    backgroundColor: '#4fcc94',
  },
  superlikeBadge: {
    backgroundColor: '#6366f1',
  },
  skipBadge: {
    backgroundColor: '#ff4f6b',
  },
  matchInfo: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    color: '#4f46e5',
    fontSize: 12,
  },
  matchTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  budget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
});