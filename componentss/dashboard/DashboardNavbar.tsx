"use client";

import { useUser } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DashboardNavbar() {
  const { user } = useUser();

  return (
    <header className="h-14 bg-white flex items-center px-6 gap-4 border-b border-gray-100 sticky top-0 z-40">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search..."
          className="pl-9 h-9 bg-gray-50 border-none text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-[#0d7c8a]"
        />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="p-2 text-gray-400 hover:text-[#0d7c8a] cursor-pointer relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
        </div>
        <div className="h-6 w-[1px] bg-gray-200" />
        <div className="text-right hidden sm:block">
          <p className="text-[12px] font-bold text-[#1e3a3d] leading-none">{user?.fullName}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>
    </header>
  );
}