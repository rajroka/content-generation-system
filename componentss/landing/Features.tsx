import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Image, Hash, FolderOpen, FlaskConical } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    title: "AI Caption Generation",
    description: "Generate scroll-stopping captions tailored to your platform and tone using our fine-tuned model.",
  },
  {
    icon: <Image className="w-5 h-5 text-primary" />,
    title: "Image Generation & Editing",
    description: "Create stunning visuals with DALL-E 3, or remove backgrounds instantly with one click.",
  },
  {
    icon: <Hash className="w-5 h-5 text-primary" />,
    title: "Smart Hashtag Engine",
    description: "Get 10–15 hashtags per post — a smart mix of broad, niche, and trending tags.",
  },
  {
    icon: <FolderOpen className="w-5 h-5 text-primary" />,
    title: "Content History",
    description: "All your generated content is saved and organized automatically. Search and reuse anytime.",
  },
  {
    icon: <Zap className="w-5 h-5 text-primary" />,
    title: "Tone & Platform Control",
    description: "Switch between casual, professional, or viral tones instantly.",
  },
  {
    icon: <FlaskConical className="w-5 h-5 text-primary" />,
    title: "Fine-tuned Model",
    description: "Our custom Phi-2 model writes like a human content creator, not a robot.",
  },
];

export function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 py-24 w-full">
      <p className="text-xs font-semibold tracking-[0.12em] uppercase text-primary mb-3">Features</p>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Everything you need to go viral</h2>
      <p className="text-muted-foreground mb-12 max-w-lg">From generation to posting — one tool, zero friction.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <Card key={f.title} className="group border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}