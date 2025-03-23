import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Code as Code2, Briefcase, MapPin, Rocket, Users, Building2, CircleUser as UserCircle2, Plus, Calendar, Clock, CreditCard, SwitchCamera, RefreshCw, Heart, Star, Settings, ListTodo, RotateCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { withSpring, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import ProfileModal from '@/components/ProfileModal';
import ProjectModal from '@/components/ProjectModal';
import CreateProjectModal from '@/components/CreateProjectModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_GATEWAY_URL = 'https://ausyu39guk.execute-api.us-west-2.amazonaws.com/v1';
const API_GATEWAY_URL_PROJECT = 'https://62t4hcoegf.execute-api.us-west-2.amazonaws.com/v1';

type Category = 'engineers' | 'projects';

enum LikeType {
  LIKE = 'like',
  SKIP = 'skip'
}

interface Like {
  userId: string;
  type: LikeType;
}

interface ApiInterest {
  name: string;
}

interface ApiSkill {
  name: string;
  years: string;
}

interface Skill {
  name: string;
  years: string;
}

// APIからのレスポンスの型定義
interface ApiProfile {
  id: string;
  username: string;
  age: number;
  bio: string;
  location: string;
  email: string;
  icon_url: string;
  cover_url: string;
  interests: (string | ApiInterest)[];
  skills: (string | ApiSkill)[];
  school: string;
  likes: Like[];
}

// アプリ内で使用するプロフィールの型定義
interface Profile {
  id: string;
  username: string;
  age: number;
  bio: string;
  location: string;
  email: string;
  icon_url: string;
  cover_url: string;
  interests: string[];
  skills: Skill[];
  school: string;
  likes: Like[];
}

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
const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 70; // ヘッダーの高さを小さく
const BOTTOM_BUTTONS_HEIGHT = 140; // 下部ボタン（モード切替ボタン含む）の高さ
const CARD_HEIGHT = WINDOW_HEIGHT - HEADER_HEIGHT - BOTTOM_BUTTONS_HEIGHT; // カードの高さを計算

// モックデータを使用して開発を進める
const MOCK_PROFILES: Profile[] = [
  {
    id: 'user1',
    username: '山田太郎',
    age: 22,
    bio: '東京大学工学部の学生です。Web開発とAIに興味があります。',
    location: '東京都',
    email: 'yamada@example.com',
    icon_url: 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-icon.png',
    cover_url: 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-cover.png',
    interests: ['Web開発', 'AI', 'モバイルアプリ'],
    skills: [
      { name: 'React', years: '2年' },
      { name: 'Python', years: '3年' },
      { name: 'TypeScript', years: '1年' }
    ],
    school: '東京大学',
    likes: []
  },
  {
    id: 'user2',
    username: '鈴木花子',
    age: 21,
    bio: 'デザインとフロントエンド開発が得意です。',
    location: '大阪府',
    email: 'suzuki@example.com',
    icon_url: 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-icon.png',
    cover_url: 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-cover.png',
    interests: ['UI/UXデザイン', 'フロントエンド開発'],
    skills: [
      { name: 'Figma', years: '2年' },
      { name: 'React', years: '1年' }
    ],
    school: '京都大学',
    likes: []
  }
];

export default function DiscoverScreen() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
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
    const initializeToken = async () => {
      try {
        console.log('Initializing token...');
        const storedToken = await AsyncStorage.getItem('userToken');
        console.log('Token from storage:', storedToken ? 'Found token' : 'No token');
        
        if (!storedToken) {
          console.log('No token found in index');
          router.replace('/(auth)/login');
          return;
        }
        
        console.log('Token initialized in index');
        setToken(storedToken);

        // まず既存のuserIdがあるか確認
        const existingUserId = await AsyncStorage.getItem('userId');
        console.log('Existing userId check:', existingUserId || 'None found');
        
        if (existingUserId) {
          console.log('Using existing user ID:', existingUserId);
          return;
        }

        // プロファイル情報を取得してuserIdを保存
        console.log('Fetching profile to get userId...');
        try {
          const response = await axios.post(
            `${API_GATEWAY_URL}/get_profile`,
            {},
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': storedToken,
                'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
              }
            }
          );

          console.log('Profile fetch response status:', response.status);
          console.log('Profile data preview:', response.data ? 'Data received' : 'No data');

          if (response.data && response.data.id) {
            console.log('User ID retrieved:', response.data.id);
            await AsyncStorage.setItem('userId', response.data.id);
          } else {
            console.error('Failed to get user ID from profile - no ID in response');
            // IDがなくてもエラーにしない
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          
          // エラーメッセージを詳細に出力
          if (axios.isAxiosError(profileError)) {
            console.error('Profile fetch error details:', {
              status: profileError.response?.status,
              statusText: profileError.response?.statusText,
              data: profileError.response?.data,
              headers: profileError.config?.headers
            });
            
            // 認証エラーの場合はトークンをクリアしてログイン画面へ
            if (profileError.response?.status === 403 || profileError.response?.status === 401) {
              console.log('Authentication error, redirecting to login');
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userId');
              router.replace('/(auth)/login');
              return;
            }
          }
          // その他のエラーはログインは維持
        }
      } catch (error) {
        console.error('Error initializing token:', error);
        router.replace('/(auth)/login');
      }
    };

    initializeToken();
  }, []);

  useEffect(() => {
    // アプリがフォアグラウンドに戻った時に実行されるリスナー
    const unsubscribe = () => {
      console.log('App state listener registered');
      // この関数は後でリスナーを解除するために使う
      return () => {
        console.log('App state listener unsubscribed');
      };
    };
    
    return unsubscribe();
  }, []);

  useEffect(() => {
    if (token) {
      console.log('Fetching data with token:', token);
      if (category === 'engineers') {
        fetchProfiles();
      } else {
        fetchProjects();
      }
    }
  }, [category, token]);

  const fetchProfiles = async () => {
    if (!token) {
      console.log('No token available for fetching profiles');
      Alert.alert('エラー', 'ログインが必要です');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching profiles with token:', token);

      // 現在のユーザーのメールアドレスを取得
      const currentUserEmail = await AsyncStorage.getItem('userEmail');
      console.log('Current user email:', currentUserEmail);

      const response = await axios.post(
        'https://d3iwflz1ce.execute-api.us-west-2.amazonaws.com/v1/get_all_profile',
        {},  // 空のボディを送信
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,  // 完全なトークン（Bearer含む）を使用
            'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '') // YYYYMMDDTHHmmssZ形式
          },
          timeout: 10000 // 10秒のタイムアウトを設定
        }
      );

      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // レスポンスデータの型チェック
      if (!Array.isArray(response.data)) {
        console.log('Unexpected response format:', response.data);
        throw new Error('プロフィールデータの形式が不正です');
      }

      const formattedProfiles = response.data.map(profile => ({
        id: profile.id || '',
        username: profile.username || '',
        age: profile.age || 0,
        bio: profile.bio || '',
        location: profile.location || '',
        email: profile.email || '',
        icon_url: profile.icon_url || 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-icon.png',
        cover_url: profile.cover_url || 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-cover.png',
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        school: profile.school || '',
        likes: Array.isArray(profile.likes) ? profile.likes : [],
        githubUsername: profile.githubUsername || '',
        twitterUsername: profile.twitterUsername || ''
      }));

      // 自分のプロフィールを除外
      const filteredProfiles = formattedProfiles.filter(profile => profile.email !== currentUserEmail);
      console.log('Filtered profiles:', filteredProfiles);
      setProfiles(filteredProfiles);

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });

        let errorMessage = 'プロフィールの取得に失敗しました';
        if (error.response?.status === 401) {
          errorMessage = '認証エラーが発生しました。再度ログインしてください';
          router.replace('/(auth)/login');
        } else if (error.response?.status === 403) {
          errorMessage = 'アクセスが拒否されました';
          console.error('Access denied with token:', token);
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'タイムアウトが発生しました';
        }

        Alert.alert('エラー', errorMessage);
      } else {
        console.error('Unexpected error:', error);
        Alert.alert('エラー', '予期せぬエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!token) {
      console.log('No token available for fetching projects');
      return;
    }

    try {
      setIsLoading(true);
      
      // 現在のユーザーIDを取得
      const currentUserId = await AsyncStorage.getItem('userId');
      console.log('Current user ID for projects:', currentUserId);
      
      const apiResponse = await axios.post(
        `${API_GATEWAY_URL_PROJECT}/get_all_project`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,  // 完全なトークン（Bearer含む）を使用
            'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
          },
          timeout: 10000
        }
      );

      console.log('Project API Response:', apiResponse.data);

      if(apiResponse.data.error){
        throw new Error(apiResponse.data.error);
      }

      if (Array.isArray(apiResponse.data)) {
        const formattedProjects: Project[] = apiResponse.data
          .filter(project => project.owner_id !== currentUserId) // 自分のプロジェクトを除外
          .map(project => ({
            id: project.id || '',
            owner_id: project.owner_id || '',
            title: project.title || '',
            university: project.university || '',
            image_url: project.image_url || 'https://teamder-aws.s3.us-west-2.amazonaws.com/project-placeholder.png',
            location: project.location || '',
            description: project.description || '',
            team_size: project.team_size || '',
            duration: project.duration || '',
            budget: project.budget || '',
            status: project.status || '募集中',
            created_at: project.created_at || '',
            updated_at: project.updated_at || '',
            likes: Array.isArray(project.likes) ? project.likes : []
          }));
        setProjects(formattedProjects);
      } else {
        console.error('Unexpected project data format:', apiResponse.data);
        throw new Error('プロジェクトデータの形式が不正です');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          Alert.alert('エラー', '認証エラーが発生しました。再度ログインしてください。');
          router.replace('/(auth)/login');
        } else if (error.response?.status === 403) {
          Alert.alert('エラー', 'アクセスが拒否されました');
        } else if (error.code === 'ECONNABORTED') {
          Alert.alert('エラー', 'タイムアウトが発生しました。');
        } else {
          Alert.alert('エラー', 'プロジェクトの取得に失敗しました。');
        }
      } else {
        Alert.alert('エラー', 'プロジェクトの取得に失敗しました。');
      }
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

  const handleSwipeFeedback = async (direction: 'left' | 'right', cardIndex: number) => {
    swipeDirection.value = direction;
    bgOpacity.value = withSpring(0.6, { damping: 12 });
    
    try {
      const action = direction === 'right' ? 'like' : 'skip';
      const currentCard = category === 'engineers' ? profiles[cardIndex] : projects[cardIndex];
      
      if (!currentCard) {
        console.error('Card not found');
        return;
      }

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        Alert.alert('エラー', 'ユーザー情報が取得できません。再度ログインしてください。');
        await AsyncStorage.removeItem('userToken');
        router.replace('/(auth)/login');
        return;
      }

      console.log(`Processing ${action} action for ${category}, user ID: ${userId}`);

      if (category === 'engineers') {
        // エンジニアへのスワイプ処理
        console.log(`Swiping ${action} on engineer with ID: ${currentCard.id}`);
        const response = await axios.post(
          `${API_GATEWAY_URL}/swipe`,
          {
            swiper_id: userId,
            swiped_id: currentCard.id,
            action: action
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
              'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
            }
          }
        );

        console.log('Swipe response:', response.data);

        if (response.data.match) {
          Alert.alert(
            'マッチしました！',
            `${(currentCard as Profile).username}さんとマッチしました！`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // マッチ後の処理（チャットルームへの遷移など）
                  router.push('/chat');
                }
              }
            ]
          );
        }
      } else {
        // プロジェクトへのスワイプ処理
        console.log(`Swiping ${action} on project with ID: ${currentCard.id}`);
        const response = await axios.post(
          `${API_GATEWAY_URL_PROJECT}/projects/${currentCard.id}/like`,
          {
            user_id: userId,
            action: action
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
              'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
            }
          }
        );

        console.log('Project like response:', response.data);

        if (response.data.success) {
          Alert.alert(
            '応募完了',
            'プロジェクトに応募しました。オーナーからの返信をお待ちください。',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Swipe error:', error);
      
      // エラー詳細を出力
      if (axios.isAxiosError(error)) {
        console.error('Swipe error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.config?.headers
        });
        
        // 認証エラーの場合
        if (error.response?.status === 403 || error.response?.status === 401) {
          Alert.alert(
            '認証エラー',
            'セッションが切れました。再度ログインしてください。',
            [{ 
              text: 'OK', 
              onPress: async () => {
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userId');
                router.replace('/(auth)/login');
              } 
            }]
          );
          return;
        }
      }
      
      Alert.alert(
        'エラー',
        'スワイプ処理中にエラーが発生しました。',
        [{ text: 'OK' }]
      );
    } finally {
      setTimeout(() => {
        bgOpacity.value = withTiming(0, { duration: 300 });
        swipeDirection.value = null;
      }, 300);
    }
  };

  const handleSwiping = (x: number, y: number) => {
    const threshold = 50;
    const opacity = Math.min(Math.abs(x) / threshold, 1);

    if (x > 0) {
      swipeDirection.value = 'right';
      bgOpacity.value = withTiming(opacity * 0.6, { duration: 0 });
    } else {
      swipeDirection.value = 'left';
      bgOpacity.value = withTiming(opacity * 0.6, { duration: 0 });
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
          currentUserLike.type === 'like' ? styles.likeIndicator : styles.superLikeIndicator,
        ]}>
          {currentUserLike.type === 'like' ? (
            <Heart size={16} color="#ffffff" fill="#ffffff" />
          ) : (
            <Star size={16} color="#ffffff" fill="#ffffff" />
          )}
          <Text style={styles.likeIndicatorText}>
            {currentUserLike.type === 'like' ? 'いいね済み' : 'スーパーいいね済み'}
          </Text>
        </View>
      );
    }

    if (otherLikes.length > 0) {
      const hasLike = otherLikes.some(like => like.type === 'like');
      return (
        <View style={[
          styles.likeIndicator,
          hasLike ? styles.likeIndicator : styles.superLikeIndicator,
        ]}>
          {hasLike ? (
            <Heart size={16} color="#ffffff" fill="#ffffff" />
          ) : (
            <Star size={16} color="#ffffff" fill="#ffffff" />
          )}
          <Text style={styles.likeIndicatorText}>
            {hasLike ? 'いいねされています' : 'スーパーいいねされています'}
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
          <Image source={{ uri: profile.icon_url }} style={styles.cardImage} />
          <View style={styles.imageOverlay}>
            <Text style={styles.age}>{profile.age}歳</Text>
          </View>
          {renderLikeIndicator(profile.likes)}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{profile.username}</Text>
              <Text style={styles.title}>{profile.school}</Text>
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
              <Text style={styles.infoText}>{profile.school}</Text>
            </View>
          </View>

          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>

          <View style={styles.skillsContainer}>
            {Array.isArray(profile.skills) && profile.skills.map((skill, index) => {
              let skillName = '';
              let skillYears = '未設定';

              if (typeof skill === 'string') {
                skillName = skill;
              } else if (typeof skill === 'object' && skill !== null) {
                skillName = skill.name || '';
                skillYears = skill.years || '未設定';
              }

              return skillName ? (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skillName}</Text>
                  {skillYears !== '未設定' && (
                    <Text style={styles.skillYearsText}>{skillYears}</Text>
                  )}
                </View>
              ) : null;
            })}
          </View>

          {Array.isArray(profile.interests) && profile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              <Text style={styles.interestsTitle}>興味のある分野</Text>
              <View style={styles.interestsList}>
                {profile.interests.map((interest: string | ApiInterest, index) => (
                  <View key={index} style={styles.interestBadge}>
                    <Text style={styles.interestText}>
                      {typeof interest === 'string' ? interest : interest.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
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
            console.log(`Swiped SKIP on card: ${cardIndex}`);
            handleSwipeFeedback('left', cardIndex);
          }}
          onSwipedRight={(cardIndex) => {
            console.log(`Swiped LIKE on card: ${cardIndex}`);
            handleSwipeFeedback('right', cardIndex);
          }}
          cardIndex={0}
          backgroundColor={'transparent'}
          stackSize={3}
          stackScale={10}
          stackSeparation={14}
          animateOverlayLabelsOpacity
          animateCardOpacity
          disableTopSwipe={true}
          disableBottomSwipe={true}
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
            }
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
            name: selectedProfile.username || '',
            title: '',
            location: selectedProfile.location || '',
            email: selectedProfile.email || '',
            website: '',
            image: selectedProfile.icon_url || '',
            coverUrl: selectedProfile.cover_url || '',
            bio: selectedProfile.bio || '',
            githubUsername: '',
            twitterUsername: '',
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
            university: selectedProfile.school || '',
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10, // 下部の余白を減らす
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    height: HEADER_HEIGHT,
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
    marginBottom: BOTTOM_BUTTONS_HEIGHT,
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
    flex: 1,
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
    gap: 8,
    marginTop: 12,
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
    backgroundColor: '#4fcc94',
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
    marginTop: 16,
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