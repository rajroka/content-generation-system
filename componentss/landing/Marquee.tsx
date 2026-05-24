import { Hash, Image, PenLine, Wand2 } from "lucide-react";

const marqueeItems = [
  { icon: PenLine, label: "AI caption writing" },
  { icon: Wand2, label: "Image generation" },
  { icon: Hash, label: "Hashtag sets" },
  { icon: Image, label: "Media uploads" },
];

export function Marquee() {
  const doubledMarquee = [...marqueeItems, ...marqueeItems];

  return (
    <div className="relative overflow-hidden border-y border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent dark:from-slate-950" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent dark:from-slate-950" />

      <div className="flex w-max animate-[marquee_30s_linear_infinite]">
        {doubledMarquee.map(({ icon: Icon, label }, i) => (
          <div
            key={`${label}-${i}`}
            className="flex items-center gap-2.5 border-r border-slate-200 px-9 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap dark:border-white/10 dark:text-slate-300"
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
