import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    label: "Starter",
    displayName: "FREE",
    price: null,
    period: null,
    features: [
      "1 platform connected",
      "5 posts per month",
      "10 captions per day",
      "AI basic generator",
    ],
    cta: "Get Started",
    popular: false,
    href: "/sign-up",
  },
  {
    label: "Professional",
    price: "12",
    period: "/mo",
    features: [
      "All platforms connected",
      "Unlimited captions & posts",
      "Unlimited scheduled posts",
      "Advanced AI analytics",
      "Priority support",
    ],
    cta: "Try Pro Free",
    popular: true,
    href: "/sign-up?plan=pro",
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="w-full py-24 px-4"
      style={{ background: "hsl(200 25% 94%)" }}
    >
      <div className="max-w-3xl mx-auto">
        <p
          className="text-xs font-semibold tracking-[0.14em] uppercase mb-3"
          style={{ color: "#169B7F" }}
        >
          Pricing
        </p>
        <h2
          className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3"
          style={{ color: "#0A2E2E" }}
        >
          Straightforward pricing
        </h2>
        <p className="text-sm mb-14" style={{ color: "#0A2E2E99" }}>
          Start free. Upgrade when you need to. No hidden fees.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {plans.map((plan) => (
            <div
              key={plan.label}
              className="relative flex flex-col gap-6 rounded-2xl p-8 transition-all duration-200"
              style={
                plan.popular
                  ? {
                      background: "#ffffff",
                      border: "2px solid #169B7F",
                      boxShadow: "0 4px 32px rgba(22,155,127,0.10)",
                    }
                  : {
                      background: "hsl(200 20% 88%)",
                      border: "1px solid hsl(200 15% 82%)",
                    }
              }
            >
              {plan.popular && (
                <span
                  className="absolute top-4 right-4 text-[0.6rem] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md"
                  style={{ background: "#169B7F", color: "#ffffff" }}
                >
                  Popular
                </span>
              )}

              <div>
                <p
                  className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase mb-2"
                  style={{ color: "#169B7F" }}
                >
                  {plan.label}
                </p>

                {plan.price ? (
                  <div className="flex items-baseline gap-0.5">
                    <span
                      className="text-4xl font-extrabold tracking-tight"
                      style={{ color: "#0A2E2E" }}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className="text-sm ml-0.5"
                      style={{ color: "#0A2E2E80" }}
                    >
                      {plan.period}
                    </span>
                  </div>
                ) : (
                  <p
                    className="text-4xl font-extrabold tracking-tight"
                    style={{ color: "#0A2E2E" }}
                  >
                    FREE
                  </p>
                )}
              </div>

              <ul className="flex flex-col gap-3">
                {plan.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-center gap-2.5 text-sm"
                    style={{ color: "#0A2E2ECC" }}
                  >
                    <CheckCircle2
                      className="w-[17px] h-[17px] shrink-0"
                      style={{ color: "#169B7F" }}
                    />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-center transition-opacity duration-150 hover:opacity-90"
                style={
                  plan.popular
                    ? { background: "#169B7F", color: "#ffffff" }
                    : {
                        background: "transparent",
                        border: "1.5px solid #0A2E2E40",
                        color: "#0A2E2E",
                      }
                }
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}