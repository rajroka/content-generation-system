"use client";

import { useUser } from "@clerk/nextjs";
import { ModeToggle } from "@/componentss/shared/ModeToggle";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DashboardNavbar() {
  const { user } = useUser();

  return (
    <header className="h-14 border-b bg-background flex items-center px-6 gap-4 shrink-0">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-9 h-9 text-sm" />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* Theme toggle */}
        <ModeToggle />

        {/* User info */}
        <div className="text-sm text-muted-foreground hidden md:block">
          {user?.emailAddresses[0]?.emailAddress}
        </div>
      </div>
    </header>
  );
}