"use client";

import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToggle";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
];

export function Navbar() {
  const { isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#0b1c30]/10 bg-white/80 backdrop-blur-xl shadow-[0_1px_16px_rgba(0,104,122,0.04)]">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
          <span 
            className="font-bold text-lg tracking-tight text-[#0b1c30]" 
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
              className="font-semibold text-sm tracking-tight text-[#3d494c] hover:text-[#06b6d4] transition-colors duration-200"
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
              <Button 
                className="bg-[#00687a] hover:bg-[#00424f] text-white font-semibold tracking-tight rounded-xl px-5 transition-all"
                style={{ fontFamily: 'Epilogue, sans-serif' }}
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#0b1c30] hover:bg-[#eff4ff] font-semibold tracking-tight px-5"
                  style={{ fontFamily: 'Epilogue, sans-serif' }}
                >
                  Sign in
                </Button>
              </SignInButton>
              <Button
                size="sm"
                className="bg-[#00687a] hover:bg-[#00424f] text-white font-bold tracking-tight rounded-xl px-5 active:scale-95 transition-transform"
                style={{ fontFamily: 'Epilogue, sans-serif' }}
              >
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-[#0b1c30]" 
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t border-[#0b1c30]/10 bg-white/95 backdrop-blur-xl px-8 py-6 flex flex-col gap-5 transition-all duration-300",
          mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none hidden"
        )}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-semibold text-sm tracking-tight text-[#3d494c] hover:text-[#06b6d4]"
            style={{ fontFamily: 'Epilogue, sans-serif' }}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="flex items-center gap-4 pt-4 border-t border-[#0b1c30]/5">
          <ModeToggle />
          {isSignedIn ? (
            <Button 
              className="bg-[#00687a] text-white font-semibold rounded-xl px-5 w-full"
              style={{ fontFamily: 'Epilogue, sans-serif' }}
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button 
              className="bg-[#00687a] text-white font-bold rounded-xl px-5 w-full"
              style={{ fontFamily: 'Epilogue, sans-serif' }}
            >
              <Link href="/sign-up">Get started</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}