"use client";
import { UserButton, useUser } from "@clerk/nextjs";
// useUser is safe here because this whole file is already "use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  CalendarDays,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/generate", icon: PlusCircle, label: "Generate" },
  { href: "/dashboard/history", icon: History, label: "History" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/plan", icon: CalendarDays, label: "Posting Plan" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col p-4 fixed h-full z-10">
        <div className="flex items-center gap-2 px-2 py-3 mb-8">
          <Sparkles className="text-purple-400" size={20} />
          <span className="text-white font-bold text-lg">BanamSathi</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-800 pt-4 mt-4">
          <div className="flex items-center gap-3 px-2">
            <UserButton />
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">
                {user?.firstName || "User"}
              </p>
              <p className="text-slate-500 text-xs truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60 p-8 min-h-screen">{children}</main>
    </div>
  );
}
