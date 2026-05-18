import { Hero } from "@/componentss/landing/Hero";
import { SocialConnect } from "@/componentss/landing/SocialConnect";
import { Features } from "@/componentss/landing/Features";
import { Pricing } from "@/componentss/landing/Pricing";
import { Testimonials } from "@/componentss/landing/Testimonials";

export default function LandingPage() {
  return (
    <main className="flex flex-col bg-background relative text-foreground">
      <Hero />
      <SocialConnect />
      <Features />
      <Pricing />
      <Testimonials />
    </main>
  );
}