import { Star } from "lucide-react";

const testimonials = [
  {
    photo: "https://i.pravatar.cc/120?img=47",
    name: "James Mitchell",
    role: "Fashion Creator",
    quote: "I used to spend an hour writing captions. Now PostSathi gets the first draft ready before my coffee cools.",
  },
  {
    photo: "https://i.pravatar.cc/120?img=32",
    name: "Sarah Holloway",
    role: "Travel Blogger",
    quote: "The platform-specific captions are the part I did not know I needed. LinkedIn and Instagram finally sound different.",
  },
  {
    photo: "https://i.pravatar.cc/120?img=25",
    name: "David Reeves",
    role: "Social Media Manager",
    quote: "Running content for several clients is less scattered now. Drafts, media, and schedules stay in one workflow.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-background px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Proof</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Creators use it when consistency matters.
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            <span className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </span>
            Loved by early users
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.name} className="border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
              <blockquote className="text-base font-semibold leading-8 text-slate-800 dark:text-slate-200">"{item.quote}"</blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.photo} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">{item.name}</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
