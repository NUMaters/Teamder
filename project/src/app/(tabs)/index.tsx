import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Code as Code2, Briefcase, MapPin, Rocket, Users, Building2, CircleUser as UserCircle2, Plus, Calendar, Clock, CreditCard, SwitchCamera, RefreshCw, Heart, Star, Settings, ListTodo, RotateCcw } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { withSpring, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import ProfileModal from '@/components/ProfileModal';
import ProjectModal from '@/components/ProjectModal';
import CreateProjectModal from '@/components/CreateProjectModal';
import type { ProjectFormData } from '@/components/CreateProjectModal';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;

type Category = 'engineers' | 'projects';
type LikeType = 'like' | 'superlike';

type Like = {
  userId: string;
  type: LikeType;
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
  university: string;
  github_username: string;
  twitter_username: string;
  interests: string[];
  skills: string[];
  created_at: string;
  updated_at: string;
  age: number;
  likes: Like[];
};

type Developer = {
  id: string;
  name: string;
  age: number;
  title: string;
  location: string;
  image: string;
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  company: string;
  likes: Like[];
};

type Project = {
  id: string;
  owner_id: string;
  title: string;
  university: string;
  image_url: string;
  location: string;
  description: string;
  team_size: string;
  duration: string;
  budget: string;
  status: string;
  created_at: string;
  updated_at: string;
  likes: Like[];
};

type CardData = Profile | Project;

const CURRENT_USER_ID = 'current-user';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const CARD_VERTICAL_MARGIN = 340;
const CARD_HEIGHT = WINDOW_HEIGHT - CARD_VERTICAL_MARGIN;

export default function DiscoverScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [category, setCategory] = useState<Category>('engineers');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [isCreateProjectModalVisible, setIsCreateProjectModalVisible] = useState(false);
  const [showRecyclePrompt, setShowRecyclePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const swiperRef = useRef(null);

  const bgOpacity = useSharedValue(0);
  const swipeDirection = useSharedValue<'left' | 'right' | 'top' | null>(null);

  useEffect(() => {
    if (category === 'engineers') {
      fetchProfiles();
    } else {
      fetchProjects();
    }
  }, [category]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const apiResponse = await axios.post(
        `${API_GATEWAY_URL}/get_username`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if(apiResponse.data.error){
        return
      }
      //const { data: { user } } = await supabase.auth.getUser();
      //if (!user) return;

      /*
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      */

      if (apiResponse.data) {
        const formattedProfiles: Profile[] = apiResponse.data.map(profile => ({
          id: profile.id,
          name: profile.name,
          title: profile.title,
          location: profile.location,
          email: profile.email,
          website: profile.website,
          image_url: profile.image_url,
          cover_url: profile.cover_url,
          bio: profile.bio,
          university: profile.university,
          github_username: profile.github_username,
          twitter_username: profile.twitter_username,
          interests: profile.interests || [],
          skills: profile.skills || [],
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          age: profile.age,
          likes: profile.likes || []
        }));
        setProfiles(formattedProfiles);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      Alert.alert('エラー', 'プロフィールの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedProjects: Project[] = data.map(project => ({
          ...project,
          likes: project.likes || []
        }));
        setProjects(formattedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('エラー', 'プロジェクトの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const animatedBackground = useAnimatedStyle(() => {
    let backgroundColor = '#ffffff';
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
      opacity: swipeDirection.value ? bgOpacity.value : 1,
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

  const handleSwiping = (x: number, y: number) => {
    const threshold = 50;
    const opacity = Math.min(Math.abs(x) / threshold, 1);

    if (Math.abs(x) > Math.abs(y)) {
      if (x > 0) {
        swipeDirection.value = 'right';
        bgOpacity.value = withTiming(opacity * 0.6, { duration: 0 });
      } else {
        swipeDirection.value = 'left';
        bgOpacity.value = withTiming(opacity * 0.6, { duration: 0 });
      }
    } else if (y < 0) {
      swipeDirection.value = 'top';
      bgOpacity.value = withTiming(Math.abs(y) / threshold * 0.6, { duration: 0 });
    }
  };

  const handleRefresh = () => {
    if (swiperRef.current) {
      // @ts-ignore
      swiperRef.current.jumpToCardIndex(0);
      setShowRecyclePrompt(false);
    }
    fetchProfiles();
  };

  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsProfileModalVisible(true);
  };

  const handleViewProject = (project: Project) => {
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
        <View style={[
          styles.likeIndicator,
          currentUserLike.type === 'superlike' ? styles.superLikeIndicator : styles.likeIndicator,
        ]}>
          {currentUserLike.type === 'superlike' ? (
            <Star size={16} color="#ffffff" fill="#ffffff" />
          ) : (
            <Heart size={16} color="#ffffff" fill="#ffffff" />
          )}
          <Text style={styles.likeIndicatorText}>
            {currentUserLike.type === 'superlike' ? 'スーパーいいね済み' : 'いいね済み'}
          </Text>
        </View>
      );
    }

    if (otherLikes.length > 0) {
      const hasSuperLike = otherLikes.some(like => like.type === 'superlike');
      return (
        <View style={[
          styles.likeIndicator,
          hasSuperLike ? styles.superLikeIndicator : styles.likeIndicator,
        ]}>
          {hasSuperLike ? (
            <Star size={16} color="#ffffff" fill="#ffffff" />
          ) : (
            <Heart size={16} color="#ffffff" fill="#ffffff" />
          )}
          <Text style={styles.likeIndicatorText}>
            {hasSuperLike ? 'スーパーいいねされています' : 'いいねされています'}
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderEngineerCard = (profile: Profile) => {
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: profile.image_url }} style={styles.cardImage} />
          <View style={styles.imageOverlay}>
            <Text style={styles.age}>{profile.age}歳</Text>
          </View>
          {renderLikeIndicator(profile.likes)}
        </View>
        <ScrollView style={styles.cardContentScrollView}>
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
              <View style={styles.infoRow}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.infoText}>{profile.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Code2 size={16} color="#6b7280" />
                <Text style={styles.infoText}>{profile.university}</Text>
              </View>
            </View>

            <Text style={styles.bio} numberOfLines={3}>
              {profile.bio}
            </Text>

            <View style={styles.skillsContainer}>
              {profile.skills.map((skill, index) => {
                let skillData;
                try {
                  skillData = typeof skill === 'string' ? JSON.parse(skill) : skill;
                } catch (e) {
                  skillData = { name: skill, years: '未設定' };
                }
                return (
                  <View key={index} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skillData.name}</Text>
                    <Text style={styles.skillYearsText}>{skillData.years}</Text>
                  </View>
                );
              })}
            </View>

            {profile.interests && profile.interests.length > 0 && (
              <View style={styles.interestsContainer}>
                <Text style={styles.interestsTitle}>興味のある分野</Text>
                <View style={styles.interestsList}>
                  {profile.interests.map((interest, index) => (
                    <View key={index} style={styles.interestBadge}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderProjectCard = (project: Project) => {
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: project.image_url || 'https://via.placeholder.com/400x300' }} 
            style={styles.cardImage} 
          />
          <View style={styles.imageOverlay}>
            <View style={styles.projectTypeBadge}>
              <Text style={styles.projectTypeText}>{project.status}</Text>
            </View>
          </View>
          {renderLikeIndicator(project.likes)}
        </View>
        <ScrollView style={styles.cardContentScrollView}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.name}>{project.title}</Text>
                <Text style={styles.title}>{project.university}</Text>
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
                <Text style={styles.infoText}>{project.team_size}</Text>
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
          </View>
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

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
        <Swiper<CardData>
          ref={swiperRef}
          cards={category === 'engineers' ? profiles : projects}
          renderCard={(card) => {
            if (!card) return null;
            
            if (category === 'engineers' && 'email' in card) {
              return renderEngineerCard(card as Profile);
            } else if (category === 'projects' && 'description' in card) {
              return renderProjectCard(card as Project);
            }
            return null;
          }}
          onSwiping={handleSwiping}
          onSwipedLeft={(cardIndex) => {
            console.log(`Swiped NOPE on card: ${cardIndex}`);
            handleSwipeFeedback('left');
          }}
          onSwipedRight={(cardIndex) => {
            console.log(`Swiped LIKE on card: ${cardIndex}`);
            handleSwipeFeedback('right');
          }}
          onSwipedTop={(cardIndex) => {
            console.log(`Swiped SUPERLIKE on card: ${cardIndex}`);
            handleSwipeFeedback('top');
          }}
          onSwipedBottom={(cardIndex) => {
            console.log(`Swiped NOPE on card: ${cardIndex}`);
            handleSwipeFeedback('left');
          }}
          cardIndex={0}
          backgroundColor={'transparent'}
          stackSize={3}
          stackScale={10}
          stackSeparation={14}
          animateOverlayLabelsOpacity
          animateCardOpacity
          disableTopSwipe
          disableBottomSwipe
          overlayLabels={{
            left: {
              title: 'Skip',
              style: {
                label: {
                  backgroundColor: '#ff4f6b',
                  color: 'white',
                  fontSize: 32,
                  fontWeight: 'bold',
                  borderRadius: 8,
                  padding: 15,
                  borderWidth: 2,
                  borderColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 40,
                  marginLeft: -40,
                },
              },
            },
            right: {
              title: 'Like',
              style: {
                label: {
                  backgroundColor: '#4fcc94',
                  color: 'white',
                  fontSize: 32,
                  fontWeight: 'bold',
                  borderRadius: 8,
                  padding: 15,
                  borderWidth: 2,
                  borderColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 40,
                  marginLeft: 40,
                },
              },
            },
          }}
        />
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
            name: selectedProfile.name || '',
            title: selectedProfile.title || '',
            location: selectedProfile.location || '',
            email: selectedProfile.email || '',
            website: selectedProfile.website || '',
            image: selectedProfile.image_url || '',
            coverUrl: selectedProfile.cover_url || '',
            bio: selectedProfile.bio || '',
            githubUsername: selectedProfile.github_username || '',
            twitterUsername: selectedProfile.twitter_username || '',
            interests: selectedProfile.interests || [],
            skills: (selectedProfile.skills || []).map(skill => {
              if (typeof skill === 'string') {
                try {
                  const parsedSkill = JSON.parse(skill);
                  return {
                    name: (parsedSkill as any).name || '',
                    years: (parsedSkill as any).years || '未設定'
                  };
                } catch (e) {
                  return { name: skill, years: '未設定' };
                }
              }
              return {
                name: (skill as any).name || '',
                years: (skill as any).years || '未設定'
              };
            }),
            age: String(selectedProfile.age || ''),
            university: selectedProfile.university || '',
            activities: [],
            certifications: []
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
          project={selectedProject}
        />
      )}

      <CreateProjectModal
        isVisible={isCreateProjectModalVisible}
        onClose={() => setIsCreateProjectModalVisible(false)}
        onSubmit={(projectData) => {
          console.log('New project:', projectData);
          setIsCreateProjectModalVisible(false);
          fetchProjects();
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    height: CARD_HEIGHT,
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
    height: 200,
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
  cardContentScrollView: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#4f46e5',
    fontWeight: '500',
  },
  skillYearsText: {
    fontSize: 10,
    color: '#6b7280',
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
  superLikeIndicator: {
    backgroundColor: '#6366f1',
  },
  likeIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  interestsContainer: {
    marginTop: 12,
  },
  interestsTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestBadge: {
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
  },
  interestText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
  },
});