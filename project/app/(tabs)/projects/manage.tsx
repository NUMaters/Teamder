import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ExternalLink, Clock, Users, MapPin, CreditCard, Heart } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import ProjectLikesModal from '@/components/ProjectLikesModal';
import { supabase } from '@/lib/supabase';

type ProjectStatus = 'active' | 'paused' | 'completed';

type Project = {
  id: string;
  title: string;
  university: string;
  image_url: string;
  location: string;
  description: string;
  team_size: string;
  duration: string;
  budget: string;
  status: ProjectStatus;
  created_at: string;
  user_id: string;
};

export default function ManageProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }

      console.log('Current user:', user);

      // まず全てのプロジェクトを取得してデバッグ
      const { data: allProjects, error: allProjectsError } = await supabase
        .from('projects')
        .select('*');

      console.log('All projects:', allProjects); // 全プロジェクトをログ出力

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          university,
          image_url,
          location,
          description,
          team_size,
          duration,
          budget,
          status,
          created_at,
          user_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched projects:', data);
      console.log('Query parameters:', { user_id: user.id });

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('エラー', 'プロジェクトの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

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

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, status: newStatus } : project
      ));
      setShowStatusMenu(null);
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const getStatusDisplay = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return '募集中';
      case 'paused':
        return '停止中';
      case 'completed':
        return '完了';
      default:
        return status;
    }
  };

  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'paused':
        return styles.statusPaused;
      case 'completed':
        return styles.statusCompleted;
      default:
        return {};
    }
  };

  const getStatusTextStyle = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return styles.statusTextActive;
      case 'paused':
        return styles.statusTextPaused;
      case 'completed':
        return styles.statusTextCompleted;
      default:
        return {};
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
        <Text style={styles.headerTitle}>プロジェクト管理</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/projects/create')}>
          <Text style={styles.createButtonText}>新規作成</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>作成したプロジェクトはありません</Text>
            <TouchableOpacity
              style={styles.createProjectButton}
              onPress={() => router.push('/projects/create')}>
              <Text style={styles.createProjectButtonText}>プロジェクトを作成する</Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map((project: Project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Image 
                  source={{ 
                    uri: project.image_url || 'https://via.placeholder.com/80'
                  }} 
                  style={styles.projectImage} 
                />
                <View style={styles.projectHeaderContent}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <Text style={styles.universityName}>{project.university}</Text>
                  <TouchableOpacity
                    style={[styles.statusBadge, getStatusStyle(project.status)]}
                    onPress={() => setShowStatusMenu(project.id)}>
                    <Text style={[styles.statusText, getStatusTextStyle(project.status)]}>
                      {getStatusDisplay(project.status)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showStatusMenu === project.id && (
                <View style={styles.statusMenu}>
                  <TouchableOpacity
                    style={styles.statusMenuItem}
                    onPress={() => handleStatusChange(project.id, 'active')}>
                    <Text style={[
                      styles.statusMenuText,
                      project.status === 'active' && styles.statusMenuTextActive
                    ]}>
                      募集中
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.statusMenuItem}
                    onPress={() => handleStatusChange(project.id, 'paused')}>
                    <Text style={[
                      styles.statusMenuText,
                      project.status === 'paused' && styles.statusMenuTextActive
                    ]}>
                      停止中
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.statusMenuItem}
                    onPress={() => handleStatusChange(project.id, 'completed')}>
                    <Text style={[
                      styles.statusMenuText,
                      project.status === 'completed' && styles.statusMenuTextActive
                    ]}>
                      完了
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.projectStats}>
                <View style={styles.statItem}>
                  <Users size={16} color="#6b7280" />
                  <Text style={styles.statText}>{project.team_size}</Text>
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

              <View style={styles.projectMetrics}>
                <Text style={styles.metricText}>作成日: {formatDate(project.created_at)}</Text>
              </View>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewDetails(project.id)}>
                <ExternalLink size={20} color="#6366f1" />
                <Text style={styles.viewButtonText}>詳細を見る</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  createProjectButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  createProjectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  universityName: {
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
  statusCompleted: {
    backgroundColor: '#e5e7eb',
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
  statusTextCompleted: {
    color: '#4b5563',
  },
  statusMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusMenuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    gap: 12,
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
  projectMetrics: {
    marginBottom: 16,
  },
  metricText: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
  },
  viewButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
});