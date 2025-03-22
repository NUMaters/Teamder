export type Skill = {
  name: string;
  years: string;
};

export type Activity = {
  id: string;
  title: string;
  period: string;
  description: string;
  link?: string;
};

export type ProfileData = {
  name: string;
  title: string;
  location: string;
  email: string;
  website: string;
  image: string;
  coverUrl: string;
  bio: string;
  githubUsername: string;
  twitterUsername: string;
  interests: string[];
  skills: Skill[];
  age: string;
  university: string;
  activities: Activity[];
  certifications: string[];
};

export interface Profile {
  id: string;
  username: string;
  title?: string;
  location?: string;
  email?: string;
  website?: string;
  image?: string;
  coverUrl?: string;
  bio?: string;
  university?: string;
  githubUsername?: string;
  twitterUsername?: string;
  interests?: string[];
  skills?: { name: string; years: string }[];
  created_at: string;
  updated_at: string;
  age?: number;
  activities?: {
    id: string;
    title: string;
    period: string;
    description: string;
    link?: string;
  }[];
}
