"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const platforms = [
  {
    name: "Instagram",
    color: "#E1306C",
    bg: "#fce4ec",
    darkBg: "#3d1a24",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    color: "#0A66C2",
    bg: "#e3f0fb",
    darkBg: "#0d2340",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    color: "#1877F2",
    bg: "#e7f0fd",
    darkBg: "#0d1f3c",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.883v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "X",
    color: "#000000",
    bg: "#f0f0f0",
    darkBg: "#1a1a1a",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

const stats = [
  { value: "4+", label: "Platforms" },
  { value: "10s", label: "To generate" },
  { value: "Free", label: "To start" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-background overflow-hidden px-5 sm:px-8 md:px-12 lg:px-16 py-24 lg:py-0 transition-colors duration-300">

      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle, #0d9488 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Radial glow top-right */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#0d9488] opacity-[0.06] dark:opacity-[0.08] blur-[120px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">

        {/* ── LEFT ── */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">

          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 border border-[#0d9488]/20 text-[#0d7c8a] dark:text-[#2dd4bf] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
            AI-powered content, published instantly
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.6rem,6.5vw,5rem)] font-black leading-[1.05] tracking-tight text-foreground mb-5">
            Your content,{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#0d9488]">everywhere</span>
              <span
                className="absolute bottom-1 left-0 w-full h-[6px] rounded-full opacity-30"
                style={{ background: "#0d9488" }}
              />
            </span>
            {" "}at once.
          </h1>

          {/* Sub */}
          <p className="text-muted-foreground text-base md:text-[17px] leading-relaxed max-w-[440px] mb-9">
            Write a topic. Pick your platforms. Get a polished caption, hashtags, and visuals — then post or schedule in one click.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-10">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-[#0d7c8a] hover:bg-[#0b6b78] text-white font-bold px-7 h-12 rounded-xl text-sm transition-all shadow-lg shadow-[#0d9488]/20 active:scale-95"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center border border-border hover:border-[#0d9488]/40 hover:bg-[#0d9488]/5 text-foreground font-semibold px-7 h-12 rounded-xl text-sm transition-all"
            >
              Sign in
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 sm:gap-8">
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6 sm:gap-8">
                <div className="text-center lg:text-left">
                  <p className="text-xl font-black text-foreground leading-none">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{s.label}</p>
                </div>
                {i < stats.length - 1 && (
                  <div className="w-px h-8 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT — App mockup ── */}
        <div className="relative flex justify-center lg:justify-end">

          {/* Glow behind card */}
          <div className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-20 dark:opacity-15 bg-[radial-gradient(ellipse_at_center,#0d9488_0%,transparent_65%)]" />

          <div className="w-full max-w-[460px] rounded-2xl border border-border bg-card shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.4)] overflow-hidden">

            {/* Browser bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-muted/60 border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <div className="ml-3 flex-1 h-5 bg-background/80 rounded-md text-[10px] text-muted-foreground flex items-center px-2.5 font-mono">
                app.contentai.io/generate
              </div>
            </div>

            <div className="p-5 space-y-4">

              {/* Topic input */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Topic</p>
                <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3.5 py-2.5">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 bg-muted rounded-full w-3/4" />
                  </div>
                  <div className="shrink-0 bg-[#0d7c8a] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
                    </svg>
                    Generate
                  </div>
                </div>
              </div>

              {/* Platform pills */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Publish to</p>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border"
                      style={{
                        color: p.color,
                        borderColor: `${p.color}30`,
                        backgroundColor: `${p.color}12`,
                      }}
                    >
                      <span style={{ color: p.color }}>{p.svg}</span>
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption preview */}
              <div className="bg-muted/40 border border-border rounded-xl p-3.5 space-y-2">
                <div className="h-2 bg-muted rounded-full w-full" />
                <div className="h-2 bg-muted rounded-full w-5/6" />
                <div className="h-2 bg-muted rounded-full w-4/6" />
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {["#growth", "#marketing", "#ai"].map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold text-[#0d9488] bg-[#0d9488]/10 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="flex gap-2 pt-1">
                <div className="flex-1 h-9 bg-muted/50 border border-border rounded-xl flex items-center px-3 gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-muted-foreground">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <div className="h-2 bg-muted rounded-full w-24" />
                </div>
                <div className="h-9 bg-[#0d7c8a] text-white text-[11px] font-bold px-4 rounded-xl flex items-center gap-1.5 shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                  Post Now
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
