import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ExternalLink, Clock, Users, MapPin, CreditCard, Heart } from 'lucide-react-native';
import { useState } from 'react';
import ProjectLikesModal from '@/components/ProjectLikesModal';

type ProjectStatus = '募集中' | '一時停止中';

// In a real app, this would come from your backend
const MY_PROJECTS = [
  {
    id: '1',
    title: 'AIチャットボットプラットフォーム開発',
    company: 'テックスタートアップ株式会社',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400',
    location: 'リモート可',
    description: '最新のAI技術を活用したチャットボットプラットフォームの開発。自然言語処理とマルチモーダルAIの統合が主なチャレンジです。',
    skills: ['Python', 'TensorFlow', 'React', 'Node.js', 'AWS'],
    teamSize: '4-6名',
    duration: '6ヶ月',
    budget: '〜100万円/月',
    type: 'スタートアップ',
    status: '募集中' as ProjectStatus,
    applicants: 12,
    views: 156,
    createdAt: '2024-02-15T10:00:00Z',
    likes: 7, // Combined likes and superlikes
  },
  {
    id: '2',
    title: 'Web3ウォレットアプリケーション開発',
    company: 'ブロックチェーンラボ株式会社',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    location: 'ハイブリッド',
    description: 'Web3対応のウォレットアプリケーション開発。複数のブロックチェーンに対応し、NFTの表示や取引機能を実装します。',
    skills: ['React Native', 'TypeScript', 'Solidity', 'Web3.js'],
    teamSize: '3-4名',
    duration: '4ヶ月',
    budget: '〜90万円/月',
    type: '自社開発',
    status: '一時停止中' as ProjectStatus,
    applicants: 8,
    views: 98,
    createdAt: '2024-02-10T15:30:00Z',
    likes: 4, // Combined likes and superlikes
  },
];

export default function ManageProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState(MY_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleViewDetails = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleViewLikes = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsLikesModalVisible(true);
  };

  const handleStatusChange = (projectId: string, newStatus: ProjectStatus) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, status: newStatus } : project
    ));
    setShowStatusMenu(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>プロジェクト管理</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/')}>
          <Text style={styles.createButtonText}>新規作成</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {projects.map((project) => (
          <View key={project.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <Image source={{ uri: project.image }} style={styles.projectImage} />
              <View style={styles.projectHeaderContent}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.companyName}>{project.company}</Text>
                <TouchableOpacity
                  style={[
                    styles.statusBadge,
                    project.status === '募集中' ? styles.statusActive : styles.statusPaused
                  ]}
                  onPress={() => setShowStatusMenu(project.id)}>
                  <Text style={[
                    styles.statusText,
                    project.status === '募集中' ? styles.statusTextActive : styles.statusTextPaused
                  ]}>
                    {project.status}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showStatusMenu === project.id && (
              <View style={styles.statusMenu}>
                <TouchableOpacity
                  style={styles.statusMenuItem}
                  onPress={() => handleStatusChange(project.id, '募集中')}>
                  <Text style={[
                    styles.statusMenuText,
                    project.status === '募集中' && styles.statusMenuTextActive
                  ]}>
                    募集中
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusMenuItem}
                  onPress={() => handleStatusChange(project.id, '一時停止中')}>
                  <Text style={[
                    styles.statusMenuText,
                    project.status === '一時停止中' && styles.statusMenuTextActive
                  ]}>
                    一時停止中
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.projectStats}>
              <View style={styles.statItem}>
                <Users size={16} color="#6b7280" />
                <Text style={styles.statText}>{project.teamSize}</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={16} color="#6b7280" />
                <Text style={styles.statText}>{project.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.statText}>{project.location}</Text>
              </View>
              <View style={styles.statItem}>
                <CreditCard size={16} color="#6b7280" />
                <Text style={styles.statText}>{project.budget}</Text>
              </View>
            </View>

            <View style={styles.skillsContainer}>
              {project.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>

            <View style={styles.projectMetrics}>
              <Text style={styles.metricText}>応募者数: {project.applicants}人</Text>
              <Text style={styles.metricText}>閲覧数: {project.views}回</Text>
              <Text style={styles.metricText}>作成日: {formatDate(project.createdAt)}</Text>
            </View>

            <View style={styles.likesContainer}>
              <TouchableOpacity
                style={styles.likesButton}
                onPress={() => handleViewLikes(project.id)}>
                <Heart size={16} color="#ec4899" />
                <Text style={styles.likesText}>
                  いいね {project.likes}件
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleViewDetails(project.id)}>
              <ExternalLink size={20} color="#6366f1" />
              <Text style={styles.viewButtonText}>詳細を見る</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {selectedProjectId && (
        <ProjectLikesModal
          isVisible={isLikesModalVisible}
          onClose={() => {
            setIsLikesModalVisible(false);
            setSelectedProjectId(null);
          }}
          projectId={selectedProjectId}
        />
      )}
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
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  projectImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  projectHeaderContent: {
    flex: 1,
    marginLeft: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusPaused: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextPaused: {
    color: '#dc2626',
  },
  statusMenu: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  statusMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  statusMenuText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusMenuTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  projectStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '500',
  },
  projectMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 16,
  },
  metricText: {
    fontSize: 12,
    color: '#6b7280',
  },
  likesContainer: {
    marginBottom: 16,
  },
  likesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fce7f3',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  likesText: {
    fontSize: 14,
    color: '#ec4899',
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  viewButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
});