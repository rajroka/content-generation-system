"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin_sidebar_collapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  const toggle = () => {
    setCollapsed(!collapsed);
    localStorage.setItem("admin_sidebar_collapsed", String(!collapsed));
  };

  return (
    <aside className={cn(
      "hidden md:flex h-screen bg-background border-r border-border flex-col transition-all duration-300 relative shrink-0",
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
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#0d7c8a] rounded-lg flex items-center justify-center shrink-0">
             <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-lg text-foreground tracking-tight">Admin Panel</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 mt-4">
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

      {/* Footer — admin-only branding */}
      <div className="p-3 border-t border-border bg-muted/30">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground text-center font-medium uppercase tracking-wider">
            Admin Panel
          </p>
        )}
      </div>
    </aside>
  );
}