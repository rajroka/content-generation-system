"use client";

import { Sparkles, BarChart3, ImageUp, CheckCircle2, Clock, Send } from "lucide-react";

// Platform icons with circular backgrounds matching the image
const platforms = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="url(#ig-f)">
        <defs>
          <linearGradient id="ig-f" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F58529"/>
            <stop offset="50%" stopColor="#DD2A7B"/>
            <stop offset="100%" stopColor="#8134AF"/>
          </linearGradient>
        </defs>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    bg: "bg-white dark:bg-zinc-900 shadow-md",
    pos: "top-[10%] left-[8%]",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    bg: "bg-white dark:bg-zinc-900 shadow-md",
    pos: "top-[28%] left-[30%]",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-foreground" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    bg: "bg-zinc-900 dark:bg-zinc-800 shadow-md",
    pos: "top-[10%] right-[8%]",
    white: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.883v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
    bg: "bg-white dark:bg-zinc-900 shadow-md",
    pos: "top-[28%] right-[30%]",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
      </svg>
    ),
    bg: "bg-zinc-900 dark:bg-zinc-800 shadow-md",
    pos: "bottom-[18%] left-[4%]",
    white: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    bg: "bg-white dark:bg-zinc-900 shadow-md",
    pos: "top-[0%] left-[44%]",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-background px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Powerful <span className="font-black">Features.</span> Simple <span className="font-black">Control.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
            Everything you need to schedule, generate, analyze, and manage your social media in one smart dashboard.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1 — Multi-Platform Scheduling */}
          <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6 flex flex-col gap-3 overflow-hidden">
            <div>
              <h3 className="text-base font-bold text-foreground">Multi-Platform Scheduling</h3>
              <p className="text-sm text-muted-foreground mt-1">Schedule, manage, and publish content across all platforms</p>
            </div>
            {/* Arc with concentric circles and platform icons */}
            <div className="relative flex-1 flex items-end justify-center min-h-[180px]">
              {/* Concentric half-circles */}
              <svg viewBox="0 0 280 160" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMax meet">
                <path d="M20,155 A120,120 0 0,1 260,155" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"/>
                <path d="M45,155 A95,95 0 0,1 235,155"  fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"/>
                <path d="M70,155 A70,70 0 0,1 210,155"   fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"/>
                <path d="M95,155 A45,45 0 0,1 185,155"   fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"/>
                {/* Lines from center to icons */}
                <line x1="140" y1="155" x2="30"  y2="50"  stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"/>
                <line x1="140" y1="155" x2="90"  y2="25"  stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"/>
                <line x1="140" y1="155" x2="140" y2="10"  stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"/>
                <line x1="140" y1="155" x2="190" y2="25"  stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"/>
                <line x1="140" y1="155" x2="250" y2="50"  stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"/>
              </svg>

              {/* Platform icon circles */}
              {/* Instagram — far left */}
              <div className="absolute top-[22%] left-[4%] w-10 h-10 rounded-full bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="url(#ig-arc)">
                  <defs>
                    <linearGradient id="ig-arc" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F58529"/>
                      <stop offset="50%" stopColor="#DD2A7B"/>
                      <stop offset="100%" stopColor="#8134AF"/>
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
              {/* YouTube — mid left */}
              <div className="absolute top-[42%] left-[22%] w-10 h-10 rounded-full bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              {/* TikTok — top center */}
              <div className="absolute top-[2%] left-[44%] w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 shadow-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </div>
              {/* X — mid right */}
              <div className="absolute top-[42%] right-[22%] w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 shadow-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              {/* Facebook — far right */}
              <div className="absolute top-[22%] right-[4%] w-10 h-10 rounded-full bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.883v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              </div>
              {/* TikTok bottom left */}
              <div className="absolute bottom-[12%] left-[2%] w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 shadow-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2 — Analytics */}
          <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Analytics & Reports</h3>
              <p className="text-sm text-muted-foreground mt-1">Real-time follower count</p>
            </div>
            <div className="flex-1 relative min-h-[120px]">
              <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,70 C20,65 40,60 60,50 C80,40 90,55 110,42 C130,30 150,18 170,12 C185,8 195,7 200,6" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M0,70 C20,65 40,60 60,50 C80,40 90,55 110,42 C130,30 150,18 170,12 C185,8 195,7 200,6 L200,80 L0,80 Z" fill="url(#chart-fill)"/>
                <circle cx="200" cy="6" r="4" fill="var(--color-primary)"/>
              </svg>
              <div className="absolute top-1 right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                +100 followers
              </div>
            </div>
          </div>

          {/* Card 3 — Media Upload */}
          <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Media Upload</h3>
              <p className="text-sm text-muted-foreground mt-1">Upload images and videos to attach to your posts</p>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 text-center flex flex-col items-center gap-2">
                <ImageUp className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Choose Media</p>
              </div>
              {[
                { name: "product_launch.jpg", progress: 100 },
                { name: "promo_video.mp4",    progress: 65  },
              ].map((f) => (
                <div key={f.name} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                    <ImageUp className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                    <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${f.progress}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{f.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4 — Caption Generator (wide) */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Caption Generator</h3>
              <p className="text-sm text-muted-foreground mt-1">Write better captions faster using our fine-tuned Phi-2 model</p>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Write a catchy caption for a new product launch on Instagram, focusing on excitement and urgency
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition">
                  <Sparkles className="h-4 w-4" />
                  Generate Caption
                </button>
                {["Professional", "Casual", "Inspirational"].map((tone) => (
                  <span key={tone} className="text-xs border border-border rounded-lg px-2.5 py-1 text-muted-foreground font-medium">
                    {tone}
                  </span>
                ))}
              </div>
              <div className="rounded-xl bg-muted/50 border border-border p-3 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-relaxed">
                  🚀 Big news! Our latest product is here and it's everything you've been waiting for. Don't miss out — limited stock available. Tap the link in bio to grab yours now!{" "}
                  <span className="text-primary">#ProductLaunch #NewArrival #MustHave</span>
                </p>
              </div>
            </div>
          </div>

          {/* Card 5 — Content Calendar */}
          <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Content Calendar</h3>
              <p className="text-sm text-muted-foreground mt-1">Visualize and manage your entire posting schedule</p>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="grid grid-cols-7 gap-1 text-center">
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <span key={i} className="text-[10px] font-bold text-muted-foreground">{d}</span>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <div
                    key={d}
                    className={`text-[11px] rounded-md py-0.5 font-medium ${
                      [3, 7, 12, 18, 24, 28].includes(d)
                        ? "bg-primary text-white"
                        : [10, 15, 22].includes(d)
                        ? "bg-amber-400 text-slate-950"
                        : "text-muted-foreground"
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />Published
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />Scheduled
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
