/**
 * Single source of truth for the four supported social platforms.
 * All UI files should import from here instead of defining their own lists.
 */

import type { ComponentType, SVGProps } from "react";

// ── Brand SVG icon components ─────────────────────────────────────────────────

export const FacebookSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.883v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

export const InstagramSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ig-grad-shared" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#F58529" />
        <stop offset="50%" stopColor="#DD2A7B" />
        <stop offset="100%" stopColor="#8134AF" />
      </linearGradient>
    </defs>
    <path
      fill="url(#ig-grad-shared)"
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
    />
  </svg>
);

export const YouTubeSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const TikTokSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
);

// ── Platform config ───────────────────────────────────────────────────────────

export type SupportedPlatform = "INSTAGRAM" | "FACEBOOK" | "YOUTUBE" | "TIKTOK";

export interface PlatformConfig {
  /** Uppercase DB key, e.g. "INSTAGRAM" */
  id: SupportedPlatform;
  /** Lowercase Zernio value, e.g. "instagram" */
  slug: string;
  /** Display name */
  name: string;
  /** Brand hex color */
  color: string;
  /** Tailwind text-color class */
  colorClass: string;
  /** OAuth initiation route */
  authUrl: string;
  /** Brand SVG icon component */
  Icon: ComponentType<{ className?: string }>;
}

export const PLATFORM_CONFIG: Record<SupportedPlatform, PlatformConfig> = {
  INSTAGRAM: {
    id:         "INSTAGRAM",
    slug:       "instagram",
    name:       "Instagram",
    color:      "#DD2A7B",
    colorClass: "text-pink-500",
    authUrl:    "/api/auth/instagram",
    Icon:       InstagramSVG,
  },
  FACEBOOK: {
    id:         "FACEBOOK",
    slug:       "facebook",
    name:       "Facebook",
    color:      "#1877F2",
    colorClass: "text-blue-500",
    authUrl:    "/api/auth/facebook",
    Icon:       FacebookSVG,
  },
  YOUTUBE: {
    id:         "YOUTUBE",
    slug:       "youtube",
    name:       "YouTube",
    color:      "#FF0000",
    colorClass: "text-red-500",
    authUrl:    "/api/auth/youtube",
    Icon:       YouTubeSVG,
  },
  TIKTOK: {
    id:         "TIKTOK",
    slug:       "tiktok",
    name:       "TikTok",
    color:      "#111827",
    colorClass: "text-foreground",
    authUrl:    "/api/auth/tiktok",
    Icon:       TikTokSVG,
  },
};

/** Ordered list used in platform selectors and connection cards */
export const PLATFORMS: PlatformConfig[] = [
  PLATFORM_CONFIG.INSTAGRAM,
  PLATFORM_CONFIG.FACEBOOK,
  PLATFORM_CONFIG.TIKTOK,
  PLATFORM_CONFIG.YOUTUBE,
];

/**
 * Renders the brand icon for any platform string (case-insensitive).
 * Falls back to a two-letter abbreviation for unknown values.
 */
export function getPlatformIcon(platform: string): ComponentType<{ className?: string }> {
  const key = platform.toUpperCase() as SupportedPlatform;
  return PLATFORM_CONFIG[key]?.Icon ?? (({ className }) => (
    <span className={className}>{platform.slice(0, 2).toUpperCase()}</span>
  ));
}

/** Returns the brand hex color for a platform string, or a neutral fallback. */
export function getPlatformColor(platform: string): string {
  const key = platform.toUpperCase() as SupportedPlatform;
  return PLATFORM_CONFIG[key]?.color ?? "#64748b";
}
