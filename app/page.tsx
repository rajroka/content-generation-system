import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Sparkles, Zap, BarChart3, Clock, Hash, ImageIcon, Type } from "lucide-react";
import AuthButtons from "./components/auth-buttons";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-400" size={24} />
          <span className="text-white font-bold text-xl">BanamSathi</span>
        </div>
        <AuthButtons />
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-purple-300 text-sm font-medium">
            AI-Powered Content Generation
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Create Viral Social Media
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Content in Seconds
          </span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          BanamSathi uses AI to generate platform-specific captions, trending
          hashtags, viral titles, and stunning images — all in one place.
          Save hours every day.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <SignedOut>
            <Link
              href="/sign-up"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-xl shadow-purple-500/25"
            >
              Start Generating Free →
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold"
            >
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-24 w-full max-w-4xl">
          {[
            {
              icon: Type,
              title: "AI Captions",
              desc: "Platform-specific captions tailored to your tone and audience",
              color: "text-blue-400",
            },
            {
              icon: Hash,
              title: "Smart Hashtags",
              desc: "15 strategically ranked hashtags — broad, medium, and niche",
              color: "text-purple-400",
            },
            {
              icon: Zap,
              title: "Viral Titles",
              desc: "5 scroll-stopping title variations for maximum engagement",
              color: "text-yellow-400",
            },
            {
              icon: ImageIcon,
              title: "AI Images",
              desc: "DALL-E generated visuals stored permanently for your use",
              color: "text-pink-400",
            },
            {
              icon: BarChart3,
              title: "Analytics Dashboard",
              desc: "Track content patterns, top hashtags, and platform usage",
              color: "text-green-400",
            },
            {
              icon: Clock,
              title: "Posting Schedule",
              desc: "AI-suggested best posting times per platform",
              color: "text-orange-400",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-xl p-5 text-left hover:bg-white/10 transition"
            >
              <f.icon className={`${f.color} mb-3`} size={22} />
              <h3 className="text-white font-semibold mb-1">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Platforms */}
        <div className="mt-20">
          <p className="text-white/40 text-sm mb-4">Supports all major platforms</p>
          <div className="flex gap-3 flex-wrap justify-center">
            {["Instagram", "Twitter / X", "LinkedIn", "Facebook", "TikTok"].map(
              (p) => (
                <span
                  key={p}
                  className="bg-white/10 text-white/70 px-4 py-2 rounded-full text-sm border border-white/10"
                >
                  {p}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
