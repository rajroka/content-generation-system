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

export function Marquee() {
  const doubledMarquee = [...marqueeItems, ...marqueeItems];

  return (
    <div className="relative overflow-hidden border-y border-border/50 bg-muted/20">
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
  );
}