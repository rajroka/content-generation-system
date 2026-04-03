"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Sparkles,
  Plus,
  X,
  ImageIcon,
  Loader2,
  Send,
  MoreHorizontal,
  Save,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// IDs now strictly match your Prisma Enum: INSTAGRAM, FACEBOOK, TWITTER, LINKEDIN
const PLATFORMS = [
  { id: "TWITTER", label: "X", icon: Twitter, color: "bg-slate-900" },
  { id: "FACEBOOK", label: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { id: "INSTAGRAM", label: "Instagram", icon: Instagram, color: "bg-pink-600" },
  { id: "LINKEDIN", label: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
  { id: "YOUTUBE", label: "YouTube", icon: Youtube, color: "bg-red-600" }, 
];

export default function ComposePostPage() {
  const [topic, setTopic] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["TWITTER"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<{ url: string; file?: File }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic first");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // FIX: Send selectedPlatforms[0] which is "TWITTER", not "X"
        body: JSON.stringify({ 
          topic, 
          platform: selectedPlatforms[0] || "TWITTER", 
          tone: "CASUAL" 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      setCaption(data.caption);
      
      // LOGIC: Ensure at least 6 hashtags
      const baseTags = data.hashtags || [];
      const fallbacks = ["#trending", "#viral", "#innovation", "#digital", "#creativity", "#future"];
      const combinedTags = Array.from(new Set([...baseTags, ...fallbacks])).slice(0, 8);
      setHashtags(combinedTags);

      toast.success("Content generated!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setMediaFiles((prev) => [...prev, { url, file }]);
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 sm:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Compose Post</h1>
            <p className="text-slate-500 mt-1">Design your next viral post with AI.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl border-slate-200 h-11 px-6 font-semibold flex gap-2">
              <Save className="w-4 h-4" /> Save Draft
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">
          
          {/* LEFT COLUMN: Editor */}
          <div className="space-y-8">
            
            {/* Platforms Selection */}
            <div className="space-y-3">
              <Label className="text-[15px] font-bold text-slate-900">Publish to</Label>
              <div className="flex flex-wrap items-center gap-3">
                {PLATFORMS.map((p) => {
                  const isActive = selectedPlatforms.includes(p.id);
                  return (
                    <Badge
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "cursor-pointer transition-all px-4 py-2.5 rounded-full flex items-center gap-2 border shadow-sm",
                        isActive 
                          ? "bg-white border-slate-900 text-slate-900" 
                          : "bg-slate-50 border-transparent text-slate-400 opacity-60 hover:opacity-100"
                      )}
                    >
                      <div className={cn("rounded-full p-1", isActive ? p.color : "bg-slate-300")}>
                        <p.icon className="w-3 h-3 text-white fill-current" />
                      </div>
                      <span className="font-medium text-sm">{p.label}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Caption Editor */}
            <div className="space-y-3">
              <Label className="text-[15px] font-bold text-slate-900">Content</Label>
              <Textarea 
                value={caption} 
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind?" 
                className="min-h-[200px] rounded-xl border-slate-200 bg-white p-6 text-slate-700 leading-relaxed text-sm focus-visible:ring-slate-200 transition-all shadow-sm"
              />

              {/* Generate Bar */}
              <div className="flex items-center gap-2 p-1.5 pl-5 border border-slate-200 rounded-xl bg-white shadow-sm mt-4 focus-within:ring-2 focus-within:ring-slate-100">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic: Calories Tracker App called Calorix"
                  className="flex-1 bg-transparent border-none outline-none text-sm h-10 text-slate-700"
                />
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="rounded-xl bg-slate-950 hover:bg-slate-800 h-10 px-6 gap-2 text-sm font-bold"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-current" />}
                  Generate
                </Button>
              </div>
            </div>

            {/* Media Assets */}
            <div className="space-y-3 pt-2">
              <Label className="text-[15px] font-bold text-slate-900">Media Assets</Label>
              <div className="flex flex-wrap gap-4">
                {mediaFiles.map((media, i) => (
                  <div key={i} className="group relative w-24 h-24 rounded-xl overflow-hidden border border-slate-100 shadow-md">
                    <Image 
                      src={media.url} 
                      alt="Upload" 
                      fill 
                      className="object-cover transition-transform group-hover:scale-105" 
                    />
                    <button 
                      onClick={() => setMediaFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:bg-slate-50 transition-all"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                </button>
                <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileUpload} />
              </div>
            </div>

            {/* Scheduling Section */}
            <div className="pt-6 border-t border-slate-100">
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                       <Calendar className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Schedule Posting</p>
                      <p className="text-xs text-slate-500">Pick a date and time for your post.</p>
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white h-11 px-8 font-bold flex gap-2">
                    <Send className="w-4 h-4" /> Schedule Post
                  </Button>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Preview */}
          <div className="space-y-4">
            <div className="bg-slate-100/50 rounded-[32px] border border-slate-100 p-0 min-h-[500px] flex flex-col items-center justify-center overflow-hidden">
               {!caption && mediaFiles.length === 0 ? (
                 <div className="max-w-[200px] text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium leading-snug">Post preview will appear here</p>
                 </div>
               ) : (
                 <Card className="w-full max-w-[360px] rounded-xl overflow-hidden border-none shadow-2xl bg-white m-4">
                    {/* Top Bar */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 relative overflow-hidden">
                            <Image src="https://github.com/shadcn.png" alt="User" fill />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">your_brand</p>
                          <p className="text-[11px] text-slate-400 uppercase font-bold tracking-tighter">
                            {selectedPlatforms[0] || "PREVIEW"}
                          </p>
                        </div>
                      </div>
                      <MoreHorizontal className="w-5 h-5 text-slate-400" />
                    </div>
                    
                    {/* Media Area */}
                    {mediaFiles.length > 0 && (
                      <div className="aspect-square w-full relative">
                        <Image 
                          src={mediaFiles[0].url} 
                          alt="Post Content" 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                    )}

                    {/* Caption Area */}
                    <div className="p-4 text-left">
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {caption || "Generate or write a caption to see the preview..."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {hashtags.map((tag, i) => (
                          <span key={i} className="text-blue-600 text-xs font-semibold">{tag}</span>
                        ))}
                      </div>
                    </div>
                 </Card>
               )}
            </div>
            <p className="text-center text-xs text-slate-400 font-medium italic">Preview adapts to your primary platform choice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}