import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PLAN_LIMITS = {
  FREE: {
    dailyCaptions: 5,
    dailyImages: 3,
    platforms: ["INSTAGRAM"],
    tones: ["CASUAL", "INSPIRATIONAL"],
  },
  PRO: {
    dailyCaptions: 999,
    dailyImages: 999,
    platforms: ["INSTAGRAM", "FACEBOOK", "TWITTER", "LINKEDIN"],
    tones: ["PROFESSIONAL", "CASUAL", "INSPIRATIONAL", "HUMOROUS"],
  },
  ENTERPRISE: {
    dailyCaptions: 999,
    dailyImages: 999,
    platforms: ["INSTAGRAM", "FACEBOOK", "TWITTER", "LINKEDIN"],
    tones: ["PROFESSIONAL", "CASUAL", "INSPIRATIONAL", "HUMOROUS"],
  },
};

export const PLATFORM_LIMITS = {
  INSTAGRAM: 2200,
  FACEBOOK: 63206,
  TWITTER: 280,
  LINKEDIN: 3000,
};