import { createApiRequest } from './api-client';

export type Match = {
  id: string;
  user1_id: string;
  user2_id: string | null;
  project_id: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'archived';
  created_at: string;
  updated_at: string;
};

export const matchService = {
  async getMatches() {
    const response = await createApiRequest('/matches', 'GET');
    if (!response.data) throw new Error('マッチの取得に失敗しました');
    return response.data;
  },

  async updateMatchStatus(matchId: string, status: Match['status']) {
    const response = await createApiRequest(`/matches/${matchId}/status`, 'PUT', {
      status
    });
    if (!response.data) throw new Error('マッチステータスの更新に失敗しました');
    return response.data;
  },

  subscribeToMatches(callback: (match: Match) => void) {
    // WebSocketの実装は別途必要
    console.warn('WebSocket subscription is not implemented yet');
    return {
      unsubscribe: () => {}
    };
  },
};