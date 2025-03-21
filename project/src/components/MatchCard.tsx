import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Heart, Star, MapPin, Code, Briefcase, CircleUser as UserCircle } from 'lucide-react-native';

type MatchCardProps = {
  type: 'engineer' | 'project';
  data: {
    id: string;
    name?: string;
    title: string;
    image: string;
    location: string;
    company?: string;
    experience?: string;
    skills: string[];
    budget?: string;
    teamSize?: string;
    duration?: string;
    likes?: Array<{
      userId: string;
      type: 'like' | 'superlike';
    }>;
  };
  currentUserId: string;
  onProfilePress?: () => void;
};

export default function MatchCard({ type, data, currentUserId, onProfilePress }: MatchCardProps) {
  const hasLikedMe = data.likes?.some(like => like.userId !== currentUserId);
  const hasLikedThem = data.likes?.some(like => like.userId === currentUserId);
  const isMatch = hasLikedMe && hasLikedThem;
  const likeType = data.likes?.find(like => like.userId !== currentUserId)?.type;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: data.image }} style={styles.cardImage} />
        <View style={styles.imageOverlay}>
          {hasLikedMe && !isMatch && (
            <View style={[
              styles.likeBadge,
              likeType === 'superlike' ? styles.superlikeBadge : styles.normalLikeBadge
            ]}>
              {likeType === 'superlike' ? (
                <Star size={16} color="#ffffff" />
              ) : (
                <Heart size={16} color="#ffffff" />
              )}
              <Text style={styles.likeTypeText}>
                いいねされています
              </Text>
            </View>
          )}
          {isMatch && (
            <View style={[styles.likeBadge, styles.matchBadge]}>
              <Star size={16} color="#ffffff" fill="#ffffff" />
              <Text style={styles.likeTypeText}>マッチ済み</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{type === 'engineer' ? data.name : data.title}</Text>
            <Text style={styles.title}>{type === 'engineer' ? data.title : data.company}</Text>
          </View>
          {onProfilePress && (
            <TouchableOpacity
              style={styles.profileButton}
              onPress={onProfilePress}>
              <UserCircle size={24} color="#6366f1" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.infoText}>{data.location}</Text>
          </View>
          {type === 'engineer' ? (
            <>
              <View style={styles.infoRow}>
                <Briefcase size={16} color="#6b7280" />
                <Text style={styles.infoText}>{data.company}</Text>
              </View>
              <View style={styles.infoRow}>
                <Code size={16} color="#6b7280" />
                <Text style={styles.infoText}>{data.experience}の経験</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Briefcase size={16} color="#6b7280" />
                <Text style={styles.infoText}>{data.teamSize}</Text>
              </View>
              <View style={styles.infoRow}>
                <Code size={16} color="#6b7280" />
                <Text style={styles.infoText}>{data.duration}</Text>
              </View>
              <View style={styles.infoRow}>
                <Star size={16} color="#6b7280" />
                <Text style={styles.infoText}>{data.budget}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.skillsContainer}>
          {data.skills.map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  matchBadge: {
    backgroundColor: '#10b981',
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
});