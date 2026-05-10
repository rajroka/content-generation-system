"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ImagePlus,
  Instagram,
  Linkedin,
  Play,
  Send,
  Sparkles,
  Twitter,
} from "lucide-react";

const metrics = [
  { value: "4+", label: "social channels" },
  { value: "10s", label: "caption drafts" },
  { value: "24/7", label: "scheduled queue" },
];

const queue = [
  { platform: "Instagram", time: "Today 7:30 PM", color: "bg-pink-500" },
  { platform: "LinkedIn", time: "Tomorrow 9:00 AM", color: "bg-blue-600" },
  { platform: "X", time: "Friday 12:15 PM", color: "bg-zinc-950 dark:bg-white" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[hsl(194_54%_96%)] text-slate-950 dark:bg-[hsl(222_47%_7%)] dark:text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(13,124,138,0.16),transparent_36%),radial-gradient(circle_at_80%_10%,rgba(245,158,11,0.18),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal-700/20 bg-white/70 px-3 py-1.5 text-xs font-semibold text-teal-800 shadow-sm backdrop-blur dark:border-teal-300/20 dark:bg-white/10 dark:text-teal-200">
            <Sparkles className="h-3.5 w-3.5" />
            Content planning for creators and small teams
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
            Create once.
            <span className="block text-teal-700 dark:text-teal-300">Post everywhere.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-700 sm:text-lg dark:text-slate-300">
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
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/70 px-6 text-sm font-bold text-slate-950 transition hover:border-teal-700/40 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              <Play className="h-4 w-4" />
              Open dashboard
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-slate-300/70 overflow-hidden rounded-lg border border-slate-300/70 bg-white/60 text-center shadow-sm backdrop-blur dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
            {metrics.map((item) => (
              <div key={item.label} className="px-4 py-4">
                <p className="text-2xl font-black text-slate-950 dark:text-white">{item.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-white/35 blur-3xl dark:bg-teal-400/10" />
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/12 dark:border-white/10 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="rounded-md bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                postsathi.app/generate
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-slate-200 p-5 dark:border-white/10 lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">New Campaign</p>
                    <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">Spring product launch</h2>
                  </div>
                  <div className="rounded-lg bg-teal-700 p-2 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                    Launch our new content kit with a confident, useful tone. Mention templates, fast scheduling, and one workflow for every platform.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Instagram, label: "Instagram", active: true },
                    { icon: Linkedin, label: "LinkedIn", active: true },
                    { icon: Twitter, label: "X", active: true },
                    { icon: ImagePlus, label: "Add media", active: false },
                  ].map(({ icon: Icon, label, active }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                        {label}
                      </span>
                      {active && <Check className="h-4 w-4 text-emerald-500" />}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-lg bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
                  <p className="text-sm font-bold">Generated caption</p>
                  <p className="mt-2 text-sm leading-6 text-white/75 dark:text-slate-700">
                    One launch, every channel covered. Build the post once, tune the voice, and let your schedule do the heavy lifting.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["#ContentMarketing", "#CreatorTools", "#LaunchDay"].map((tag) => (
                      <span key={tag} className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold dark:bg-slate-950/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-slate-950 dark:text-white">Publishing queue</p>
                  <CalendarDays className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                </div>

                <div className="mt-4 space-y-3">
                  {queue.map((item) => (
                    <div key={item.platform} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        <p className="text-sm font-bold text-slate-950 dark:text-white">{item.platform}</p>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
                    </div>
                  ))}
                </div>

                <button className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-amber-300">
                  <Send className="h-4 w-4" />
                  Schedule all
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
