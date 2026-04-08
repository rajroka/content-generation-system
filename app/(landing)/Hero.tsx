"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Zap,
  Image,
  Hash,
  FolderOpen,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────

const features = [
  {
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    title: "AI Caption Generation",
    description:
      "Generate scroll-stopping captions tailored to your platform and tone using our fine-tuned model trained on real viral posts.",
  },
  {
    icon: <Image className="w-5 h-5 text-primary" />,
    title: "Image Generation & Editing",
    description:
      "Create stunning visuals with DALL-E 3, or upload your own and remove the background instantly with one click.",
  },
  {
    icon: <Hash className="w-5 h-5 text-primary" />,
    title: "Smart Hashtag Engine",
    description:
      "Get 10–15 hashtags per post — a smart mix of broad, niche, and trending tags tuned for your target audience.",
  },
  {
    icon: <FolderOpen className="w-5 h-5 text-primary" />,
    title: "Content History",
    description:
      "All your generated content is saved and organized automatically. Search, reuse, and remix your best posts anytime.",
  },
  {
    icon: <Zap className="w-5 h-5 text-primary" />,
    title: "Tone & Platform Control",
    description:
      "Switch between casual, professional, or viral tones instantly. Output is formatted differently per platform.",
  },
  {
    icon: <FlaskConical className="w-5 h-5 text-primary" />,
    title: "Fine-tuned Model",
    description:
      "Our custom Phi-2 model — trained via QLoRA on real Instagram and YouTube data — writes like a human content creator.",
  },
];

const marqueeItems = [
  { icon: "✦", label: "AI Caption Generation" },
  { icon: "🎨", label: "DALL-E 3 Image Creation" },
  { icon: "⚡", label: "Instant Hashtag Sets" },
  { icon: "🔁", label: "Background Removal" },
  { icon: "📂", label: "Content History" },
  { icon: "🤖", label: "Fine-tuned on Real Posts" },
  { icon: "🌐", label: "Multi-Platform Ready" },
  { icon: "🔒", label: "Secure & Private" },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "For creators just getting started.",
    features: [
      "5 captions per day",
      "10 hashtag sets per month",
      "DALL-E image generation (3/day)",
      "Content history (last 7 days)",
      "Basic tone control",
    ],
    cta: "Get started free",
    popular: false,
    href: "/sign-up",
  },
  {
    name: "Pro",
    price: "$12",
    desc: "For creators serious about growth.",
    features: [
      "Unlimited captions",
      "Unlimited hashtag sets",
      "DALL-E image generation (20/day)",
      "Background removal",
      "Full content history",
      "Advanced tone & style control",
      "Fine-tuned model access",
      "Priority support",
    ],
    cta: "Start Pro",
    popular: true,
    href: "/sign-up?plan=pro",
  },
  {
    name: "Team",
    price: "$29",
    desc: "For agencies and content teams.",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "Shared content workspace",
      "API access",
      "Custom brand voice training",
      "Analytics dashboard",
      "Dedicated account manager",
    ],
    cta: "Contact us",
    popular: false,
    href: "/contact",
  },
];

const testimonials = [
  {
    stars: 5,
    quote:
      "I used to spend an hour writing captions. Now BanamSathi does it in 10 seconds. My engagement actually went up because the copy is genuinely better than what I was writing.",
    name: "Ankit Karmacharya",
    role: "Fashion Creator · 85K followers",
    initials: "AK",
    color: "bg-primary/10 text-primary",
  },
  {
    stars: 5,
    quote:
      "The fine-tuned model is the real deal. It doesn't sound like a robot — it actually sounds like someone who knows social media. Switched from three different tools to just this.",
    name: "Shraddha Rai",
    role: "Travel Blogger · 120K followers",
    initials: "SR",
    color: "bg-purple-500/10 text-purple-400",
  },
  {
    stars: 4,
    quote:
      "Running content for 4 clients at once — BanamSathi cut my workflow in half. The image generation + background removal combo alone saves me an hour a day.",
    name: "Prashant Maharjan",
    role: "Social Media Manager · Agency",
    initials: "PM",
    color: "bg-amber-500/10 text-amber-400",
  },
];

// ─── Component ───────────────────────────────────────────────

export default function LandingPage() {
  const doubledMarquee = [...marqueeItems, ...marqueeItems];

  return (
    <div className="flex flex-col bg-background relative  text-foreground">

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-28 pb-24 overflow-hidden">
        {/* Gradient glows */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-225 h-150 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(91,110,245,0.18)_0%,rgba(140,100,255,0.10)_40%,transparent_70%)]" />
        <div className="pointer-events-none absolute top-[55%] left-[35%] -translate-x-1/2 -translate-y-1/2 w-125 h-100 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(192,100,255,0.10)_0%,transparent_70%)]" />

        <Badge variant="secondary" className="mb-6 gap-1.5 text-xs tracking-widest uppercase">
          <Sparkles className="w-3 h-3" /> Powered by fine-tuned AI
        </Badge>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] max-w-3xl mb-5">
          Create smarter.{" "}
          <span className="bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Post faster.
          </span>
        </h1>

        <p className="text-muted-foreground text-lg max-w-md leading-relaxed mb-9">
          BanamSathi generates platform-ready captions, hashtags, and images for
          your social media — in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Button  size="lg" className="shadow-[0_0_32px_rgba(91,110,245,0.35)]">
            <Link href="/sign-up" className="flex items-center px-4 py-2  justify-center">
              Start for free <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button  variant="outline" size="lg" className="flex items-center px-4 py-2  justify-center">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 text-sm text-muted-foreground">
          {["No credit card required", "5 free captions daily", "Cancel anytime"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="relative overflow-hidden border-y border-border/50 bg-muted/20">
        {/* fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-background to-transparent z-10" />

        <div className="flex w-max animate-[marquee_28s_linear_infinite]">
          {doubledMarquee.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-9 py-4 text-sm text-muted-foreground border-r border-border/40 whitespace-nowrap"
            >
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
      {/* Add this to your globals.css or tailwind config:
          @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      */}

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-24 w-full">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-primary mb-3">Features</p>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Everything you need to go viral
        </h2>
        <p className="text-muted-foreground mb-12 max-w-lg">
          From generation to posting — one tool, zero friction.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card
              key={f.title}
              className="group border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="pt-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <div className="bg-muted/20 border-y border-border/50 w-full">
        <section id="pricing" className="max-w-6xl mx-auto px-4 py-24">
          <p className="text-xs font-semibold tracking-[0.12em] uppercase text-primary mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Simple, honest pricing
          </h2>
          <p className="text-muted-foreground mb-12 max-w-lg">
            Start free. Scale when you need to. No hidden fees.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col gap-6 rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "border-primary bg-linear-to-b from-primary/5 to-card shadow-[0_0_40px_rgba(91,110,245,0.15)]"
                    : "border-border/50 bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[0.65rem] font-bold tracking-widest uppercase px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/ mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                </div>

                <hr className="border-border/50" />

                <ul className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full ${plan.popular ? "shadow-[0_0_24px_rgba(91,110,245,0.3)]" : ""}`}
                >
                  <Link href={plan.href}>
                    {plan.cta} {plan.popular && <ArrowRight className="ml-1.5 w-4 h-4" />}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="max-w-6xl mx-auto px-4 py-24 w-full">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-primary mb-3">Testimonials</p>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Creators who get it
        </h2>
        <p className="text-muted-foreground mb-12 max-w-lg">
          Real people. Real results. No fluff.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-7 hover:border-primary/30 transition-colors duration-300"
            >
              <div className="text-amber-400 text-sm tracking-widest">
                {"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border/40">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

     
    </div>
  );
}


