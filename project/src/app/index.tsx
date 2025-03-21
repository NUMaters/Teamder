import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Users, Code2, MessageSquare } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function TopScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ヒーローセクション */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' }}
          style={styles.heroImage}
        />
        <View style={styles.overlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Teamder</Text>
          <Text style={styles.heroSubtitle}>
            エンジニアのためのチームマッチング
          </Text>
        </View>
      </View>

      {/* 特徴セクション */}
      <View style={styles.featuresSection}>
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Users size={24} color="#6366f1" />
            </View>
            <Text style={styles.featureTitle}>スキルマッチング</Text>
            <Text style={styles.featureDescription}>
              技術スタックに基づく最適なチームマッチング
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Code2 size={24} color="#6366f1" />
            </View>
            <Text style={styles.featureTitle}>プロジェクト管理</Text>
            <Text style={styles.featureDescription}>
              タスク管理と進捗の可視化
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <MessageSquare size={24} color="#6366f1" />
            </View>
            <Text style={styles.featureTitle}>コミュニケーション</Text>
            <Text style={styles.featureDescription}>
              スムーズなチーム内コミュニケーション
            </Text>
          </View>
        </View>
      </View>

      {/* CTAセクション */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/register')}>
          <Text style={styles.primaryButtonText}>新規登録</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/login')}>
          <Text style={styles.secondaryButtonText}>ログイン</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    height: 300,
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
    padding: 20,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  featuresSection: {
    padding: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  ctaSection: {
    padding: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
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