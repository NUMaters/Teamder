import { Modal, View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { X, Heart, Star, MapPin, Code, Briefcase, CircleUser as UserCircle, Handshake as HandshakeIcon } from 'lucide-react-native';
import Swiper from 'react-native-deck-swiper';
import { useRef, useState } from 'react';
import ProfileModal from './ProfileModal';

type Like = {
  id: string;
  type: 'like' | 'superlike';
  user: {
    id: string;
    name: string;
    title: string;
    image: string;
    location: string;
    company: string;
    experience: string;
    skills: string[];
  };
  timestamp: string;
};

interface ProjectLikesModalProps {
  isVisible: boolean;
  onClose: () => void;
  projectId: string;
}

// In a real app, this would come from your backend
const DUMMY_LIKES: Like[] = [
  {
    id: '1',
    type: 'superlike',
    user: {
      id: '1',
      name: '田中 美咲',
      title: 'フルスタックエンジニア',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      location: '東京都',
      company: 'テックスタートアップ株式会社',
      experience: '5年',
      skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
    },
    timestamp: '2024-02-20T10:00:00Z',
  },
  {
    id: '2',
    type: 'like',
    user: {
      id: '2',
      name: '佐藤 健一',
      title: 'バックエンドエンジニア',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      location: '大阪府',
      company: 'フィンテックラボ株式会社',
      experience: '3年',
      skills: ['Go', 'Python', 'Docker', 'Kubernetes', 'PostgreSQL'],
    },
    timestamp: '2024-02-19T15:30:00Z',
  },
  {
    id: '3',
    type: 'superlike',
    user: {
      id: '3',
      name: 'Emily Chen',
      title: 'フロントエンドエンジニア',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      location: '福岡県',
      company: 'デジタルクリエイト株式会社',
      experience: '4年',
      skills: ['React', 'Vue.js', 'WebGL', 'Three.js', 'TypeScript'],
    },
    timestamp: '2024-02-18T09:15:00Z',
  },
];

const WINDOW_HEIGHT = Dimensions.get('window').height;
const CARD_VERTICAL_MARGIN = 180;
const CARD_HEIGHT = WINDOW_HEIGHT - CARD_VERTICAL_MARGIN;

export default function ProjectLikesModal({ isVisible, onClose, projectId }: ProjectLikesModalProps) {
  const swiperRef = useRef(null);
  const [likes, setLikes] = useState(DUMMY_LIKES);
  const [selectedProfile, setSelectedProfile] = useState<Like['user'] | null>(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [mode, setMode] = useState<'likes' | 'offers'>('likes');

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSwipedLeft = (cardIndex: number) => {
    // Skip/Reject the engineer
    const skippedUser = likes[cardIndex];
    console.log('Skipped:', skippedUser.user.name);
    // Here you would typically call your backend API to update the status
  };

  const handleSwipedRight = (cardIndex: number) => {
    // Accept/Offer to the engineer
    const acceptedUser = likes[cardIndex];
    console.log(mode === 'likes' ? 'Matched with:' : 'Offered to:', acceptedUser.user.name);
    // Here you would typically call your backend API to create a match or send an offer
  };

  const handleViewProfile = (user: Like['user']) => {
    setSelectedProfile(user);
    setIsProfileModalVisible(true);
  };

  const renderCard = (like: Like) => {
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: like.user.image }} style={styles.cardImage} />
          <View style={styles.imageOverlay}>
            <View style={[
              styles.likeBadge,
              like.type === 'superlike' ? styles.superlikeBadge : styles.normalLikeBadge
            ]}>
              {like.type === 'superlike' ? (
                <Star size={16} color="#ffffff" />
              ) : (
                <Heart size={16} color="#ffffff" />
              )}
              <Text style={styles.likeTypeText}>
                {like.type === 'superlike' ? 'スーパーいいね' : 'いいね'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{like.user.name}</Text>
              <Text style={styles.title}>{like.user.title}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => handleViewProfile(like.user)}>
              <UserCircle size={24} color="#6366f1" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.infoText}>{like.user.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Briefcase size={16} color="#6b7280" />
              <Text style={styles.infoText}>{like.user.company}</Text>
            </View>
            <View style={styles.infoRow}>
              <Code size={16} color="#6b7280" />
              <Text style={styles.infoText}>{like.user.experience}の経験</Text>
            </View>
          </View>

          <View style={styles.skillsContainer}>
            {like.user.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.timestamp}>{formatTimestamp(like.timestamp)}</Text>
        </View>

        <View style={styles.swipeHint}>
          <View style={styles.swipeAction}>
            <X size={24} color="#ef4444" />
            <Text style={[styles.swipeActionText, styles.rejectText]}>スキップ</Text>
          </View>
          <View style={styles.swipeAction}>
            {mode === 'likes' ? (
              <Heart size={24} color="#10b981" />
            ) : (
              <HandshakeIcon size={24} color="#10b981" />
            )}
            <Text style={[styles.swipeActionText, styles.matchText]}>
              {mode === 'likes' ? 'マッチング' : 'オファー'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>エンジニア一覧</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'likes' && styles.modeButtonActive]}
                onPress={() => setMode('likes')}>
                <Heart size={20} color={mode === 'likes' ? '#fff' : '#6366f1'} />
                <Text style={[styles.modeButtonText, mode === 'likes' && styles.modeButtonTextActive]}>
                  いいね
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'offers' && styles.modeButtonActive]}
                onPress={() => setMode('offers')}>
                <HandshakeIcon size={20} color={mode === 'offers' ? '#fff' : '#6366f1'} />
                <Text style={[styles.modeButtonText, mode === 'offers' && styles.modeButtonTextActive]}>
                  オファー
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {likes.length > 0 ? (
            <View style={styles.swiperContainer}>
              <Swiper
                ref={swiperRef}
                cards={likes}
                renderCard={renderCard}
                onSwipedLeft={handleSwipedLeft}
                onSwipedRight={handleSwipedRight}
                cardIndex={0}
                backgroundColor="transparent"
                stackSize={3}
                cardVerticalMargin={20}
                cardHorizontalMargin={20}
                verticalSwipe={false}
                animateCardOpacity
                containerStyle={styles.swiperContent}
                cardStyle={styles.swiperCard}
                overlayLabels={{
                  left: {
                    title: 'スキップ',
                    style: {
                      label: {
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontSize: 24,
                        borderRadius: 4,
                        padding: 10,
                      },
                      wrapper: {
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start',
                        marginTop: 30,
                        marginLeft: -30,
                      },
                    },
                  },
                  right: {
                    title: mode === 'likes' ? 'マッチング' : 'オファー',
                    style: {
                      label: {
                        backgroundColor: '#10b981',
                        color: 'white',
                        fontSize: 24,
                        borderRadius: 4,
                        padding: 10,
                      },
                      wrapper: {
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        marginTop: 30,
                        marginLeft: 30,
                      },
                    },
                  },
                }}
              />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {mode === 'likes' ? 'まだいいねがありません' : 'オファー可能なエンジニアがいません'}
              </Text>
            </View>
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
                email: 'example@email.com',
                website: 'https://example.com',
                image: selectedProfile.image,
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
                skills: selectedProfile.skills.map(name => ({ name, level: '中級' })),
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modeButtonActive: {
    backgroundColor: '#6366f1',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swiperContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  swiperContent: {
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
    top: 16,
    right: 16,
  },
  likeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  normalLikeBadge: {
    backgroundColor: '#ec4899',
  },
  superlikeBadge: {
    backgroundColor: '#6366f1',
  },
  likeTypeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillBadge: {
    backgroundColor: '#e0e7ff',
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
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  swipeAction: {
    alignItems: 'center',
    gap: 4,
  },
  swipeActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rejectText: {
    color: '#ef4444',
  },
  matchText: {
    color: '#10b981',
  },
});