export interface Bio {
  id?: string;
  userId?: string;
  name: string;
  headline: string;
  shortIntro: string;
  longBio: string;
  photos: string[];
}

/* ─── Unified Work Item ─── */

export type WorkItemType =
  | "venture"
  | "project"
  | "experiment"
  | "client";

export type WorkItemStatus =
  | "active"
  | "in-development"
  | "completed"
  | "archived"
  | "building"
  | "scaling"
  | "research"
  | "exited";

export interface WorkItem {
  id: string;
  userId?: string;
  name: string;
  description: string;
  type: WorkItemType;
  category: string;
  tags: string[];
  status: WorkItemStatus;
  owned: boolean;
  role: string;
  website: string;
  logoURL: string;
  techStack: string[];
  metrics: string;
  images: string[];
  featured: boolean;
  order: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
}

/* ─── Legacy types (kept for backwards compat during migration) ─── */

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

/* ─── Homepage Structural Types ─── */

export interface SiteMetric {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface HeroSection {
  name: string;
  tagline: string;
  subtext: string;
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
}

export interface CapabilityBlock {
  title: string;
  description: string;
}

export interface CapabilitiesSection {
  blocks: CapabilityBlock[];
}

export interface CurrentFocusSection {
  title: string;
  items: string[];
}
