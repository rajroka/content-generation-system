import {
  BarChart3,
  CalendarCheck,
  Captions,
  FolderClock,
  Hash,
  ImageUp,
  LayoutDashboard,
  Network,
} from "lucide-react";

const features = [
  {
    icon: Captions,
    title: "Captions that match the channel",
    desc: "Generate platform-aware copy for short posts, visual captions, professional updates, and promotional launches.",
  },
  {
    icon: Hash,
    title: "Hashtags without guesswork",
    desc: "Get a balanced set of niche, broad, and campaign tags instead of recycling the same list every time.",
  },
  {
    icon: CalendarCheck,
    title: "Queue posts in minutes",
    desc: "Schedule drafts for the week and keep every upcoming post visible from one simple publishing calendar.",
  },
  {
    icon: ImageUp,
    title: "Media-ready workflows",
    desc: "Upload images and videos, attach them to drafts, and keep creative assets connected to each post.",
  },
  {
    icon: BarChart3,
    title: "Clear publishing analytics",
    desc: "See what was generated, scheduled, and published without digging through complicated reporting screens.",
  },
  {
    icon: FolderClock,
    title: "Reusable content history",
    desc: "Find past drafts, reuse strong ideas, and keep your best performing messages within reach.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-background px-5 py-20 text-foreground sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Workflow</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              One calm place for the messy parts of posting.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
            PostSathi brings generation, scheduling, media, and history together so you can move from idea to published post without bouncing between tabs.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <div className="border border-slate-200 bg-[hsl(194_54%_96%)] p-6 dark:border-white/10 dark:bg-white/[0.04] lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">Multi-platform composer</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Write once, then tune before publishing.</p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-4">
              {["Instagram", "Facebook", "LinkedIn", "X"].map((platform) => (
                <div key={platform} className="border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950">
                  <p className="text-sm font-bold text-slate-950 dark:text-white">{platform}</p>
                  <div className="mt-4 space-y-2">
                    <div className="h-2 rounded-full bg-teal-700/25" />
                    <div className="h-2 w-4/5 rounded-full bg-slate-200 dark:bg-white/15" />
                    <div className="h-2 w-2/3 rounded-full bg-slate-200 dark:bg-white/15" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 bg-slate-950 p-6 text-white dark:border-white/10">
            <LayoutDashboard className="h-6 w-6 text-amber-300" />
            <h3 className="mt-5 text-2xl font-black">Built for daily use</h3>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Fast forms, clear queues, direct actions, and no bloated dashboard rituals.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700/10 text-teal-700 dark:bg-teal-300/10 dark:text-teal-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-black text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
