import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    label: "Free",
    price: "$0",
    period: null,
    blurb: "For individuals and small teams",
    features: [
      "1 platform connected",
      "10 captions per day",
      "15 scheduled posts per month",
      "Basic AI generator",
      "Grid, Form & Gallery views",
    ],
    featuresLabel: "Plan includes:",
    cta: "Get started",
    ctaLoggedInFree: "Current Plan",
    ctaLoggedInPro: "Downgrade",
    href: "/sign-up",
    planKey: "FREE",
    highlighted: false,
  },
  {
    label: "Premium",
    price: "$10",
    period: "/mo",
    blurb: "For growing teams",
    features: [
      "Unlimited captions and posts",
      "All platforms connected",
      "Advanced analytics board",
      "Priority support",
      "Row comments & coloring",
    ],
    featuresLabel: "Everything in Free, plus:",
    cta: "Get started",
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
    <section
      id="pricing"
      className="bg-background px-5 py-20 text-foreground sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground mb-4">
            Pricing
          </p>
          <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Free forever.
          </h2>
          <h2 className="mt-1 text-4xl font-black tracking-tight text-muted-foreground sm:text-5xl">
            Pay as you grow.
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            The right plan for everyone.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = isLoggedIn && currentPlan === plan.planKey;
            const ctaLabel = isLoggedIn
              ? currentPlan === "FREE"
                ? plan.ctaLoggedInFree
                : plan.ctaLoggedInPro
              : plan.cta;

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
                    ? "relative border-2 border-border bg-card p-7 shadow-xl dark:bg-card"
                    : "border border-border bg-muted/40 p-7 dark:bg-white/[0.04]"
                }
              >
                {plan.highlighted && (
                  <span className="absolute right-5 top-5 rounded-md bg-amber-400 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-950">
                    Popular
                  </span>
                )}

                {/* Plan name */}
                <p className="text-sm font-black text-foreground">
                  {plan.label}
                </p>

                {/* Price */}
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-black tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="pb-1 text-sm font-semibold text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Blurb */}
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {plan.blurb}
                </p>

                {/* CTA — use <a> for API routes so the browser follows the server redirect */}
                {ctaHref.startsWith("/api/") ? (
                  <a
                    href={ctaHref}
                    className={
                      plan.highlighted
                        ? "mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#0d7c8a] text-sm font-black text-white shadow-lg transition hover:bg-[#0b6a75] active:scale-[0.98]"
                        : "mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-card text-sm font-black text-foreground transition hover:bg-muted"
                    }
                  >
                    {ctaLabel}
                  </a>
                ) : (
                  <Link
                    href={ctaHref}
                    className={
                      isCurrentPlan
                        ? "mt-6 inline-flex h-11 w-full pointer-events-none items-center justify-center rounded-lg border border-border text-sm font-black text-muted-foreground"
                        : plan.highlighted
                        ? "mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#0d7c8a] text-sm font-black text-white shadow-lg transition hover:bg-[#0b6a75] active:scale-[0.98]"
                        : "mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-card text-sm font-black text-foreground transition hover:bg-muted"
                    }
                  >
                    {ctaLabel}
                  </Link>
                )}

                {/* Features label */}
                <p className="mt-6 mb-3 text-xs font-semibold text-muted-foreground">
                  {plan.featuresLabel}
                </p>

                {/* Feature list */}
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm font-medium text-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
