export interface Bio {
  id?: string;
  userId?: string;
  name: string;
  headline: string;
  shortIntro: string;
  longBio: string;
  photos: string[];
}

export interface Venture {
  id: string;
  userId?: string;
  name: string;
  logoURL: string;
  website: string;
  description: string;
  category: "owned" | "client" | "investment";
  role: string;
  status: "active" | "archived" | "exited";
  tags: string[];
  featured: boolean;
}

export interface Project {
  id: string;
  userId?: string;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  techStack: string[];
  metrics: string;
  images: string[];
  link: string;
  featured: boolean;
}

export interface Experiment {
  id: string;
  userId?: string;
  title: string;
  type: string;
  status: "building" | "scaling" | "research" | "archived";
  summary: string;
  link: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: "article" | "talk" | "podcast";
  publishedAt: string;
  excerpt: string;
  contentURL: string;
}

export interface SiteSettings {
  primaryColor: string;
  accentColor: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    email?: string;
  };
  metrics: { label: string; value: string }[];
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
  read: boolean;
  reply?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  repliedAt?: any;
}

