const platforms = [
  {
    label: "Facebook",
    src: "https://cdn.simpleicons.org/facebook/1877F2",
    darkSrc: "https://cdn.simpleicons.org/facebook/ffffff",
  },
  {
    label: "Instagram",
    src: "https://cdn.simpleicons.org/instagram/E1306C",
    darkSrc: "https://cdn.simpleicons.org/instagram/E1306C",
  },
  {
    label: "X (Twitter)",
    src: "https://cdn.simpleicons.org/x/000000",
    darkSrc: "https://cdn.simpleicons.org/x/ffffff",
  },
  {
    label: "YouTube",
    src: "https://cdn.simpleicons.org/youtube/FF0000",
    darkSrc: "https://cdn.simpleicons.org/youtube/FF0000",
  },
  {
    label: "TikTok",
    src: "https://cdn.simpleicons.org/tiktok/000000",
    darkSrc: "https://cdn.simpleicons.org/tiktok/ffffff",
  },
  {
    label: "Threads",
    src: "https://cdn.simpleicons.org/threads/000000",
    darkSrc: "https://cdn.simpleicons.org/threads/ffffff",
  },
  {
    label: "Telegram",
    src: "https://cdn.simpleicons.org/telegram/26A5E4",
    darkSrc: "https://cdn.simpleicons.org/telegram/26A5E4",
  },
  {
    label: "Snapchat",
    src: "https://cdn.simpleicons.org/snapchat/FFFC00",
    darkSrc: "https://cdn.simpleicons.org/snapchat/FFFC00",
  },
  {
    label: "WhatsApp",
    src: "https://cdn.simpleicons.org/whatsapp/25D366",
    darkSrc: "https://cdn.simpleicons.org/whatsapp/25D366",
  },
];

export function SocialConnect() {
  return (
    <section className="bg-background px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-[hsl(194_54%_96%)] px-8 py-8 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="mb-6 text-center text-2xl font-semibold italic text-slate-700 dark:text-slate-300" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            Connect your favorite accounts
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {platforms.map(({ label, src, darkSrc }) => (
              <div
                key={label}
                title={label}
                className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md dark:border-white/10 dark:bg-white/[0.06]"
              >
                {/* light mode icon */}
                <img
                  src={src}
                  alt={label}
                  width={22}
                  height={22}
                  className="block dark:hidden"
                  loading="lazy"
                />
                {/* dark mode icon */}
                <img
                  src={darkSrc}
                  alt={label}
                  width={22}
                  height={22}
                  className="hidden dark:block"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
