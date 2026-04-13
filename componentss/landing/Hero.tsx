"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Sparkles, BarChart2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#f0f4f8] overflow-hidden px-6 md:px-16">
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(#0d9488 1px, transparent 1px), linear-gradient(to right, #0d9488 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col items-start">
         

          {/* Headline */}
          <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-black leading-[1.0] tracking-tighter text-[#0d1f2d] mb-3">
            Create once.
          </h1>
          <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-black leading-[1.0] tracking-tighter text-[#0d9488] mb-8">
            Post everywhere.
          </h1>

          {/* Subtext */}
          <p className="text-[#4a6274] text-base md:text-lg leading-relaxed max-w-md mb-10">
            The sophisticated editorial suite for modern teams. Schedule,
            optimize, and synchronize your multi-channel presence with
            mathematical precision.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="bg-[#0d4f4a] hover:bg-[#0a3d39] text-white font-semibold px-6 rounded-lg"
              asChild
            >
              <Link href="/sign-up" className="flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-[#0d4f4a]/30 text-[#0d4f4a] hover:bg-[#0d9488]/5 font-semibold px-6 rounded-lg"
              asChild
            >
              <Link href="/sign-in">Login</Link>
            </Button>
          </div>
        </div>

        {/* ── RIGHT COLUMN — UI Mockup ── */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Card shell */}
          <div className="relative w-full max-w-[480px] bg-white rounded-2xl shadow-[0_24px_80px_rgba(13,148,136,0.12),0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden border border-white/80">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-[#f8fafb] border-b border-gray-100">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>

            {/* Content area */}
            <div className="p-5 relative">
              {/* Top bar skeleton */}
              <div className="h-3 w-2/3 bg-[#e8eef2] rounded-full mb-5" />

              {/* Platform thumbnail row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {/* Facebook-ish block */}
                <div className="aspect-video rounded-xl bg-[#ddedf5] flex items-center justify-center">
                  <div className="w-6 h-6 text-[#0d9488]">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" opacity="0.25" />
                      <path d="M8 3v18M3 8h5M3 12h18M3 16h18" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </div>
                </div>

                {/* AI Generate block */}
                <div className="aspect-video rounded-xl bg-[#e8e4f5] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#7c5cbf]" />
                </div>

                {/* Analytics block */}
                <div className="aspect-video rounded-xl bg-[#d9f0ed] flex items-center justify-center">
                  <BarChart2 className="w-6 h-6 text-[#0d9488]" />
                </div>
              </div>

              {/* Scheduled time row */}
              <div className="flex items-center gap-2 bg-[#f0f9f8] rounded-lg px-3 py-2 mb-4 w-fit">
                <Calendar className="w-4 h-4 text-[#0d9488]" />
                <span className="text-xs font-medium text-[#0d4f4a]">
                  Scheduled for 9:00 AM
                </span>
              </div>

              {/* Body skeleton lines */}
              <div className="space-y-2">
                <div className="h-2.5 bg-[#e8eef2] rounded-full w-full" />
                <div className="h-2.5 bg-[#e8eef2] rounded-full w-5/6" />
                <div className="h-2.5 bg-[#e8eef2] rounded-full w-3/4" />
              </div>

              {/* Floating "LinkedIn Syncing" badge — top-right */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#0d1f2d] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
                LinkedIn Syncing…
              </div>
            </div>
          </div>

          {/* Decorative glow behind card */}
          <div className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-40 bg-[radial-gradient(ellipse_at_center,#0d9488_0%,transparent_70%)] scale-75" />
        </div>
      </div>
    </section>
  );
}