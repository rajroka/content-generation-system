"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PenLine,
  Calendar,
  Clock,
  Globe,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
} from "lucide-react";

export const navItems = [
  { href: "/user/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/user/generate", label: "Create Content", icon: PenLine },
  { href: "/user/calendar", label: "Schedule", icon: Calendar },
  { href: "/user/history", label: "Library", icon: Clock },
  { href: "/user/platforms", label: "Connections", icon: Globe },
  { href: "/user/analytics", label: "Insights", icon: BarChart3 },
];

export function Sidebar({ plan = "FREE" }: { plan?: string }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  const toggle = () => {
    setCollapsed(!collapsed);
    localStorage.setItem("sidebar_collapsed", String(!collapsed));
  };

  return (
    <aside className={cn(
      "hidden md:flex h-screen bg-background border-r border-border flex-col transition-all duration-300 relative",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Small Toggle Button */}
      <button 
        onClick={toggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-[#0d7c8a] shadow-sm z-50 transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Brand Logo */}
      <div className={cn("h-16 flex items-center px-4 shrink-0", collapsed && "justify-center")}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#0d7c8a] rounded-lg flex items-center justify-center shrink-0">
             <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
          </div>
          {!collapsed && <span className="font-bold text-lg text-foreground tracking-tight">PostSathi</span>}
        </div>
      </div>

      {/* Compact New Post Button */}
      <div className="px-3 mb-4">
        <Link href="/user/generate" className={cn(
          "flex items-center justify-center gap-2 w-full bg-[#0d7c8a] hover:bg-[#0b6a75] text-white text-[13px] font-semibold rounded-lg py-2 transition-all",
          collapsed && "w-10 h-10 mx-auto p-0"
        )}>
          <Plus size={16} />
          {!collapsed && <span>New Post</span>}
        </Link>
      </div>

      {/* Navigation Spacing Managed */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all group",
              isActive ? "bg-[#0d7c8a]/10 text-[#0d7c8a]" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center"
            )}>
              <item.icon size={18} className={cn("shrink-0", isActive ? "text-[#0d7c8a]" : "text-muted-foreground group-hover:text-foreground")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Profile Area */}
      <div className="mt-auto p-3 border-t border-border bg-muted/30">
        <div className={cn(
          "flex items-center gap-3 p-2 bg-background border border-border rounded-xl shadow-sm",
          collapsed && "justify-center border-none bg-transparent shadow-none px-0"
        )}>
          <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold text-foreground truncate leading-none">
                {user?.firstName || "Member"}
              </span>
              {plan === "PRO" && (
                <div className="flex items-center gap-1 text-[9px] text-[#0d7c8a] font-bold uppercase tracking-wider mt-1">
                  <ShieldCheck size={10} />
                  <span>Pro User</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}