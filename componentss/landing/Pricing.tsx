import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "For creators just getting started.",
    features: ["5 captions per day", "10 hashtag sets per month", "DALL-E image generation (3/day)", "Content history (last 7 days)", "Basic tone control"],
    cta: "Get started free",
    popular: false,
    href: "/sign-up",
  },
  {
    name: "Pro",
    price: "$12",
    desc: "For creators serious about growth.",
    features: ["Unlimited captions", "Unlimited hashtag sets", "DALL-E image generation (20/day)", "Background removal", "Full content history", "Advanced tone & style control", "Fine-tuned model access", "Priority support"],
    cta: "Start Pro",
    popular: true,
    href: "/sign-up?plan=pro",
  },
  {
    name: "Team",
    price: "$29",
    desc: "For agencies and content teams.",
    features: ["Everything in Pro", "Up to 5 team members", "Shared content workspace", "API access", "Custom brand voice training", "Analytics dashboard", "Dedicated account manager"],
    cta: "Contact us",
    popular: false,
    href: "/contact",
  },
];

export function Pricing() {
  return (
    <div className="bg-muted/20 border-y border-border/50 w-full">
      <section id="pricing" className="max-w-6xl mx-auto px-4 py-24">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-primary mb-3">Pricing</p>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Simple, honest pricing</h2>
        <p className="text-muted-foreground mb-12 max-w-lg">Start free. Scale when you need to. No hidden fees.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col gap-6 rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular ? "border-primary bg-linear-to-b from-primary/5 to-card shadow-[0_0_40px_rgba(91,110,245,0.15)]" : "border-border/50 bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[0.65rem] font-bold tracking-widest uppercase px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/ mo</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              </div>
              <hr className="border-border/50" />
              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? "default" : "outline"} className={`w-full ${plan.popular ? "shadow-[0_0_24px_rgba(91,110,245,0.3)]" : ""}`} asChild>
                <Link href={plan.href}>
                  {plan.cta} {plan.popular && <ArrowRight className="ml-1.5 w-4 h-4" />}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}