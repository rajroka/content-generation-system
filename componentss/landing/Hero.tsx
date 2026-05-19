"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";

const metrics = [
  { value: "4+", label: "social channels" },
  { value: "10s", label: "caption drafts" },
  { value: "24/7", label: "scheduled queue" },
];

export function Hero() {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-10 lg:py-20">

        {/* Left */}
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Create once.
            <span className="block text-teal-700 dark:text-teal-300">Post everywhere.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-400 sm:text-lg">
            PostSathi turns one idea into polished captions, hashtags, media-ready drafts, and scheduled posts for Instagram, Facebook, LinkedIn, and X.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 active:scale-[0.98]"
            >
              Start creating
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-bold text-foreground transition hover:border-teal-700/40 hover:bg-muted"
            >
              <Play className="h-4 w-4" />
              Open dashboard
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border bg-card text-center shadow-sm">
            {metrics.map((item) => (
              <div key={item.label} className="px-4 py-4">
                <p className="text-2xl font-black text-foreground">{item.value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-center">
          <Image
            src="/newheroimage.png"
            alt="PostSathi creator"
            width={520}
            height={580}
            priority
            className="w-full max-w-md drop-shadow-xl lg:max-w-lg"
          />
        </div>

      </div>
    </section>
  );
}
