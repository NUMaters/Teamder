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

export type Profile = {
  id: string;
  username: string;
  age?: number;
  bio: string;
  location: string;
  email: string;
  icon_url: string;
  cover_url: string;
  interests: string[];
  skills: string[];
  school: string;
  title?: string;
  website?: string;
  githubUsername?: string;
  twitterUsername?: string;
  activities?: Activity[];
  certifications?: Certification[];
};

export type Certification = {
  id: string;
  name: string;
  issueDate: string;
  issuingOrganization: string;
};

export type LikeType = 'like' | 'superlike';

export type Like = {
  id: string;
  type: LikeType;
  user: {
    id: string;
    name: string;
    title: string;
    image: string;
    location: string;
    company: string;
    experience: string;
    skills: string[];
  };
  timestamp: string;
};

export type Project = {
  id: string;
  owner_id: string;
  title: string;
  university: string;
  image_url: string;
  location: string;
  description: string;
  team_size: string;
  duration: string;
  budget: string;
  status: string;
  created_at: string;
  updated_at: string;
  likes: Like[];
};
