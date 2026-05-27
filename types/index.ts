export type Platform = "INSTAGRAM" | "FACEBOOK" | "YOUTUBE" | "TIKTOK";
export type Tone = "PROFESSIONAL" | "CASUAL" | "INSPIRATIONAL" | "HUMOROUS";
export type Plan = "FREE" | "PRO";
export type Role = "USER" | "ADMIN";

export interface GeneratedContent {
  id: string;
  userId: string;
  topic: string;
  platform: Platform;
  tone: Tone;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  imageKitId?: string;
  isFlagged: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  plan: Plan;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export interface UsageStats {
  captionCount: number;
  imageCount: number;
  date: Date;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: number;
}