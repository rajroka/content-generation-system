import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    label: "Starter",
    price: "Free",
    blurb: "For creators testing a repeatable content workflow.",
    features: ["1 platform connected", "10 captions per day", "15 scheduled posts per month", "Basic AI generator"],
    cta: "Get Started",
    ctaLoggedInFree: "Current Plan",
    ctaLoggedInPro: "Downgrade",
    href: "/sign-up",
    planKey: "FREE",
    highlighted: false,
  },
  {
    label: "Professional",
    price: "$12",
    period: "/mo",
    blurb: "For teams and creators publishing consistently.",
    features: ["All platforms connected", "Unlimited captions and posts", "Unlimited scheduled posts", "Advanced analytics board", "Priority support"],
    cta: "Try Pro Free",
    ctaLoggedInFree: "Upgrade to Pro",
    ctaLoggedInPro: "Manage Billing",
    href: "/sign-up?redirect_url=/pricing",
    planKey: "PRO",
    highlighted: true,
  },
];

interface PricingProps {
  currentPlan?: string;
}

export function Pricing({ currentPlan }: PricingProps) {
  const isLoggedIn = currentPlan !== undefined;

  return (
    <section id="pricing" className="bg-[hsl(194_54%_96%)] px-5 py-20 text-slate-950 sm:px-8 lg:px-10 lg:py-28 dark:bg-[hsl(222_47%_7%)] dark:text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Pricing</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Start free. Upgrade when the work grows.</h2>
            <p className="mt-5 max-w-md text-base leading-8 text-slate-600 dark:text-slate-300">
              Simple plans for building a consistent publishing habit, from first draft to scheduled campaign.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => {
              const isCurrentPlan = isLoggedIn && currentPlan === plan.planKey;
              const ctaLabel = isLoggedIn ? (currentPlan === "FREE" ? plan.ctaLoggedInFree : plan.ctaLoggedInPro) : plan.cta;

              let ctaHref: string;
              if (isCurrentPlan && plan.planKey === "FREE") {
                ctaHref = "/user/dashboard";
              } else if (isCurrentPlan && plan.planKey === "PRO") {
                ctaHref = "/api/billing-portal";
              } else if (plan.planKey === "PRO") {
                ctaHref = isLoggedIn ? "/api/checkout" : "/sign-up?redirect_url=/pricing";
              } else {
                ctaHref = isLoggedIn ? "/user/dashboard" : plan.href;
              }

              return (
                <div
                  key={plan.label}
                  className={
                    plan.highlighted
                      ? "relative border-2 border-teal-700 bg-white p-7 shadow-xl shadow-teal-950/10 dark:border-teal-300 dark:bg-slate-950"
                      : "border border-slate-200 bg-white/70 p-7 dark:border-white/10 dark:bg-white/[0.04]"
                  }
                >
                  {plan.highlighted && (
                    <span className="absolute right-5 top-5 rounded-md bg-amber-300 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-950">
                      Popular
                    </span>
                  )}

                  <p className="text-sm font-black text-teal-700 dark:text-teal-300">{plan.label}</p>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                    {plan.period && <span className="pb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{plan.period}</span>}
                  </div>
                  <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-400">{plan.blurb}</p>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={ctaHref}
                    className={
                      isCurrentPlan
                        ? "mt-7 inline-flex h-11 w-full pointer-events-none items-center justify-center rounded-lg border border-teal-700/30 text-sm font-black text-teal-700 dark:border-teal-300/30 dark:text-teal-300"
                        : plan.highlighted
                        ? "mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg bg-teal-700 text-sm font-black text-white transition hover:bg-teal-800"
                        : "mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-300 text-sm font-black text-slate-950 transition hover:border-teal-700/40 hover:bg-white dark:border-white/15 dark:text-white dark:hover:bg-white/10"
                    }
                  >
                    {ctaLabel}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
