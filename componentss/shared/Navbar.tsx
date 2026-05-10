"use client";

import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#testimonials", label: "Customers" },
];

export function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      // Check for admin role in Clerk publicMetadata
      const role = (user.publicMetadata as { role?: string })?.role;
      setIsAdmin(role === "admin");
    }
  }, [isSignedIn, user]);

  const dashboardUrl = isAdmin ? "/admin" : "/user/dashboard";

  // Prevent "flicker" by checking Clerk's built-in isLoaded state
  if (!isLoaded) return null; 

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_1px_16px_rgba(15,23,42,0.04)] transition-colors dark:border-white/10 dark:bg-slate-950/75">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
          <span 
            className="font-bold text-lg tracking-tight text-foreground" 
            style={{ fontFamily: 'Epilogue, sans-serif' }}
          >
            PostSathi
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-sm tracking-tight text-slate-600 hover:text-teal-700 transition-colors duration-200 dark:text-slate-300 dark:hover:text-teal-300"
              style={{ fontFamily: 'Epilogue, sans-serif' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          {isSignedIn ? (
            <>
              <Link
                href={dashboardUrl}
                className="inline-flex items-center justify-center h-9 bg-teal-700 hover:bg-teal-800 text-white font-semibold tracking-tight rounded-lg px-5 transition-all text-sm"
                style={{ fontFamily: 'Epilogue, sans-serif' }}
              >
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-700 hover:bg-slate-100 font-semibold tracking-tight px-5 dark:text-slate-200 dark:hover:bg-white/10"
                  style={{ fontFamily: 'Epilogue, sans-serif' }}
                >
                  Sign in
                </Button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-9 bg-teal-700 hover:bg-teal-800 text-white font-bold tracking-tight rounded-lg px-5 active:scale-95 transition-transform text-[0.8rem]"
                style={{ fontFamily: 'Epilogue, sans-serif' }}
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-foreground" 
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-8 py-6 flex flex-col gap-5 transition-all duration-300",
          mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none hidden"
        )}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-semibold text-sm tracking-tight text-slate-600 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300"
            style={{ fontFamily: 'Epilogue, sans-serif' }}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ModeToggle />
          </div>
          {isSignedIn ? (
            <Link
              href={dashboardUrl}
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center h-9 bg-teal-700 text-white font-semibold rounded-lg px-5 w-full text-sm"
              style={{ fontFamily: 'Epilogue, sans-serif' }}
            >
              {isAdmin ? "Admin Panel" : "Dashboard"}
            </Link>
          ) : (
            <Link
              href="/sign-up"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center h-9 bg-teal-700 text-white font-bold rounded-lg px-5 w-full text-sm"
              style={{ fontFamily: 'Epilogue, sans-serif' }}
            >
              Get started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
