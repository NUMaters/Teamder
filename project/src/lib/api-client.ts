import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// デフォルト画像のURL
export const DEFAULT_ICON_URL = 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-icon.png';
export const DEFAULT_COVER_URL = 'https://teamder-aws.s3.us-west-2.amazonaws.com/default-cover.png';

// APIのベースURL
export const API_GATEWAY_URL = 'https://api.teamder.dev';
export const API_GATEWAY_URL_PRJ = 'https://api.teamder.dev/projects';

// APIリクエストを作成する関数
export const createApiRequest = async (endpoint: string, method: string = 'POST', body: any = {}) => {
  const token = await getToken();
  return axios({
    method,
    url: `${API_GATEWAY_URL}${endpoint}`,
    data: body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// トークンの取得
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// トークンの保存
export const setToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

// トークンの削除
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
}; 