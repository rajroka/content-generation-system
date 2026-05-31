"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const metrics = [
  { value: "4+", label: "social channels" },
  { value: "10s", label: "captions" },
  { value: "24/7", label: "scheduled queue" },
];

export function Hero() {
  const { isSignedIn, user } = useUser();
  const isAdmin =
    isSignedIn &&
    (user?.publicMetadata as { role?: string })?.role === "admin";

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-20">

        {/* Left */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-7xl">
            Create once.
            <span className="block text-foreground">Post everywhere.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-400 sm:text-lg">
            PostSathi turns one idea into polished captions, hashtags, media-ready posts, and scheduled content for Instagram, Facebook, YouTube, and TikTok.
          </p>

          <div className="mt-8 flex flex-col gap-3 w-full sm:flex-row sm:w-auto">
            {!isAdmin && (
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 active:scale-[0.98]"
              >
                Start creating
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href={isAdmin ? "/admin" : "/sign-in"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-bold text-foreground transition hover:border-teal-700/40 hover:bg-muted"
            >
              <Play className="h-4 w-4" />
              {isAdmin ? "Admin Panel" : "Open dashboard"}
            </Link>
          </div>

          <div className="mt-10 grid w-full max-w-sm grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border bg-card text-center shadow-sm sm:max-w-lg">
            {metrics.map((item) => (
              <div key={item.label} className="px-3 py-4 sm:px-4">
                <p className="text-xl font-black text-foreground sm:text-2xl">{item.value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-center order-first lg:order-last">
          <Image
            src="/newheroimage.png"
            alt="PostSathi creator"
            width={520}
            height={580}
            priority
            className="w-full max-w-xs drop-shadow-xl sm:max-w-sm lg:max-w-lg"
          />
        </div>

      </div>
    </section>
  );
}
