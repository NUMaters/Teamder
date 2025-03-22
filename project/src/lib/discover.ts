import { createApiRequest } from './api-client';

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
    const response = await createApiRequest('/discover/profiles', 'GET');
    if (!response.data) throw new Error('プロフィールの取得に失敗しました');
    return response.data;
  },

  async getProjects() {
    const response = await createApiRequest('/discover/projects', 'GET');
    if (!response.data) throw new Error('プロジェクトの取得に失敗しました');
    return response.data;
  },

  async swipe(targetId: string | null, projectId: string | null, action: 'like' | 'superlike' | 'skip') {
    const response = await createApiRequest('/discover/swipe', 'POST', {
      target_id: targetId,
      project_id: projectId,
      action,
    });
    if (!response.data) throw new Error('スワイプアクションの保存に失敗しました');
    return response.data;
  },
};