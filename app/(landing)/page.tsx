import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Zap,
  Image,
  BarChart3,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    title: "AI Caption Generation",
    description:
      "Generate scroll-stopping captions tailored to your platform and tone using our fine-tuned model.",
  },
  {
    icon: <Image className="w-5 h-5 text-primary" />,
    title: "Image Generation & Editing",
    description:
      "Create stunning visuals with DALL-E 3 or upload your own and remove backgrounds instantly.",
  },
  {
    icon: <Zap className="w-5 h-5 text-primary" />,
    title: "Multi-Platform Support",
    description:
      "Optimized output for Instagram, Facebook, Twitter, and LinkedIn with platform-specific formatting.",
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-primary" />,
    title: "Content History",
    description:
      "Save and organize all your generated content in one place. Never lose a good caption again.",
  },
];

const steps = [
  {
    step: "01",
    title: "Enter your topic",
    description: "Type what your post is about — a product, event, or idea.",
  },
  {
    step: "02",
    title: "Choose platform & tone",
    description: "Pick Instagram, Twitter, LinkedIn or Facebook. Set your tone.",
  },
  {
    step: "03",
    title: "Generate & post",
    description: "Get your caption, hashtags and image ready to post in seconds.",
  },
];

const platforms = [
  { icon: <Instagram className="w-5 h-5" />, name: "Instagram" },
  { icon: <Facebook className="w-5 h-5" />, name: "Facebook" },
  { icon: <Twitter className="w-5 h-5" />, name: "Twitter" },
  { icon: <Linkedin className="w-5 h-5" />, name: "LinkedIn" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center gap-6">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="w-3 h-3" />
          Powered by fine-tuned AI
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-tight">
          Create smarter.{" "}
          <span className="text-primary">Post faster.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl">
          BanamSathi generates platform-ready captions, hashtags, and images for
          your social media — in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Start for free <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/#how-it-works">See how it works</Link>
          </Button>
        </div>

        {/* Platform badges */}
        <div className="flex items-center gap-3 pt-4">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded-full px-3 py-1"
            >
              {p.icon}
              {p.name}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/40 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Everything you need</h2>
            <p className="text-muted-foreground mt-2">
              From generation to posting — all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border bg-background">
                <CardContent className="pt-6 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="text-muted-foreground mt-2">
              Three steps to your next viral post
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="flex flex-col gap-3">
                <span className="text-4xl font-bold text-primary/20">
                  {step.step}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="max-w-6xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl font-bold text-white">
            Ready to create better content?
          </h2>
          <p className="text-primary-foreground/80 max-w-md">
            Join creators who use BanamSathi to generate content faster and
            smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              variant="secondary"
            >
              <Link href="/sign-up">
                Get started free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-primary-foreground/70">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> No credit card required
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> 5 free captions daily
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Cancel anytime
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}