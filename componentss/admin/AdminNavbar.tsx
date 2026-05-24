"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { Search, Menu, ShieldCheck, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { navItems } from "./AdminSidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../shared/ThemeToggle";
import { FormEvent, useState } from "react";

export function AdminNavbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;

    const searchableRoutes = ["/admin/users", "/admin/content", "/admin/subscriptions", "/admin/activity"];
    const target = searchableRoutes.includes(pathname) ? pathname : "/admin/users";
    router.push(`${target}?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="h-14 bg-background flex items-center px-4 md:px-6 gap-4 border-b border-border sticky top-0 z-40 transition-colors">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-background border-r-0">
            <div className="flex flex-col h-full">
              {/* Brand Logo */}
              <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
                <Link href="/admin" className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-[#0d7c8a] rounded-lg flex items-center justify-center shrink-0">
                     <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-lg text-foreground tracking-tight">Admin Panel</span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto mt-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SheetClose key={item.href}>
                      <Link href={item.href} className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all group",
                        isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}>
                        <item.icon size={18} className={cn("shrink-0", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                        <span>{item.label}</span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              {/* Profile */}
              <div className="mt-auto p-3 border-t border-border bg-muted/30">
                <div className="flex items-center gap-3 p-2 bg-background border border-border rounded-xl shadow-sm">
                  <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-bold text-foreground truncate leading-none mb-1">
                      {user?.firstName || "Member"}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                      <ShieldCheck size={10} />
                      <span>Admin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <form onSubmit={handleSearch} className="relative flex-1 max-w-sm hidden sm:flex">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users, content, reports..."
          className="pl-9 h-9 bg-muted border-none text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-[#0d7c8a]"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </form>

      <div className="flex items-center gap-4 ml-auto">
        <ThemeToggle />
        <div className="h-6 w-[1px] bg-border hidden sm:block" />
        <div className="text-right hidden sm:block">
          <p className="text-[12px] font-bold text-foreground leading-none">{user?.fullName}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-1">System Administrator</p>
        </div>
        <div className="ml-2">
           <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
        </div>
      </div>
    </header>
  );
}
