"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/componentss/shared/Logo";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Sparkles,
  History,
  Settings,
  CalendarDays,
  BarChart2,
  Link2,
  Zap,
  X,
  Menu,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
  },
  {
    href: "/generate",
    label: "Generate",
    icon: <Sparkles className="w-5 h-5 shrink-0" />,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: <CalendarDays className="w-5 h-5 shrink-0" />,
  },
  {
    href: "/history",
    label: "History",
    icon: <History className="w-5 h-5 shrink-0" />,
  },
  {
    href: "/platforms",
    label: "Platforms",
    icon: <Link2 className="w-5 h-5 shrink-0" />,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: <BarChart2 className="w-5 h-5 shrink-0" />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5 shrink-0" />,
  },
];

// Replace with your actual user plan from DB/Clerk
const USER_PLAN = "FREE"; // "FREE" | "PRO"

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const SidebarContent = () => (
    <aside className="w-64 h-full bg-white flex flex-col border-r border-gray-100">

      {/* Logo */}
      <div className="px-6 py-5 flex items-center justify-between shrink-0">
        <Logo size="sm" />
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Create New Post CTA */}
      <div className="px-4 pb-5 shrink-0">
        <Link
          href="/generate"
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all hover:shadow-md hover:shadow-primary/20 active:scale-95"
        >
          <span className="text-lg leading-none">+</span>
          Create New Post
        </Link>
      </div>

      {/* Nav Items — flex-1 with no overflow so no scroll */}
      <nav className="flex-1 px-3 flex flex-col justify-start gap-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <span className={cn(isActive ? "text-primary" : "text-gray-400")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner — FREE users only */}
      {USER_PLAN === "FREE" && (
        <div className="px-4 py-3 shrink-0">
          <Link
            href="/pricing"
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Upgrade to Pro</p>
              <p className="text-[10px] text-gray-400">Unlock all features</p>
            </div>
          </Link>
        </div>
      )}

      {/* User Account */}
      <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3 shrink-0">
        <UserButton afterSignOutUrl="/" />
        <span className="text-sm text-gray-500 font-medium truncate">My Account</span>
      </div>

    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-white text-gray-700 shadow-md border border-gray-100"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar — slides in from left */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex h-screen shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}