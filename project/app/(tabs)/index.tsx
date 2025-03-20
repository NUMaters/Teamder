import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Platform, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Code as Code2, Briefcase, MapPin, Rocket, Users, Building2, CircleUser as UserCircle2, Plus, Calendar, Clock, CreditCard, SwitchCamera, RefreshCw, Heart, Star, Settings, ListTodo, RotateCcw, GraduationCap, Github, Twitter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { withSpring, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import ProfileModal from '@/components/ProfileModal';
import ProjectModal from '@/components/ProjectModal';
import CreateProjectModal from '@/components/CreateProjectModal';
import type { ProjectFormData } from '@/components/CreateProjectModal';
import { supabase } from '@/lib/supabase';

type Category = 'engineers' | 'projects';

type Like = {
  userId: string;
};

type Profile = {
  id: string;
  name: string;
  title: string;
  location: string;
  email: string;
  website: string;
  image_url: string;
  cover_url: string;
  bio: string;
  school: string;
  github_username: string | null;
  twitter_username: string | null;
  interests: string[];
  skills: string[];
  age: number;
  created_at: string;
  updated_at: string;
  likes?: Like[];
};

type Project = {
  id: string;
  title: string;
  school: string;
  image: string;
  location: string;
  description: string;
  skills: string[];
  teamSize: string;
  duration: string;
  budget: string;
  type: string;
  likes: Like[];
  company: string;
};

const CURRENT_USER_ID = 'current-user';

const DUMMY_DEVELOPERS = [
  {
    id: '1',
    name: '田中 美咲',
    age: 27,
    title: 'フルスタックエンジニア',
    location: '東京都',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'フルスタックエンジニアとして5年の経験があります。主にReactとNode.jsを使用したWeb開発を得意としています。',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
    experience: '5年',
    education: '東京工科大学 情報工学科',
    company: 'テックスタートアップ株式会社',
    likes: [
      { userId: 'user-2', type: 'superlike' },
      { userId: CURRENT_USER_ID, type: 'like' },
    ],
  },
  {
    id: '2',
    name: '佐藤 健一',
    age: 25,
    title: 'バックエンドエンジニア',
    location: '大阪府',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'バックエンドエンジニアとして3年の経験があります。GoとPythonを使用したマイクロサービスの開発を担当しています。',
    skills: ['Go', 'Python', 'Docker', 'Kubernetes', 'PostgreSQL'],
    experience: '3年',
    education: '大阪工業大学 情報科学科',
    company: 'フィンテックラボ株式会社',
    likes: [],
  },
];

const DUMMY_PROJECTS = [
  {
    id: '1',
    title: 'AIチャットボットプラットフォーム開発',
    school: 'テックスタートアップ株式会社',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400',
    location: 'リモート可',
    description: '最新のAI技術を活用したチャットボットプラットフォームの開発。自然言語処理とマルチモーダルAIの統合が主なチャレンジです。',
    skills: ['Python', 'TensorFlow', 'React', 'Node.js', 'AWS'],
    teamSize: '4-6名',
    duration: '6ヶ月',
    budget: '〜100万円/月',
    type: 'スタートアップ',
    likes: [{ userId: CURRENT_USER_ID, type: 'superlike' }],
    company: 'テックスタートアップ株式会社',
  },
  {
    id: '2',
    title: 'フィンテックアプリのリニューアル',
    school: 'フィンテックラボ株式会社',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    location: 'ハイブリッド',
    description: '既存の資産管理アプリのUIリニューアルとパフォーマンス改善プロジェクト。最新のフロントエンド技術でのリプレイスを予定しています。',
    skills: ['React Native', 'TypeScript', 'GraphQL', 'Firebase'],
    teamSize: '3-4名',
    duration: '4ヶ月',
    budget: '〜80万円/月',
    type: '自社開発',
    likes: [],
    company: 'フィンテックラボ株式会社',
  },
];

const WINDOW_HEIGHT = Dimensions.get('window').height;
const CARD_VERTICAL_MARGIN = 180;
const CARD_HEIGHT = WINDOW_HEIGHT - CARD_VERTICAL_MARGIN;

function DiscoverScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('engineers');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedProject, setSelectedProject] = useState<typeof DUMMY_PROJECTS[0] | null>(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [isCreateProjectModalVisible, setIsCreateProjectModalVisible] = useState(false);
  const [showRecyclePrompt, setShowRecyclePrompt] = useState(false);
  const swiperRef = useRef(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const bgOpacity = useSharedValue(0);
  const swipeDirection = useSharedValue<'left' | 'right' | 'top' | null>(null);

  const animatedBackground = useAnimatedStyle(() => {
    let backgroundColor = 'transparent';
    if (swipeDirection.value === 'left') {
      backgroundColor = '#fee2e2';
    } else if (swipeDirection.value === 'right') {
      backgroundColor = '#dcfce7';
    } else if (swipeDirection.value === 'top') {
      backgroundColor = '#e0e7ff';
    }

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor,
      opacity: bgOpacity.value,
    };
  });

  const handleSwipeFeedback = (direction: 'left' | 'right' | 'top') => {
    swipeDirection.value = direction;
    bgOpacity.value = withSpring(0.6, { damping: 12 });
    
    setTimeout(() => {
      bgOpacity.value = withTiming(0, { duration: 300 });
      swipeDirection.value = null;
    }, 300);
  };

  const handleRefresh = () => {
    if (swiperRef.current) {
      // @ts-ignore
      swiperRef.current.jumpToCardIndex(0);
      setShowRecyclePrompt(false);
    }
  };

  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsProfileModalVisible(true);
  };

  const handleViewProject = (project: typeof DUMMY_PROJECTS[0]) => {
    setSelectedProject(project);
    setIsProjectModalVisible(true);
  };

  const handleAllCardsEnd = () => {
    setShowRecyclePrompt(true);
    Alert.alert(
      'すべてのカードを表示しました',
      'もう一度最初から表示しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '最初から',
          onPress: () => {
            if (swiperRef.current) {
              // @ts-ignore
              swiperRef.current.jumpToCardIndex(0);
              setShowRecyclePrompt(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderLikeIndicator = (likes: Like[] = []) => {
    const currentUserLike = likes.find(like => like.userId === CURRENT_USER_ID);
    const otherLikes = likes.filter(like => like.userId !== CURRENT_USER_ID);
    
    if (currentUserLike) {
      return (
        <View style={styles.likeIndicator}>
          <Heart size={16} color="#ffffff" fill="#ffffff" />
          <Text style={styles.likeIndicatorText}>
            いいね済み
          </Text>
        </View>
      );
    }

    if (otherLikes.length > 0) {
      return (
        <View style={styles.likeIndicator}>
          <Heart size={16} color="#ffffff" fill="#ffffff" />
          <Text style={styles.likeIndicatorText}>
            いいねされています
          </Text>
        </View>
      );
    }

    return null;
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      Alert.alert('エラー', 'プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const renderEngineerCard = (profile: Profile) => {
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image 
            source={
              profile.image_url 
                ? { uri: profile.image_url }
                : require('@/assets/images/default-icon.jpg')
            } 
            style={styles.cardImage} 
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.age}>{profile.age}歳</Text>
          </View>
          {profile.likes && renderLikeIndicator(profile.likes)}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.title}>{profile.title}</Text>
            </View>
            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={() => handleViewProfile(profile)}>
              <UserCircle2 size={24} color="#6366f1" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            {profile.school && (
              <View style={styles.infoRow}>
                <GraduationCap size={16} color="#6b7280" />
                <Text style={styles.infoText}>{profile.school}</Text>
              </View>
            )}
            {profile.location && (
              <View style={styles.infoRow}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.infoText}>{profile.location}</Text>
              </View>
            )}
          </View>

          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio || '自己紹介がありません'}
          </Text>

          <View style={styles.skillsContainer}>
            {profile.skills?.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderProjectCard = (project: typeof DUMMY_PROJECTS[0]) => {
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: project.image }} style={styles.cardImage} />
          <View style={styles.imageOverlay}>
            <View style={styles.projectTypeBadge}>
              <Text style={styles.projectTypeText}>{project.type}</Text>
            </View>
          </View>
          {renderLikeIndicator(project.likes)}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{project.title}</Text>
              <Text style={styles.title}>{project.school}</Text>
            </View>
            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={() => handleViewProject(project)}>
              <UserCircle2 size={24} color="#6366f1" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.infoText}>{project.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Users size={16} color="#6b7280" />
              <Text style={styles.infoText}>{project.teamSize}</Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.infoText}>{project.duration}</Text>
            </View>
            <View style={styles.infoRow}>
              <CreditCard size={16} color="#6b7280" />
              <Text style={styles.infoText}>{project.budget}</Text>
            </View>
          </View>

          <Text style={styles.bio} numberOfLines={3}>
            {project.description}
          </Text>

          <View style={styles.skillsContainer}>
            {project.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const convertProjectData = (project: typeof DUMMY_PROJECTS[0]): Project => {
    return {
      ...project,
      company: project.school,
    };
  };

  return (
    <View style={styles.container}>
      <Animated.View style={animatedBackground} />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            {category === 'engineers' ? 'エンジニアを見つける' : 'プロジェクトを見つける'}
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}>
              <RotateCcw size={20} color="#6366f1" />
            </TouchableOpacity>
            {category === 'projects' && (
              <>
                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={() => router.push('/projects/manage')}>
                  <ListTodo size={20} color="#6366f1" />
                  <Text style={styles.manageButtonText}>管理</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setIsCreateProjectModalVisible(true)}>
                  <Plus size={20} color="#fff" />
                  <Text style={styles.createButtonText}>作成</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>読み込み中...</Text>
          </View>
        ) : (
          <Swiper
            ref={swiperRef}
            cards={category === 'engineers' ? profiles : []}
            renderCard={renderEngineerCard}
            onSwipedLeft={(cardIndex) => {
              console.log(`Swiped NOPE on card: ${cardIndex}`);
              handleSwipeFeedback('left');
            }}
            onSwipedRight={(cardIndex) => {
              console.log(`Swiped LIKE on card: ${cardIndex}`);
              handleSwipeFeedback('right');
            }}
            onSwipedTop={(cardIndex) => {
              console.log(`Swiped SUPER LIKE on card: ${cardIndex}`);
              handleSwipeFeedback('top');
            }}
            onSwipedAll={handleAllCardsEnd}
            cardIndex={0}
            backgroundColor="transparent"
            stackSize={3}
            cardVerticalMargin={20}
            cardHorizontalMargin={20}
            verticalSwipe={true}
            animateOverlayLabelsOpacity
            animateCardOpacity
            swipeBackCard
            containerStyle={styles.swiperContainer}
            cardStyle={styles.swiperCard}
          />
        )}
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.modeButton, category === 'engineers' && styles.modeButtonActive]}
          onPress={() => setCategory('engineers')}>
          <Users size={24} color={category === 'engineers' ? '#ffffff' : '#6366f1'} />
          <Text style={[styles.modeButtonText, category === 'engineers' && styles.modeButtonTextActive]}>
            エンジニア
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, category === 'projects' && styles.modeButtonActive]}
          onPress={() => setCategory('projects')}>
          <Briefcase size={24} color={category === 'projects' ? '#ffffff' : '#6366f1'} />
          <Text style={[styles.modeButtonText, category === 'projects' && styles.modeButtonTextActive]}>
            プロジェクト
          </Text>
        </TouchableOpacity>
      </View>

      {showRecyclePrompt && (
        <TouchableOpacity
          style={styles.recycleButton}
          onPress={() => {
            if (swiperRef.current) {
              // @ts-ignore
              swiperRef.current.jumpToCardIndex(0);
              setShowRecyclePrompt(false);
            }
          }}>
          <RefreshCw size={20} color="#fff" />
          <Text style={styles.recycleButtonText}>最初から表示</Text>
        </TouchableOpacity>
      )}

      {selectedProfile && (
        <ProfileModal
          isVisible={isProfileModalVisible}
          onClose={() => {
            setIsProfileModalVisible(false);
            setSelectedProfile(null);
          }}
          profileData={{
            name: selectedProfile.name,
            title: selectedProfile.title,
            location: selectedProfile.location,
            email: selectedProfile.email,
            website: selectedProfile.website,
            image: selectedProfile.image_url,
            cover: selectedProfile.cover_url,
            bio: selectedProfile.bio,
            academic: {
              school: selectedProfile.school || ''
            },
            skills: selectedProfile.skills?.map(name => ({ name, level: '中級' })) || [],
            interests: selectedProfile.interests || [],
            github_username: selectedProfile.github_username,
            twitter_username: selectedProfile.twitter_username,
            activities: [
              {
                id: '1',
                title: 'プログラミングサークル',
                organization: 'Tech Club',
                period: '2023年4月 - 現在',
                description: '週1回の勉強会を企画・運営'
              }
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
          project={convertProjectData(selectedProject)}
        />
      )}

      <CreateProjectModal
        isVisible={isCreateProjectModalVisible}
        onClose={() => setIsCreateProjectModalVisible(false)}
        onSubmit={(projectData) => {
          console.log('New project:', projectData);
          setIsCreateProjectModalVisible(false);
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
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  manageButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginBottom: 100,
  },
  swiperContainer: {
    backgroundColor: 'transparent',
  },
  swiperCard: {
    height: CARD_HEIGHT * 0.8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    height: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '50%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  age: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  projectTypeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  projectTypeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    color: '#4b5563',
  },
  viewProfileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  bio: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillBadge: {
    backgroundColor: 'rgba(224, 231, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  skillText: {
    fontSize: 11,
    color: '#4f46e5',
    fontWeight: '500',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    zIndex: 1,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modeButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  recycleButton: {
    position: 'absolute',
    bottom: 90,
    left: '50%',
    transform: [{ translateX: -75 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  recycleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  likeIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec4899',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  likeIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DiscoverScreen;