"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  MoreVertical,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Keeping the same platform definitions from your Compose page
const platforms = [
  { value: "INSTAGRAM", label: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "text-pink-500" },
  { value: "FACEBOOK", label: "Facebook", icon: <Facebook className="w-4 h-4" />, color: "text-blue-600" },
  { value: "TWITTER", label: "Twitter", icon: <Twitter className="w-4 h-4" />, color: "text-sky-400" },
  { value: "LINKEDIN", label: "LinkedIn", icon: <Linkedin className="w-4 h-4" />, color: "text-blue-700" },
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use the same logic for fetching as your connections fetch
  useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        const res = await fetch("/api/social/scheduled"); // Adjust to your actual endpoint
        const data = await res.json();
        if (res.ok) setScheduledPosts(data);
      } catch (err) {
        console.error("Failed to fetch schedule", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScheduledPosts();
  }, []);

  const postsForSelectedDay = scheduledPosts.filter((post) =>
    selectedDate ? isSameDay(new Date(post.scheduledFor), selectedDate) : false
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        
        {/* Header matching Compose Page */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Content Calendar</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Visualize and manage your BanamSathi content pipeline
            </p>
          </div>
          <Link href="/generate">
            <Button className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> New Post
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calendar Picker Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-md bg-card/50 backdrop-blur">
              <CardContent className="p-4 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-none"
                  // Indicators for days with posts
                  modifiers={{
                    hasPost: (date) => scheduledPosts.some(p => isSameDay(new Date(p.scheduledFor), date))
                  }}
                  modifiersStyles={{
                    hasPost: { fontWeight: 'bold', textDecoration: 'underline', color: 'hsl(var(--primary))' }
                  }}
                />
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Monthly Progress</span>
                  <span className="text-xs font-bold text-primary">
                    {scheduledPosts.length} scheduled
                  </span>
                </div>
                <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-2/3 transition-all" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agenda Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-semibold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                {selectedDate ? format(selectedDate, "eeee, MMMM do") : "Select a day"}
              </h3>
              <Badge variant="outline">{postsForSelectedDay.length} Posts</Badge>
            </div>

            {postsForSelectedDay.length > 0 ? (
              <div className="space-y-4">
                {postsForSelectedDay.map((post) => (
                  <Card key={post.id} className="group hover:border-primary/40 transition-all shadow-sm">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Post Image Preview - Using logic from Media Section */}
                        {post.imageUrl && (
                          <div className="md:w-48 h-32 md:h-auto relative overflow-hidden bg-muted">
                            <img 
                              src={post.imageUrl} 
                              alt="Thumbnail" 
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 p-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                              {/* Using the same icons/badge logic for platform rendering */}
                              {post.platforms.map((platCode: string) => {
                                const plat = platforms.find(p => p.value === platCode);
                                return (
                                  <Badge key={platCode} variant="secondary" className="gap-1.5 px-2 py-1">
                                    <span className={plat?.color}>{plat?.icon}</span>
                                    <span className="text-[10px] font-medium">{plat?.label}</span>
                                  </Badge>
                                );
                              })}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Eye className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical className="w-4 h-4" /></Button>
                            </div>
                          </div>

                          <p className="text-sm text-foreground/80 line-clamp-2 italic leading-relaxed">
                            "{post.caption}"
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t border-dashed">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(post.scheduledFor), "h:mm a")}
                              </span>
                            </div>
                            <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs gap-1 group-hover:underline">
                              Edit Details <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-card/30">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-muted-foreground">No content scheduled</h4>
                <p className="text-xs text-muted-foreground/60 mb-6 mt-1">Keep your feed active with a new post.</p>
                <Link href="/generate">
                  <Button variant="outline" size="sm">Create for {selectedDate && format(selectedDate, "MMM do")}</Button>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}