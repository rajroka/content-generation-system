// Features section — clean bento layout, real SVG icons, no generic AI copy

const teal = "#0d7c8a";

// ── Custom SVG icons (crisp, recognisable) ────────────────────────────────────

const IconPlatforms = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M7 8h2M7 11h5" />
    <circle cx="17" cy="9.5" r="2.5" />
  </svg>
);

const IconSchedule = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

const IconCaption = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const IconHashtag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
  </svg>
);

const IconMedia = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const IconAnalytics = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);

const IconHistory = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 12a9 9 0 109-9 9 9 0 00-9 9" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l3 3" />
  </svg>
);

// ── Icon wrapper ──────────────────────────────────────────────────────────────

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `${teal}14`, border: `1.5px solid ${teal}28`, color: teal }}
    >
      {children}
    </div>
  );
}

// ── Platform logos (inline SVG, real brand colours) ───────────────────────────

const PlatformBadges = () => (
  <div className="flex flex-wrap gap-2 mt-4">
    {[
      {
        name: "Instagram",
        color: "#E1306C",
        svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
      },
      {
        name: "Facebook",
        color: "#1877F2",
        svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.883v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>,
      },
      {
        name: "LinkedIn",
        color: "#0A66C2",
        svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
      },
      {
        name: "X",
        color: "#000",
        svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
      },
    ].map((p) => (
      <span
        key={p.name}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border"
        style={{ color: p.color, borderColor: `${p.color}30`, background: `${p.color}10` }}
      >
        {p.svg} {p.name}
      </span>
    ))}
  </div>
);

// ── Schedule mini-calendar ────────────────────────────────────────────────────

const MiniCalendar = () => {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const active = [2, 4]; // Wed, Fri highlighted
  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-colors"
            style={
              active.includes(i)
                ? { background: teal, color: "#fff" }
                : { background: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.35)" }
            }
          >
            {d}
          </div>
        ))}
      </div>
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold"
        style={{ background: `${teal}12`, color: teal, border: `1px solid ${teal}20` }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: teal }} />
        Best time: Wednesday 7 PM
      </div>
    </div>
  );
};

// ── Card base styles ──────────────────────────────────────────────────────────

const card = "bg-white dark:bg-[hsl(200_15%_13%)] border border-[hsl(200_15%_88%)] dark:border-[hsl(200_15%_20%)] rounded-2xl p-6 flex flex-col gap-3 shadow-[0_2px_16px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors duration-300";

// ── Small feature data ────────────────────────────────────────────────────────

const small = [
  {
    Icon: <IconCaption />,
    title: "AI Caption Writing",
    desc: "Tone-matched captions for every platform — punchy for X, professional for LinkedIn, visual for Instagram.",
  },
  {
    Icon: <IconHashtag />,
    title: "Smart Hashtags",
    desc: "A curated mix of broad, niche, and trending tags generated per post. No more copy-pasting the same 30.",
  },
  {
    Icon: <IconMedia />,
    title: "Photo & Video Upload",
    desc: "Drag in images or videos. They're stored on a CDN and attached to your post automatically.",
  },
  {
    Icon: <IconAnalytics />,
    title: "Post Analytics",
    desc: "Track what you've published, when, and to which platforms. Simple numbers, no dashboard overload.",
  },
  {
    Icon: <IconHistory />,
    title: "Content History",
    desc: "Every draft, scheduled post, and published piece saved and searchable. Reuse anything in one click.",
  },
];

// ── Main export ───────────────────────────────────────────────────────────────

export function Features() {
  return (
    <section
      id="features"
      className="w-full py-20 md:py-28 px-4 bg-[hsl(200_22%_95%)] dark:bg-[hsl(200_18%_8%)] transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12 md:mb-14">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-3" style={{ color: teal }}>
            What's inside
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-snug text-foreground max-w-xl">
            Less tab-switching.<br />More actual posting.
          </h2>
          <p className="text-muted-foreground text-base mt-3 max-w-md leading-relaxed">
            Everything a solo creator or small team needs to stay consistent across platforms — without the agency price tag.
          </p>
        </div>

        {/* Row 1 — two wide cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* Multi-platform */}
          <div className={card}>
            <IconBox><IconPlatforms /></IconBox>
            <div>
              <h3 className="font-bold text-[15px] text-foreground mb-1">Publish to 4+ platforms at once</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect Instagram, Facebook, LinkedIn, and X. Write once, post everywhere — or customise per platform before sending.
              </p>
            </div>
            <PlatformBadges />
          </div>

          {/* Scheduler */}
          <div className={card}>
            <IconBox><IconSchedule /></IconBox>
            <div>
              <h3 className="font-bold text-[15px] text-foreground mb-1">Schedule posts for the right moment</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pick a date and time, or save as a draft and come back later. Your queue stays organised so you never miss a window.
              </p>
            </div>
            <MiniCalendar />
          </div>

        </div>

        {/* Row 2 — 3 equal small cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {small.slice(0, 3).map(({ Icon, title, desc }) => (
            <div key={title} className={card}>
              <IconBox>{Icon}</IconBox>
              <h3 className="font-bold text-[15px] text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Row 3 — 2 cards centred */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-2/3">
          {small.slice(3).map(({ Icon, title, desc }) => (
            <div key={title} className={card}>
              <IconBox>{Icon}</IconBox>
              <h3 className="font-bold text-[15px] text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
