const testimonials = [
  {
    photo: "https://i.pravatar.cc/120?img=47",
    name: "James Mitchell",
    role: "Fashion Creator",
    stars: 5,
    quote:
      "I used to spend an hour writing captions. Now PostSathi does it in 10 seconds and my engagement actually went up.",
  },
  {
    photo: "https://i.pravatar.cc/120?img=32",
    name: "Sarah Holloway",
    role: "Travel Blogger",
    stars: 5,
    quote:
      "The fine-tuned model doesn't sound like a robot — it sounds like someone who genuinely knows social media.",
  },
  {
    photo: "https://i.pravatar.cc/120?img=25",
    name: "David Reeves",
    role: "Social Media Manager",
    stars: 4,
    quote:
      "Running content for 4 clients at once — PostSathi cut my workflow in half. The image generation combo is a lifesaver.",
  },
  {
    photo: "https://i.pravatar.cc/120?img=9",
    name: "Emily Carter",
    role: "Lifestyle Creator",
    stars: 5,
    quote:
      "The hashtag suggestions alone are worth it. My reach jumped 30% within the first two weeks of using PostSathi.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mt-auto pt-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="w-3.5 h-3.5"
          viewBox="0 0 20 20"
          fill={i < count ? "#169B7F" : "none"}
          stroke={i < count ? "#169B7F" : "currentColor"}
          strokeWidth={1.5}
          style={{ color: i < count ? "#169B7F" : "#0A2E2E30" }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="w-full py-24 px-4 bg-[hsl(200_25%_94%)] dark:bg-[hsl(200_20%_9%)] transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <p
            className="text-xs font-semibold tracking-[0.14em] uppercase mb-4"
            style={{ color: "#169B7F" }}
          >
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-snug text-[#0A2E2E] dark:text-[hsl(200_20%_90%)]">
            We care about our creators'
            <br className="hidden sm:block" /> experience too
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-16">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative flex flex-col items-center text-center rounded-2xl pt-14 pb-7 px-6
                bg-white dark:bg-[hsl(200_15%_14%)]
                border border-[hsl(200_15%_87%)] dark:border-[hsl(200_15%_22%)]
                shadow-[0_2px_20px_rgba(10,46,46,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.25)]
                transition-colors duration-300"
            >
              {/* Avatar overflowing top */}
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2
                  w-20 h-20 rounded-full overflow-hidden
                  ring-4 ring-white dark:ring-[hsl(200_15%_14%)]
                  shadow-[0_4px_16px_rgba(22,155,127,0.20)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.photo}
                  alt={t.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name */}
              <p className="text-sm font-bold text-[#0A2E2E] dark:text-[hsl(200_20%_88%)] mb-1">
                {t.name}
              </p>

              {/* Role */}
              <p className="text-[0.68rem] text-[#0A2E2E80] dark:text-[hsl(200_10%_52%)] mb-4">
                {t.role}
              </p>

              {/* Accent line */}
              <div
                className="w-8 h-0.5 rounded-full mb-4"
                style={{ background: "#169B7F50" }}
              />

              {/* Quote */}
              <p className="text-xs leading-relaxed text-[#0A2E2EAA] dark:text-[hsl(200_10%_62%)]">
                "{t.quote}"
              </p>

              {/* Stars */}
              <Stars count={t.stars} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}