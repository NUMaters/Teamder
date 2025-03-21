import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { User, Mail, Lock, Camera } from 'lucide-react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// 環境変数の型定義
const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const AUTH_TOKEN = process.env.EXPO_PUBLIC_AUTH_TOKEN;

// 環境変数の検証
if (!API_GATEWAY_URL || !API_KEY || !AUTH_TOKEN) {
  throw new Error('必要な環境変数が設定されていません。');
}

export default function SetupScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<'username' | 'bio' | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/register');
    }
  }, [token]);

  const handleSetup = async () => {
    if (!username) {
      setError('ユーザー名を入力してください。');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_GATEWAY_URL}/profile/setup`,
        {
          username,
          bio
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // プロフィール設定成功後、メイン画面に遷移
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'プロフィールの設定に失敗しました。';
        setError(errorMessage);
      } else {
        setError('予期せぬエラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>プロフィール設定</Text>
        <Text style={styles.subtitle}>あなたのプロフィールを設定しましょう</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <User size={20} color="#666" />
          </View>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'username' && styles.inputFocused
            ]}
            placeholder="ユーザー名"
            value={username}
            onChangeText={setUsername}
            onFocus={() => setFocusedInput('username')}
            onBlur={() => setFocusedInput(null)}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Mail size={20} color="#666" />
          </View>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'bio' && styles.inputFocused
            ]}
            placeholder="自己紹介（任意）"
            value={bio}
            onChangeText={setBio}
            onFocus={() => setFocusedInput('bio')}
            onBlur={() => setFocusedInput(null)}
            multiline
            numberOfLines={4}
          />
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSetup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '設定中...' : 'プロフィールを設定'}
          </Text>
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  inputFocused: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 