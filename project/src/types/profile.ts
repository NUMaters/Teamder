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
  activities?: string[];
};
