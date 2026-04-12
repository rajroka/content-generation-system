"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero() {
  const highlights = ["No credit card required", "5 free captions daily", "Cancel anytime"];

  return (
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
        <Button size="lg" className="shadow-[0_0_32px_rgba(91,110,245,0.35)]" asChild>
          <Link href="/sign-up" className="flex items-center">
            Start for free <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/pricing">View pricing</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5 text-sm text-muted-foreground">
        {highlights.map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" /> {t}
          </span>
        ))}
      </div>
    </section>
  );
}