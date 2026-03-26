"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Copy,
  RefreshCw,
  Download,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

const platforms = [
  { value: "INSTAGRAM", label: "Instagram", icon: <Instagram className="w-4 h-4" />, limit: 2200 },
  { value: "FACEBOOK", label: "Facebook", icon: <Facebook className="w-4 h-4" />, limit: 63206 },
  { value: "TWITTER", label: "Twitter", icon: <Twitter className="w-4 h-4" />, limit: 280 },
  { value: "LINKEDIN", label: "LinkedIn", icon: <Linkedin className="w-4 h-4" />, limit: 3000 },
];

const tones = [
  { value: "CASUAL", label: "Casual" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "INSPIRATIONAL", label: "Inspirational" },
  { value: "HUMOROUS", label: "Humorous" },
];

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("INSTAGRAM");
  const [tone, setTone] = useState("CASUAL");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const selectedPlatform = platforms.find((p) => p.value === platform);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic first");
      return;
    }

    setIsGenerating(true);
    setCaption("");
    setHashtags([]);
    setImageUrl("");

    try {
      const res = await fetch("/api/generate/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, tone }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to generate");

      setCaption(data.caption);
      setHashtags(data.hashtags);

      // Generate image after caption
      setIsGeneratingImage(true);
      const imgRes = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform }),
      });

      const imgData = await imgRes.json();
      if (imgRes.ok) setImageUrl(imgData.imageUrl);

    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
      setIsGeneratingImage(false);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePostToInstagram = async () => {
    const fullText = `${caption}\n\n${hashtags.join(" ")}`;
    await navigator.clipboard.writeText(fullText);
    toast.success("Caption copied! Opening Instagram...");
    setTimeout(() => window.open("https://www.instagram.com", "_blank"), 1000);
  };

  const handleDownloadImage = async () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `banamsathi-${topic.slice(0, 20)}.jpg`;
    link.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Generate Content</h1>
        <p className="text-muted-foreground mt-1">
          Create platform-ready captions and images in seconds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Input */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content settings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Topic */}
              <div className="flex flex-col gap-2">
                <Label>Topic</Label>
                <Input
                  placeholder="e.g. Top 10 richest athletes in 2024"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
              </div>



              {/* Platform */}
              <div className="flex flex-col gap-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          {p.icon}
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="flex flex-col gap-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Generated Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGeneratingImage ? (
                <Skeleton className="w-full aspect-square rounded-lg" />
              ) : imageUrl ? (
                <div className="flex flex-col gap-3">
                  <img
                    src={imageUrl}
                    alt="Generated"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadImage}
                    className="w-fit"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download image
                  </Button>
                </div>
              ) : (
                <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-sm">Image will appear here</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — Output */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Caption</CardTitle>
              <div className="flex items-center gap-2">
                {caption && (
                  <span className="text-xs text-muted-foreground">
                    {caption.length} / {selectedPlatform?.limit}
                  </span>
                )}
                {caption && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(caption, "Caption")}
                  >
                    {copied === "Caption" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              ) : caption ? (
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="min-h-37.5 resize-none"
                />
              ) : (
                <div className="min-h-37.5 flex items-center justify-center text-sm text-muted-foreground">
                  Your caption will appear here
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Hashtags</CardTitle>
              {hashtags.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(hashtags.join(" "), "Hashtags")}
                >
                  {copied === "Hashtags" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
              ) : hashtags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Hashtags will appear here
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {caption && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleGenerate}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={handlePostToInstagram}
                className="flex-1"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Post to Instagram
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}