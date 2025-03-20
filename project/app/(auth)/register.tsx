import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type UserType = 'engineer' | 'recruiter';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('engineer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('すべての項目を入力してください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: signUpError, data: { user } } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error('このメールアドレスは既に登録されています');
        }
        throw signUpError;
      }

      if (user) {
        // Update the user's profile with type
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ type: userType })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        // Redirect to profile setup
        router.replace(`/profile/setup`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'アカウントの作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>新規登録</Text>
          <Text style={styles.subtitle}>
            エンジニアとして登録、またはプロジェクトを掲載
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'engineer' && styles.userTypeButtonActive
            ]}
            onPress={() => setUserType('engineer')}>
            <Text style={[
              styles.userTypeText,
              userType === 'engineer' && styles.userTypeTextActive
            ]}>エンジニア</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'recruiter' && styles.userTypeButtonActive
            ]}
            onPress={() => setUserType('recruiter')}>
            <Text style={[
              styles.userTypeText,
              userType === 'recruiter' && styles.userTypeTextActive
            ]}>採用担当者</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color="#6b7280" />
          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6b7280" />
          <TextInput
            style={styles.input}
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6b7280" />
          <TextInput
            style={styles.input}
            placeholder="パスワード（確認）"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? '登録中...' : 'アカウントを作成'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>
            すでにアカウントをお持ちの方
          </Text>
          <ArrowLeft size={16} color="#6366f1" />
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  userTypeButtonActive: {
    backgroundColor: '#6366f1',
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  userTypeTextActive: {
    color: '#ffffff',
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
});