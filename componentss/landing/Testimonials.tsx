import { Star } from "lucide-react";

const testimonials = [
  {
    photo: "https://i.pravatar.cc/120?img=47",
    name: "James Mitchell",
    handle: "@james_mitchell",
    rating: 4.9,
    quote:
      "I used to spend an hour writing captions. Now PostSathi gets the first draft ready before my coffee cools. The platform-specific tone is spot on every time.",
  },
  {
    photo: "https://i.pravatar.cc/120?img=32",
    name: "Sarah Holloway",
    handle: "@sarah_travels",
    rating: 4.9,
    quote:
      "The platform-specific captions are the part I did not know I needed. LinkedIn and Instagram finally sound different — and I didn't have to rewrite anything.",
  },
  {
    photo: "https://i.pravatar.cc/120?img=25",
    name: "David Reeves",
    handle: "@david_smm",
    rating: 4.9,
    quote:
      "Running content for several clients is less scattered now. Drafts, media, and schedules stay in one workflow. It's the calmest my content process has ever been.",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-[hsl(194_54%_96%)] px-5 py-20 sm:px-8 lg:px-10 lg:py-28 dark:bg-[hsl(222_47%_7%)]"
    >
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Our trusted{" "}
            <span className="inline-block rounded-lg bg-teal-700 px-3 py-1 text-white dark:bg-teal-600">
              Clients
            </span>
          </h2>
          <p className="mt-5 text-sm leading-7 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Real people. Real results. No fluff.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-3 md:items-center">
          {testimonials.map((item, i) => (
            <figure
              key={item.name}
              style={{
                transform:
                  i === 0 ? "rotate(-2.5deg)" :
                  i === 2 ? "rotate(2.5deg)" :
                  "scale(1.03)",
              }}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform dark:border-white/10 dark:bg-white/[0.04]"
            >
              {/* Top: avatar + rating */}
              <div className="flex items-start justify-between mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.photo}
                  alt={item.name}
                  className="h-12 w-12 rounded-xl object-cover ring-2 ring-teal-700/20 dark:ring-teal-300/20"
                />
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <span>{item.rating}</span>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
              </div>

              {/* Quote */}
              <blockquote className="flex-1 text-sm leading-7 text-slate-600 dark:text-slate-300 mb-6">
                "{item.quote}"
              </blockquote>

              {/* Name + handle */}
              <figcaption>
                <p className="text-sm font-black text-slate-950 dark:text-white">{item.name}</p>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{item.handle}</p>
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </section>
  );
}
