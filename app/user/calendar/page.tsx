"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  parseISO 
} from "date-fns";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  BarChart3,
  Calendar as CalendarIcon
} from "lucide-react";
import Link from "next/link";

export default function ContentCalendar() {
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  useEffect(() => {
    fetch("/api/social/scheduled")
      .then((r) => r.json())
      .then((data) => setScheduledPosts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const getPostsForDay = (date: Date) => {
    return scheduledPosts.filter((post) => {
      if (!post || !post.scheduledFor) return false;
      try {
        return isSameDay(parseISO(post.scheduledFor), date);
      } catch (e) {
        return false;
      }
    });
  };

  const stats = {
    scheduled: scheduledPosts.length,
    drafts: 5,
    published: 12,
    total: 30
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Content Calendar</h1>
            <p className="text-muted-foreground text-sm mt-1">Visualize and manage your content pipeline.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/user/generate">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> New Post
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Main Calendar Grid */}
          <div className="xl:col-span-9 space-y-4">
            
            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-card border rounded-t-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 font-medium text-sm">
                <span className="p-1.5 bg-muted rounded-md"><CalendarIcon className="w-4 h-4" /></span>
                {format(weekDays[0], "MMMM do")} - {format(weekDays[6], "MMMM do, yyyy")}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>Today</Button>
                <div className="flex border rounded-md">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* The Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 border-x border-b rounded-b-xl bg-card overflow-hidden shadow-sm">
              {weekDays.map((day, idx) => (
                <div key={idx} className={`min-h-[600px] border-r last:border-r-0 flex flex-col ${isSameDay(day, new Date()) ? 'bg-primary/5' : ''}`}>
                  <div className="p-3 text-center border-b bg-muted/30">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                      {format(day, "EEE")}
                    </span>
                  </div>

                  <div className="p-2 flex flex-col gap-2 flex-grow overflow-y-auto">
                    {isLoading ? (
                       <div className="h-16 bg-muted animate-pulse rounded-md" />
                    ) : (
                      getPostsForDay(day).map((post, pIdx) => (
                        <PostCard key={pIdx} post={post} />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="xl:col-span-3 space-y-4">
            <Card className="bg-teal-900/10 border-teal-500/20 dark:bg-teal-900/20">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-teal-700 dark:text-teal-400 mb-1">Total Scheduled</p>
                <h3 className="text-2xl font-bold mb-4">{stats.scheduled} posts</h3>
                <Progress value={(stats.scheduled / stats.total) * 100} className="h-2 bg-teal-200 dark:bg-teal-900" />
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase font-bold">
                  <span>0%</span>
                  <span>{Math.round((stats.scheduled/stats.total)*100)}%</span>
                </div>
              </CardContent>
            </Card>

            <StatMiniCard icon={<FileText className="text-blue-500 w-4 h-4" />} label="Drafts" count={stats.drafts} />
            <StatMiniCard icon={<CheckCircle2 className="text-green-500 w-4 h-4" />} label="Published" count={stats.published} />
            <StatMiniCard icon={<BarChart3 className="text-purple-500 w-4 h-4" />} label="Statistics" count={10} />
          </aside>

        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  const isDraft = post.status?.toLowerCase() === 'draft';
  
  return (
    <Card className={`${isDraft ? 'bg-teal-600 text-white' : 'bg-slate-900 text-white dark:bg-slate-800'} border-none shadow-sm overflow-hidden group cursor-pointer hover:ring-2 ring-primary/50 transition-all`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start gap-1">
          <h4 className="text-[11px] font-bold leading-tight line-clamp-2">
            {post.title || post.caption || "AI Precision Draft"}
          </h4>
          <MoreVertical className="w-3 h-3 opacity-50 flex-shrink-0" />
        </div>
        
        <Badge variant="secondary" className="bg-white/20 text-[9px] hover:bg-white/30 text-inherit border-none py-0 px-1.5 h-4">
          {post.status?.toUpperCase() || "DRAFT"}
        </Badge>

        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          <LinkIcon className="w-2.5 h-2.5 opacity-70" />
          <span className="text-[9px] opacity-70 font-mono">
            {post.scheduledFor ? format(parseISO(post.scheduledFor), "HH:mm") : "--:--"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatMiniCard({ icon, label, count }: { icon: React.ReactNode, label: string, count: number }) {
  return (
    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border shadow-sm">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-lg border shadow-sm">{icon}</div>
          <span className="font-medium text-sm text-muted-foreground">{label}:</span>
        </div>
        <span className="font-bold text-lg">{count}</span>
      </CardContent>
    </Card>
  );
}