"use client";

import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";
import { Logo } from "./Logo";

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
      const role = (user.publicMetadata as { role?: string })?.role;
      setIsAdmin(role === "admin");
    }
  }, [isSignedIn, user]);

  const dashboardUrl = isAdmin ? "/admin" : "/user/dashboard";

  const headerClass =
    "sticky top-0 z-50 w-full border-b border-border bg-background";

  if (!isLoaded) {
    return (
      <header className={headerClass}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo skeleton */}
          <div className="h-10 w-32 rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />
          {/* Desktop nav skeleton */}
          <div className="hidden md:flex items-center gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-4 w-20 rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />
            ))}
          </div>
          {/* Actions skeleton */}
          <div className="hidden md:flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />
            <div className="h-9 w-24 rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />
          </div>
          {/* Mobile hamburger skeleton */}
          <div className="md:hidden h-6 w-6 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
        </div>
      </header>
    );
  }

  return (
    <header className={headerClass}>
      {/* ── Main bar ── */}
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">

        {/* Logo — always visible */}
        <Logo size="lg" />

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold tracking-tight text-slate-600 hover:text-teal-700 transition-colors dark:text-slate-300 dark:hover:text-teal-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          {isSignedIn ? (
            <>
              <Link
                href={dashboardUrl}
                className="inline-flex items-center justify-center h-9 rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-700 hover:bg-slate-100 font-semibold px-5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  Sign in
                </Button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-9 rounded-lg bg-teal-700 px-5 text-sm font-bold text-white transition hover:bg-teal-800 active:scale-95"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile: hamburger — right side */}
        <button
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-700 transition hover:border-teal-700/40 dark:border-slate-700 dark:text-slate-300"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border bg-background",
          mobileOpen ? "max-h-screen opacity-100 py-6 px-5 sm:px-8" : "max-h-0 opacity-0 py-0 px-5 sm:px-8"
        )}
      >
        {/* Nav links */}
        <nav className="flex flex-col gap-4 mb-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Theme</span>
            <ModeToggle />
          </div>
          {isSignedIn ? (
            <Link
              href={dashboardUrl}
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center h-10 w-full rounded-lg bg-teal-700 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              {isAdmin ? "Admin Panel" : "Dashboard"}
            </Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button
                  className="inline-flex items-center justify-center h-10 w-full rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 transition hover:border-teal-700/40 dark:border-slate-700 dark:text-slate-200"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center h-10 w-full rounded-lg bg-teal-700 text-sm font-bold text-white transition hover:bg-teal-800"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
