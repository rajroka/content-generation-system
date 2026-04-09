"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Zap, Sparkles, Infinity, Crown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const plans = {
  monthly: [
    {
      name: "Free",
      price: 0,
      description: "Perfect for getting started",
      features: [
        "5 captions per day",
        "3 images per day",
        "Instagram only",
        "Basic tones (Casual, Inspirational)",
        "Content history (last 5 posts)",
      ],
      cta: "Current plan",
      popular: false,
      priceId: null,
    },
    {
      name: "Pro",
      price: 9.99,
      description: "For serious content creators",
      features: [
        "Unlimited captions",
        "Unlimited images",
        "All platforms (Instagram, Facebook, Twitter, LinkedIn)",
        "All tones (Professional, Casual, Inspirational, Humorous)",
        "Full content history",
        "Priority support",
        "Advanced image editing",
      ],
      cta: "Upgrade to Pro",
      popular: true,
      priceId: "price_pro_monthly", // You'll get this from Stripe
    },
    {
      name: "Enterprise",
      price: 49.99,
      description: "For teams and agencies",
      features: [
        "Everything in Pro",
        "Team accounts (up to 5 users)",
        "API access",
        "Custom branding",
        "Dedicated support",
        "Analytics dashboard",
      ],
      cta: "Contact sales",
      popular: false,
      priceId: null,
    },
  ],
  yearly: [
    {
      name: "Free",
      price: 0,
      description: "Perfect for getting started",
      features: [
        "5 captions per day",
        "3 images per day",
        "Instagram only",
        "Basic tones (Casual, Inspirational)",
        "Content history (last 5 posts)",
      ],
      cta: "Current plan",
      popular: false,
      priceId: null,
    },
    {
      name: "Pro",
      price: 99.99,
      description: "Save 16% with yearly billing",
      features: [
        "Unlimited captions",
        "Unlimited images",
        "All platforms",
        "All tones",
        "Full content history",
        "Priority support",
        "Advanced image editing",
      ],
      cta: "Upgrade to Pro",
      popular: true,
      priceId: "price_pro_yearly", // You'll get this from Stripe
    },
    {
      name: "Enterprise",
      price: 499.99,
      description: "For teams and agencies",
      features: [
        "Everything in Pro",
        "Team accounts (up to 5 users)",
        "API access",
        "Custom branding",
        "Dedicated support",
        "Analytics dashboard",
      ],
      cta: "Contact sales",
      popular: false,
      priceId: null,
    },
  ],
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const currentPlans = plans[billingCycle];

  const handleUpgrade = async (planName: string, priceId: string | null) => {
    if (!isSignedIn) {
      toast.error("Please sign in to upgrade");
      router.push("/sign-in");
      return;
    }

    if (planName === "Enterprise") {
      toast.info("Contact sales@banamsathi.com for enterprise plans");
      return;
    }

    if (planName === "Free") {
      toast.info("You're already on the free plan");
      return;
    }

    if (!priceId) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setLoading(planName);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error(error.message || "Failed to start checkout process");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose your plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free, upgrade when you need more. Cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <Label
            htmlFor="monthly"
            className={`text-sm cursor-pointer ${
              billingCycle === "monthly" ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
          />
          <Label
            htmlFor="yearly"
            className={`text-sm cursor-pointer ${
              billingCycle === "yearly" ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 16%
            </Badge>
          </Label>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.popular ? "border-primary shadow-lg scale-105 md:scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-tl-none rounded-br-lg rounded-tr-none rounded-bl-lg bg-primary text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex flex-col gap-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.name, plan.priceId)}
                  disabled={loading === plan.name || (plan.name === "Free" && true)}
                  className={`w-full ${
                    plan.popular && plan.name !== "Free"
                      ? "bg-primary hover:bg-primary/90"
                      : plan.name === "Free"
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : ""
                  }`}
                  variant={plan.name === "Free" ? "outline" : "default"}
                >
                  {loading === plan.name ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>

                {plan.name === "Pro" && (
                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment powered by Stripe
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your subscription at any time. No questions asked.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens when I upgrade?</h3>
              <p className="text-sm text-muted-foreground">
                Your limits are instantly increased. No downtime, no waiting.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-muted-foreground">
                We offer a 14-day money-back guarantee if you're not satisfied.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I switch between monthly and yearly?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can change your billing cycle anytime from your account settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}