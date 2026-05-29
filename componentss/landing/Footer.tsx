import Link from "next/link";
import { Logo } from "../shared/Logo";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Customers", href: "/#testimonials" },
  ],
  App: [
    { label: "Dashboard", href: "/user/dashboard" },
    { label: "Generate", href: "/user/generate" },
    { label: "Calendar", href: "/user/calendar" },
    { label: "Connections", href: "/user/platforms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white dark:border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-[240px] text-sm leading-7 text-slate-400">
              PostSathi turns your content idea into a caption, a schedule, and a published post — in one place.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-3">
              <h4 className="text-sm font-black text-white">{category}</h4>
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-slate-400 transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-slate-500">© 2026 PostSathi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
