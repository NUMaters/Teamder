import { supabase } from './supabase';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:user1_id (id, name, title, image_url),
        user2:user2_id (id, name, title, image_url),
        project:project_id (
          id,
          title,
          company,
          image_url,
          owner:owner_id (id, name, image_url)
        )
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateMatchStatus(matchId: string, status: Match['status']) {
    const { data, error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  subscribeToMatches(callback: (match: Match) => void) {
    return supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        (payload) => {
          callback(payload.new as Match);
        }
      )
      .subscribe();
  },
};