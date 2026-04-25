"use client";
import Link from "next/link";
import { ArrowRight, Calendar, Sparkles, BarChart2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-background overflow-hidden px-5 sm:px-8 md:px-16 py-20 lg:py-0 transition-colors duration-300">
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(#0d9488 1px, transparent 1px), linear-gradient(to right, #0d9488 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col items-start text-center sm:text-left items-center sm:items-start">



          {/* Headline */}
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[1.0] tracking-tighter text-foreground mb-2">
            Create once.
          </h1>
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[1.0] tracking-tighter text-[#0d9488] mb-8">
            Post everywhere.
          </h1>

          {/* Subtext */}
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md mb-10">
            The sophisticated editorial suite for modern teams. Schedule,
            optimize, and synchronize your multi-channel presence with
            mathematical precision.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-[#0d4f4a] hover:bg-[#0a3d39] dark:bg-[#0d9488] dark:hover:bg-[#0b8070] text-white font-semibold px-7 h-12 rounded-xl text-sm transition-colors shadow-md"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center border border-[#0d4f4a]/30 dark:border-white/20 text-[#0d4f4a] dark:text-gray-200 hover:bg-[#0d9488]/5 dark:hover:bg-white/5 font-semibold px-7 h-12 rounded-xl text-sm transition-colors"
            >
              Login
            </Link>
          </div>


        </div>

        {/* ── RIGHT COLUMN — UI Mockup ── */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Card shell */}
          <div className="relative w-full max-w-[480px] bg-card rounded-2xl shadow-[0_24px_80px_rgba(13,148,136,0.12),0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_80px_rgba(13,148,136,0.08)] overflow-hidden border border-border">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-muted border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <div className="ml-3 flex-1 h-5 bg-background rounded-md text-[10px] text-muted-foreground flex items-center px-2">
                banamasathi.ai/dashboard
              </div>
            </div>

            {/* Content area */}
            <div className="p-5 relative">
              {/* Top bar skeleton */}
              <div className="h-3 w-2/3 bg-muted rounded-full mb-5" />

              {/* Platform thumbnail row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="aspect-video rounded-xl bg-[#ddedf5] dark:bg-[#0d7c8a]/20 flex items-center justify-center">
                  <div className="w-6 h-6 text-[#0d9488]">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" opacity="0.25" />
                      <path d="M8 3v18M3 8h5M3 12h18M3 16h18" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
                </div>

                {/* AI Generate block */}
                <div className="aspect-video rounded-xl bg-[#e8e4f5] dark:bg-purple-900/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#7c5cbf]" />
                </div>

                {/* Analytics block */}
                <div className="aspect-video rounded-xl bg-[#d9f0ed] dark:bg-[#0d7c8a]/20 flex items-center justify-center">
                  <BarChart2 className="w-6 h-6 text-[#0d9488]" />
                </div>
              </div>

              {/* Scheduled time row */}
              <div className="flex items-center gap-2 bg-[#0d7c8a]/10 rounded-lg px-3 py-2 mb-4 w-fit border border-[#0d7c8a]/20">
                <Calendar className="w-4 h-4 text-[#0d9488]" />
                <span className="text-xs font-medium text-[#0d4f4a] dark:text-[#0d9488]">
                  Scheduled for 9:00 AM
                </span>
              </div>

              {/* Body skeleton lines */}
              <div className="space-y-2">
                <div className="h-2.5 bg-muted rounded-full w-full" />
                <div className="h-2.5 bg-muted rounded-full w-5/6" />
                <div className="h-2.5 bg-muted rounded-full w-3/4" />
              </div>

              {/* Floating "LinkedIn Syncing" badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-card border border-border text-foreground text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
                LinkedIn Syncing…
              </div>
            </div>
          </div>

          {/* Decorative glow behind card */}
          <div className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-30 dark:opacity-20 bg-[radial-gradient(ellipse_at_center,#0d9488_0%,transparent_70%)] scale-75" />
        </div>
      </div>
    </section>
  );
}