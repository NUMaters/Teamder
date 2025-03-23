import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 環境変数の型定義
const AWS_REGION = process.env.EXPO_PUBLIC_AWS_REGION;
const COGNITO_USER_POOL_ID = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID;
const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const AUTH_TOKEN = process.env.EXPO_PUBLIC_AUTH_TOKEN;

// 環境変数の検証
if (!AWS_REGION || !COGNITO_USER_POOL_ID || !COGNITO_CLIENT_ID || !API_GATEWAY_URL || !API_KEY || !AUTH_TOKEN) {
  throw new Error('必要な環境変数が設定されていません。');
}

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | 'confirmPassword' | null>(null);

  const saveToken = async (id_token: string) => {
    try {
      await AsyncStorage.setItem('userToken', id_token);
      console.log("トークンを保存しました");
    } catch (error) {
      console.error("トークンの保存に失敗しました:", error);
      throw new Error('トークンの保存に失敗しました');
    }
  };

  async function signup(email: string, password: string) {
    try {
      // API Gatewayにリクエストを送信
      const apiResponse = await axios.post(
        `${API_GATEWAY_URL}/register`,
        { email, password }
      );
      
      if (apiResponse.data && apiResponse.data.id_token) {
        return { id_token: apiResponse.data.id_token };
      } else {
        return { error: new Error('トークンの取得に失敗しました') };
      }
    } catch (error) {
      console.error("登録失敗:", error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        
        // エラーレスポンスの詳細を取得
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || errorData?.error || '予期せぬエラーが発生しました';
        
        switch (error.response?.status) {
          case 500:
            return { error: new Error(`サーバーエラー: ${errorMessage}`) };
          case 400:
            return { error: new Error(`入力エラー: ${errorMessage}`) };
          case 409:
            return { error: new Error('このメールアドレスは既に登録されています。') };
          case 403:
            return { error: new Error('アクセスが拒否されました。APIキーまたは認証トークンが正しくありません。') };
          case 404:
            return { error: new Error('APIエンドポイントが見つかりません。') };
          default:
            return { error: new Error(`エラー: ${errorMessage}`) };
        }
      }
      return { error: new Error('予期せぬエラーが発生しました。もう一度お試しください。') };
    }
  }

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('すべての項目を入力してください。');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください。');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signup(email, password);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.id_token) {
        await saveToken(result.id_token);
        // トークンを保持したままプロフィール設定画面に遷移
        router.replace('/(auth)/setup');
      }
    } catch (error) {
      setError('予期せぬエラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>新規登録</Text>
          <Text style={styles.subtitle}>
            エンジニアとプロジェクトをマッチング
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={[
          styles.inputContainer,
          focusedInput === 'email' && styles.inputFocused
        ]}>
          <Mail size={20} color="#6b7280" />
          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        <View style={[
          styles.inputContainer,
          focusedInput === 'password' && styles.inputFocused
        ]}>
          <Lock size={20} color="#6b7280" />
          <TextInput
            style={styles.input}
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <View style={styles.passwordPolicy}>
          <Text style={styles.passwordPolicyTitle}>パスワードの要件：</Text>
          <Text style={styles.passwordPolicyText}>・8文字以上</Text>
          <Text style={styles.passwordPolicyText}>・大文字を含む</Text>
          <Text style={styles.passwordPolicyText}>・小文字を含む</Text>
          <Text style={styles.passwordPolicyText}>・数字を含む</Text>
          <Text style={styles.passwordPolicyText}>・記号を含む（@$!%*?&）</Text>
        </View>

        <View style={[
          styles.inputContainer,
          focusedInput === 'confirmPassword' && styles.inputFocused
        ]}>
          <Lock size={20} color="#6b7280" />
          <TextInput
            style={styles.input}
            placeholder="パスワード（確認）"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => setFocusedInput('confirmPassword')}
            onBlur={() => setFocusedInput(null)}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? '登録中...' : '新規登録'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>
            すでにアカウントをお持ちの方
          </Text>
          <ArrowRight size={16} color="#6366f1" />
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
  header: {
    height: 240,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(79, 70, 229, 0.4)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  form: {
    flex: 1,
    padding: 20,
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputFocused: {
    borderColor: '#6366f1',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  loginButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  passwordPolicy: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordPolicyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  passwordPolicyText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
});
