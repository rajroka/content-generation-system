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
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate",  label: "Generate",  icon: Sparkles },
  { href: "/calendar",  label: "Calendar",  icon: CalendarDays },
  { href: "/history",   label: "History",   icon: History },
  { href: "/platforms", label: "Platforms", icon: Link2 },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings",  label: "Settings",  icon: Settings },
];

const USER_PLAN = "FREE"; // "FREE" | "PRO"

const SIDEBAR_KEY = "banam_sidebar_collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist collapsed state
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem(SIDEBAR_KEY, String(!prev));
      return !prev;
    });
  };

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <aside
        className={cn(
          "h-full bg-white flex flex-col border-r border-gray-100 relative transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Collapse toggle button — desktop only */}
        {!isMobile && (
          <button
            onClick={toggleCollapsed}
            className={cn(
              "absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/40 transition-all"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft  className="w-3.5 h-3.5" />
            }
          </button>
        )}

        {/* Logo */}
        <div
          className={cn(
            "flex items-center shrink-0 h-[68px] border-b border-gray-100 transition-all duration-300",
            isCollapsed ? "px-0 justify-center" : "px-5 justify-between"
          )}
        >
          {!isCollapsed && <Logo size="sm" />}
          {isCollapsed && (
            // Mini logo mark when collapsed — shows just the icon portion
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Create New Post CTA */}
        <div
          className={cn(
            "shrink-0 transition-all duration-300",
            isCollapsed ? "px-2.5 py-4" : "px-4 py-4"
          )}
        >
          <Link
            href="/generate"
            className={cn(
              "flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all hover:shadow-md hover:shadow-primary/20 active:scale-95",
              isCollapsed ? "p-2.5" : "text-sm px-4 py-2.5"
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Create New Post</span>}
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl text-sm font-medium transition-all group relative",
                  isCollapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-700"
                  )}
                />
                {!isCollapsed && <span>{item.label}</span>}

                {/* Tooltip on collapsed */}
                {isCollapsed && (
                  <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Banner — FREE users only */}
        {USER_PLAN === "FREE" && (
          <div
            className={cn(
              "shrink-0 transition-all duration-300",
              isCollapsed ? "px-2.5 py-3" : "px-4 py-3"
            )}
          >
            <Link
              href="/pricing"
              title={isCollapsed ? "Upgrade to Pro" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all group relative",
                isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5"
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-xs font-semibold text-gray-800">Upgrade to Pro</p>
                  <p className="text-[10px] text-gray-400">Unlock all features</p>
                </div>
              )}
              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                  Upgrade to Pro
                </span>
              )}
            </Link>
          </div>
        )}

        {/* User Account */}
        <div
          className={cn(
            "shrink-0 border-t border-gray-100 transition-all duration-300",
            isCollapsed ? "px-2.5 py-4 flex justify-center" : "px-4 py-4 flex items-center gap-3"
          )}
        >
          <UserButton afterSignOutUrl="/" />
          {!isCollapsed && (
            <span className="text-sm text-gray-500 font-medium truncate">My Account</span>
          )}
        </div>
      </aside>
    );
  };

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

      {/* Mobile sidebar — always full width, slides in from left */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent isMobile />
      </div>

      {/* Desktop sidebar — collapsible */}
      <div className="hidden lg:flex h-screen shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}