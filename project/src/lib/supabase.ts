import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Custom storage implementation for Node.js environment
const nodeStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Custom storage implementation for web
const webStorage = {
  getItem: (key: string) => {
    try {
      return Promise.resolve(typeof window !== 'undefined' ? window.localStorage.getItem(key) : null);
    } catch (e) {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  },
};

// Platform-specific storage implementation
const getStorage = () => {
  if (Platform.OS === 'web') {
    return webStorage;
  }
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };
  }
  // Default to node storage for SSR
  return nodeStorage;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});