import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated, PanResponder, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { MapPin, Users, Clock, CreditCard } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

interface SwipeCardProps {
  project: any;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeComplete: () => void;
}

export default function SwipeCard({ project, onSwipeLeft, onSwipeRight, onSwipeComplete }: SwipeCardProps) {
  const position = new Animated.ValueXY();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: async (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        await handleSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        await handleSwipe('left');
      } else {
        resetPosition();
      }
    }
  });

  const handleSwipe = async (direction: 'left' | 'right') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      resetPosition();
      return;
    }

    const action = direction === 'right' ? 'like' : 'skip';
    
    try {
      console.log('Saving swipe action:', {
        user_id: user.id,
        target_id: project.owner_id,
        project_id: project.id,
        action: action
      });

      // スワイプアクションを保存
      const { data: swipeData, error: swipeError } = await supabase
        .from('swipe_actions')
        .insert({
          user_id: user.id,
          target_id: project.owner_id,
          project_id: project.id,
          action: action
        })
        .select()
        .single();

      if (swipeError) {
        console.error('Error saving swipe action:', swipeError);
        throw swipeError;
      }

      console.log('Swipe action saved:', swipeData);

      // いいねの場合、マッチングをチェック
      if (action === 'like') {
        console.log('Checking for match with:', project.owner_id);
        
        const { data: matchData, error: matchError } = await supabase
          .from('swipe_actions')
          .select('*')
          .eq('user_id', project.owner_id)
          .eq('target_id', user.id)
          .eq('action', 'like')
          .single();

        if (matchError) {
          if (matchError.code === 'PGRST116') {
            console.log('No matching like found');
          } else {
            console.error('Error checking match:', matchError);
            throw matchError;
          }
        }

        // マッチング成立
        if (matchData) {
          console.log('Match found! Creating match record...');
          
          const { data: matchRecord, error: createMatchError } = await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: project.owner_id,
              project_id: project.id,
              status: 'active'
            })
            .select()
            .single();

          if (createMatchError) {
            console.error('Error creating match:', createMatchError);
            throw createMatchError;
          }

          console.log('Match record created:', matchRecord);

          // チャットルームを作成
          const { data: chatRoom, error: chatRoomError } = await supabase
            .from('chat_rooms')
            .insert({
              match_id: matchRecord.id
            })
            .select()
            .single();

          if (chatRoomError) {
            console.error('Error creating chat room:', chatRoomError);
            throw chatRoomError;
          }

          console.log('Chat room created:', chatRoom);
        }
      }

      // アニメーションを実行
      Animated.timing(position, {
        toValue: {
          x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
          y: 0
        },
        duration: 250,
        useNativeDriver: false
      }).start(() => {
        direction === 'right' ? onSwipeRight() : onSwipeLeft();
        onSwipeComplete();
      });
    } catch (error) {
      console.error('Error in handleSwipe:', error);
      resetPosition();
      // エラーが発生した場合は元の位置に戻す
      Alert.alert(
        'エラー',
        'アクションの保存に失敗しました。もう一度お試しください。'
      );
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-30deg', '0deg', '30deg']
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  };

  return (
    <Animated.View style={[styles.card, getCardStyle()]} {...panResponder.panHandlers}>
      <Image source={{ uri: project.image_url }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.company}>{project.company}</Text>
        
        <View style={styles.stats}>
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

        <Text style={styles.description}>{project.description}</Text>

        <View style={styles.skills}>
          {project.skills?.map((skill: string, index: number) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  company: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  stats: {
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
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '500',
  },
}); 