import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Users, Code2, MessageSquare } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* ヒーローセクション */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' }}
          style={styles.heroImage}
        />
        <View style={styles.overlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Teamder</Text>
          <Text style={styles.heroSubtitle}>
            エンジニアとプロジェクトをマッチング
          </Text>
        </View>
      </View>

      {/* 特徴セクション */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>主な機能</Text>
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Users size={20} color="#6366f1" />
            </View>
            <Text style={styles.featureTitle}>チームマッチング</Text>
            <Text style={styles.featureDescription}>
              スキルや興味に基づいて最適なチームとマッチング
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Code2 size={20} color="#6366f1" />
            </View>
            <Text style={styles.featureTitle}>スキル管理</Text>
            <Text style={styles.featureDescription}>
              技術スタックや経験を簡単に管理・共有
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MessageSquare size={20} color="#6366f1" />
            </View>
            <Text style={styles.featureTitle}>コミュニケーション</Text>
            <Text style={styles.featureDescription}>
              チーム内でのスムーズなコミュニケーション
            </Text>
          </View>
        </View>
      </View>

      {/* CTAセクション */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.primaryButtonText}>新規登録</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.secondaryButtonText}>ログイン</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    height: height * 0.3,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(79, 70, 229, 0.4)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  featuresSection: {
    padding: 16,
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: (width - 44) / 3,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  ctaSection: {
    padding: 16,
    paddingBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
}); 