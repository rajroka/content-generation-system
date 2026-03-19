import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import AuthButtons from "./components/auth-buttons";

const FEATURES = [
  { num: "01", title: "AI Captions",    desc: "Platform-specific captions tuned to your tone. Not generic filler.",             tag: "Text"       },
  { num: "02", title: "Smart Hashtags", desc: "15 ranked hashtags — broad, medium, and niche for maximum reach.",                tag: "Discovery"  },
  { num: "03", title: "Viral Titles",   desc: "5 scroll-stopping title variations engineered for curiosity and click-through.",  tag: "Engagement" },
  { num: "04", title: "AI Images",      desc: "DALL-E 3 visuals generated on demand and stored permanently. Yours to keep.",     tag: "Visual"     },
  { num: "05", title: "Analytics",      desc: "Track content patterns, top hashtags, and platform performance over time.",       tag: "Insights"   },
  { num: "06", title: "Post Timing",    desc: "AI-suggested optimal posting windows per platform based on audience data.",       tag: "Scheduling" },
];

const STATS = [
  { num: "5",    label: "platforms"       },
  { num: "<10s", label: "per generation"  },
  { num: "15",   label: "hashtags ranked" },
  { num: "5",    label: "title variants"  },
];

const PLATFORMS = ["Instagram", "Twitter / X", "LinkedIn", "Facebook", "TikTok"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#ede9e1] relative overflow-hidden">

      {/* Dot grid texture */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #1e1e1e 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Accent glow blob */}
      <div
        className="fixed -top-48 -left-24 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(184,255,0,0.04) 0%, transparent 65%)" }}
      />

      <div className="relative z-10">

        {/* ── Nav ── */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-8 md:px-12 py-5 border-b border-[#1c1c1c] bg-[#080808]/85 backdrop-blur-md">
          <Link
            href="/"
            className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight text-[#ede9e1]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span className="w-[7px] h-[7px] rounded-full bg-[#b8ff00] shrink-0" />
            BanamSathi
          </Link>

          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {[
              ["#features",  "Features"],
              ["#platforms", "Platforms"],
              ["/pricing",   "Pricing"],
              ["/docs",      "Docs"],
            ].map(([href, label]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-[13px] font-medium text-[#4a4a4a] hover:text-[#ede9e1] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <AuthButtons />
        </nav>

        {/* ── Hero ── */}
        <section className="max-w-[1200px] mx-auto px-8 md:px-12 pt-24 pb-16">
          {/* Eyebrow */}
          <div className="flex items-center gap-2.5 mb-8">
            <span className="w-6 h-px bg-[#b8ff00] opacity-60" />
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#b8ff00]">
              AI Content Platform
            </span>
          </div>

          <h1
            className="text-[clamp(52px,7.5vw,96px)] font-extrabold leading-[0.93] text-[#ede9e1] mb-6 max-w-[820px]"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-4px" }}
          >
            Write less.
            <span className="block text-[#b8ff00]">Post smarter.</span>
          </h1>

          <p className="text-[16px] leading-[1.75] text-[#4a4a4a] max-w-[420px] mb-10 font-light">
            BanamSathi generates platform-ready captions, ranked hashtags,
            viral titles, and AI images — everything you need to post, in seconds.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <SignedOut>
              <Link
                href="/sign-up"
                className="bg-[#b8ff00] text-[#080808] px-6 py-3 rounded-[5px] text-[14px] font-bold tracking-wide hover:-translate-y-px hover:opacity-90 transition-all"
              >
                Start for free →
              </Link>
              <Link
                href="/sign-in"
                className="text-[#4a4a4a] px-6 py-3 rounded-[5px] text-[14px] font-medium border border-[#1c1c1c] hover:border-[#2e2e2e] hover:text-[#ede9e1] transition-all"
              >
                Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="bg-[#b8ff00] text-[#080808] px-6 py-3 rounded-[5px] text-[14px] font-bold tracking-wide hover:-translate-y-px hover:opacity-90 transition-all"
              >
                Open dashboard →
              </Link>
            </SignedIn>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <div className="border-t border-b border-[#1c1c1c] px-8 md:px-12">
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-[#1c1c1c]">
            {STATS.map((s) => (
              <div key={s.num} className="py-7 px-6 first:pl-0">
                <div
                  className="text-[28px] font-extrabold leading-none text-[#ede9e1] mb-1"
                  style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-1.5px" }}
                >
                  {s.num}
                </div>
                <div className="text-[11px] text-[#4a4a4a] tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <section id="features" className="max-w-[1200px] mx-auto px-8 md:px-12 py-20">
          <div className="flex items-center gap-4 mb-10">
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#252525]">
              What it does
            </span>
            <span className="flex-1 h-px bg-[#1c1c1c]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border border-[#1c1c1c] rounded-[10px] overflow-hidden gap-px bg-[#1c1c1c]">
            {FEATURES.map((f) => (
              <div
                key={f.num}
                className="bg-[#080808] hover:bg-[#0d0d0d] transition-colors px-7 py-8 cursor-default"
              >
                <div
                  className="text-[10px] font-bold tracking-[0.1em] text-[#252525] mb-5"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {f.num}
                </div>
                <div
                  className="text-[16px] font-bold text-[#ede9e1] mb-2.5"
                  style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.3px" }}
                >
                  {f.title}
                </div>
                <p className="text-[13px] leading-[1.7] text-[#4a4a4a] font-light mb-5">
                  {f.desc}
                </p>
                <div className="flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.12em] uppercase text-[#b8ff00] opacity-60">
                  <span className="w-3 h-px bg-current" />
                  {f.tag}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Platforms ── */}
        <section id="platforms" className="max-w-[1200px] mx-auto px-8 md:px-12 pb-20">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#252525]">
              Works on
            </span>
            <span className="flex-1 h-px bg-[#1c1c1c]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map((p) => (
              <span
                key={p}
                className="text-[12px] font-medium text-[#4a4a4a] px-4 py-2 border border-[#1c1c1c] rounded-[3px] hover:border-[#2e2e2e] hover:text-[#ede9e1] transition-all cursor-default"
              >
                {p}
              </span>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-[#1c1c1c] px-8 md:px-12 py-5 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] text-[#252525]">© 2025 BanamSathi</span>
          <span className="text-[11px] text-[#252525]">Built for creators who move fast.</span>
        </footer>

      </div>
    </div>
  );
}