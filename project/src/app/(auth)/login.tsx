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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

  const saveToken = async (id_token: string) => {
    try {
      // AsyncStorageにトークンを保存
      console.log('Saving token to AsyncStorage...');
      await AsyncStorage.setItem('userToken', `Bearer ${id_token}`);
      await AsyncStorage.setItem('userEmail', email);
      console.log('Token successfully saved to AsyncStorage');
      
      // ファイルシステムにもバックアップとして保存
      const fileUri = `${FileSystem.documentDirectory}token.txt`;
      await FileSystem.writeAsStringAsync(fileUri, id_token, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      console.log("Token backed up to file:", fileUri);
      
      // トークンを使ってプロファイル情報を取得
      try {
        console.log('Fetching user profile after login...');
        const response = await axios.post(
          `${API_GATEWAY_URL}/get_profile`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${id_token}`,
              'X-Amz-Date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
            }
          }
        );
        
        if (response.data && response.data.id) {
          console.log('User ID retrieved after login:', response.data.id);
          await AsyncStorage.setItem('userId', response.data.id);
          return true;
        } else {
          console.error('No user ID in profile response');
          // IDがなくても続行
          return true;
        }
      } catch (profileError) {
        console.error('Error fetching profile after login:', profileError);
        // プロファイル取得エラーでも続行
        return true;
      }
    } catch (error) {
      console.error("Error saving token:", error);
      throw new Error('トークンの保存に失敗しました');
    }
  };

  async function login(email: string, password: string) {
    try {
      // API Gatewayにリクエストを送信
      const apiResponse = await axios.post(
        `${API_GATEWAY_URL}/login`,
        {
          email,
          password,
          client_id: COGNITO_CLIENT_ID
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${AUTH_TOKEN}`
          }
        }
      );

      console.log('API Response:', apiResponse.data);
      
      if (apiResponse.data && apiResponse.data.id_token) {
        return { id_token: apiResponse.data.id_token };
      } else {
        return { error: new Error('トークンの取得に失敗しました') };
      }
    } catch (error) {
      console.error("ログイン失敗:", error);
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
          case 401:
            return { error: new Error('メールアドレスまたはパスワードが正しくありません。') };
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

  const handleLogin = async () => {
    if (!email || !password) {
      setError('すべての項目を入力してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: loginError, id_token: id_Token } = await login(email, password);
      
      if (loginError) {
        throw loginError;
      }

      if (id_Token) {
        // トークンを保存
        await saveToken(id_Token);
        
        // 意図的に遅延を入れる
        console.log('Login successful, navigating to main screen...');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'ログインに失敗しました。もう一度お試しください。');
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
          <Text style={styles.title}>ログイン</Text>
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

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/register')}>
          <Text style={styles.registerButtonText}>
            アカウントをお持ちでない方
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
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  registerButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
});