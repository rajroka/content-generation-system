import { Hero } from "@/componentss/landing/Hero";
import { Marquee } from "@/componentss/landing/Marquee";
import { Features } from "@/componentss/landing/Features";
import { Pricing } from "@/componentss/landing/Pricing";
import { Testimonials } from "@/componentss/landing/Testimonials";

export default function LandingPage() {
  return (
    <main className="flex flex-col bg-background relative text-foreground">
      <Hero />
      <Marquee />
      <Features />
      <Pricing />
      <Testimonials />
    </main>
  );
}