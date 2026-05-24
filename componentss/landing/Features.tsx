import {
  BarChart3,
  CalendarCheck,
  Captions,
  Hash,
  ImageUp,
  Sparkles,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Send,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Captions,
    title: "AI-powered captions",
    desc: "Platform-aware copy for Instagram, LinkedIn, X, and more — tuned to your tone in seconds.",
  },
  {
    icon: Hash,
    title: "Smart hashtag sets",
    desc: "Balanced niche, broad, and campaign tags generated alongside every caption.",
  },
  {
    icon: CalendarCheck,
    title: "Visual post calendar",
    desc: "Schedule the whole week at once and see every upcoming post in one clean calendar view.",
  },
  {
    icon: ImageUp,
    title: "Media uploads",
    desc: "Attach images and videos to drafts and keep creative assets connected to each post.",
  },
  {
    icon: BarChart3,
    title: "Publishing analytics",
    desc: "See what was generated, scheduled, and published without complicated reporting screens.",
  },
  {
    icon: Sparkles,
    title: "Multi-platform in one go",
    desc: "Write once, tune per platform, and publish or schedule to all channels simultaneously.",
  },
];

const platforms = [
  { icon: Instagram, label: "Instagram", color: "text-pink-500" },
  { icon: Facebook,  label: "Facebook",  color: "text-blue-500" },
  { icon: Linkedin,  label: "LinkedIn",  color: "text-sky-600"  },
  { icon: Twitter,   label: "X",         color: "text-slate-800 dark:text-white" },
];

const queue = [
  { platform: "Instagram", time: "Today · 7:30 PM",    dot: "bg-pink-500"  },
  { platform: "LinkedIn",  time: "Tomorrow · 9:00 AM", dot: "bg-sky-600"   },
  { platform: "X",         time: "Friday · 12:15 PM",  dot: "bg-slate-700 dark:bg-white" },
];

export function Features() {
  return (
    <section id="features" className="bg-background px-5 py-20 text-foreground sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Workflow
          </p>
          <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            One calm place for the messy parts of posting.
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            PostSathi brings generation, scheduling, media, and history together so you can move from idea to published post without bouncing between tabs.
          </p>
        </div>

        {/* Dashboard mock */}
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden mb-16">

          {/* Window chrome */}
          <div className="flex items-center justify-between border-b border-border bg-muted px-5 py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div className="rounded-md bg-background px-4 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
              postsathi.app/generate
            </div>
            <div className="w-16" />
          </div>

          {/* Dashboard body */}
          <div className="grid lg:grid-cols-[1fr_320px]">

            {/* Left: composer */}
            <div className="p-8 border-b border-border lg:border-b-0 lg:border-r">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">New Campaign</p>
                  <h3 className="text-xl font-black text-foreground">Spring product launch</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-lg shadow-teal-900/20">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              {/* Prompt box */}
              <div className="rounded-xl border border-border bg-muted p-4 text-sm leading-6 text-muted-foreground mb-6">
                Launch our new content kit with a confident, useful tone. Mention templates, fast scheduling, and one workflow for every platform.
              </div>

              {/* Platform pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {platforms.map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">
                    <Icon className={`h-4 w-4 ${color}`} />
                    {label}
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                ))}
              </div>

              {/* Generated caption */}
              <div className="rounded-xl bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Generated caption</p>
                <p className="text-sm leading-6 text-white/80 dark:text-slate-600">
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

            {/* Right: queue */}
            <div className="bg-muted p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-black text-foreground">Publishing queue</p>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="space-y-3 mb-6">
                {queue.map((item) => (
                  <div key={item.platform} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                      <p className="text-sm font-bold text-foreground">{item.platform}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                ))}
              </div>

              <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 text-sm font-black text-slate-950 shadow-sm transition hover:bg-amber-300 active:scale-[0.98]">
                <Send className="h-4 w-4" />
                Schedule all
              </button>

              {/* Stats row */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: "Posts this week", value: "12" },
                  { label: "Platforms active", value: "4" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-2xl font-black text-foreground">{s.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group flex gap-4 rounded-2xl border border-border bg-card p-6 transition hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
