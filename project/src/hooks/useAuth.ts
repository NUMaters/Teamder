import { useState, useEffect } from 'react';
import { getToken, removeToken } from '@/lib/api-client';

export function useAuth() {
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期化時にトークンを確認
    getToken().then((token) => {
      setSession(token);
      setLoading(false);
    });

    // トークンの変更を監視
    const checkToken = setInterval(async () => {
      const token = await getToken();
      setSession(token);
    }, 1000 * 60); // 1分ごとにチェック

    return () => clearInterval(checkToken);
  }, []);

  return {
    session,
    loading,
  };
} 