const testimonials = [
  {
    stars: 5,
    quote: "I used to spend an hour writing captions. Now BanamSathi does it in 10 seconds. My engagement actually went up.",
    name: "Ankit Karmacharya",
    role: "Fashion Creator · 85K followers",
    initials: "AK",
    color: "bg-primary/10 text-primary",
  },
  {
    stars: 5,
    quote: "The fine-tuned model is the real deal. It doesn't sound like a robot — it actually sounds like someone who knows social media.",
    name: "Shraddha Rai",
    role: "Travel Blogger · 120K followers",
    initials: "SR",
    color: "bg-purple-500/10 text-purple-400",
  },
  {
    stars: 4,
    quote: "Running content for 4 clients at once — BanamSathi cut my workflow in half. The image generation combo saves me an hour a day.",
    name: "Prashant Maharjan",
    role: "Social Media Manager · Agency",
    initials: "PM",
    color: "bg-amber-500/10 text-amber-400",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="max-w-6xl mx-auto px-4 py-24 w-full">
      <p className="text-xs font-semibold tracking-[0.12em] uppercase text-primary mb-3">Testimonials</p>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Creators who get it</h2>
      <p className="text-muted-foreground mb-12 max-w-lg">Real people. Real results. No fluff.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div key={t.name} className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-7 hover:border-primary/30 transition-colors duration-300">
            <div className="text-amber-400 text-sm tracking-widest">
              {"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">“{t.quote}”</p>
            <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border/40">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.color}`}>
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}