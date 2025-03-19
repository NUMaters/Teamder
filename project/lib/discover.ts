import { supabase } from './supabase';

export type Profile = {
  id: string;
  name: string;
  title: string;
  location: string;
  image_url: string;
  bio: string;
  type: 'engineer' | 'recruiter';
  skills: string[];
  interests: string[];
  github_username?: string;
  twitter_username?: string;
};

export type Project = {
  id: string;
  owner_id: string;
  title: string;
  company: string;
  image_url: string;
  location: string;
  description: string;
  team_size: string;
  duration: string;
  budget: string;
  type: string;
  status: 'active' | 'paused' | 'completed';
};

export const discoverService = {
  async getProfiles() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get profiles that haven't been swiped yet
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'eq', user.id)
      .not(
        'id',
        'in',
        supabase
          .from('swipe_actions')
          .select('target_id')
          .eq('user_id', user.id)
      )
      .eq('type', 'engineer')
      .limit(10);

    if (error) throw error;
    return data;
  },

  async getProjects() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get active projects that haven't been swiped yet
    const { data, error } = await supabase
      .from('projects')
      .select('*, owner:profiles!projects_owner_id_fkey(*)')
      .eq('status', 'active')
      .not(
        'id',
        'in',
        supabase
          .from('swipe_actions')
          .select('project_id')
          .eq('user_id', user.id)
      )
      .limit(10);

    if (error) throw error;
    return data;
  },

  async swipe(targetId: string | null, projectId: string | null, action: 'like' | 'superlike' | 'skip') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('swipe_actions')
      .insert({
        user_id: user.id,
        target_id: targetId,
        project_id: projectId,
        action,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};