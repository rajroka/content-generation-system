import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PLAN_LIMITS = {
  FREE: {
    dailyCaptions: 10,
    platforms: ["INSTAGRAM", "FACEBOOK"],
    tones: ["CASUAL", "INSPIRATIONAL"],
  },
  PRO: {
    dailyCaptions: 999,
    platforms: ["INSTAGRAM", "FACEBOOK", "YOUTUBE", "TIKTOK"],
    tones: ["PROFESSIONAL", "CASUAL", "INSPIRATIONAL", "HUMOROUS"],
  },
};

export const PLATFORM_LIMITS = {
  INSTAGRAM: 2200,
  FACEBOOK:  63206,
  YOUTUBE:   5000,
  TIKTOK:    2200,
};