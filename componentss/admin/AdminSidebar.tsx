"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Image,
  BarChart3,
  Settings,
  CreditCard,
  Shield,
  Activity,
  Flag,
} from "lucide-react";

const navItems = [
  {
    href: "/admin",
    label: "Overview",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: <Users className="w-4 h-4" />,
  },
  {
    href: "/admin/generations",
    label: "Content",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    href: "/admin/images",
    label: "Images",
    icon: <Image className="w-4 h-4" />,
  },
  {
    href: "/admin/flagged",
    label: "Flagged Content",
    icon: <Flag className="w-4 h-4" />,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    href: "/admin/activity",
    label: "Activity Log",
    icon: <Activity className="w-4 h-4" />,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
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

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/user/dashboard"
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}