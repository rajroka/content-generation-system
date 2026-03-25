"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/componentss/shared/Logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Sparkles,
  History,
  Settings,
  CreditCard,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    href: "/generate",
    label: "Generate",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    href: "/history",
    label: "History",
    icon: <History className="w-4 h-4" />,
  },
  {
    href: "/pricing",
    label: "Upgrade",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Logo size="sm" className="text-white [&>span]:text-white" />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10 flex items-center gap-3">
        <UserButton afterSignOutUrl="/" />
        <span className="text-sm text-white/60 truncate">My Account</span>
      </div>
    </aside>
  );
}