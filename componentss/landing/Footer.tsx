import Link from "next/link";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "../shared/Logo";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Customers", href: "/#testimonials" },
    { label: "Dashboard", href: "/user/dashboard" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Tutorials", href: "/tutorials" },
    { label: "Blog", href: "/blog" },
    { label: "Support", href: "/support" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Partners", href: "/partners" },
  ],
};

const socials = [
  { label: "X", href: "#", icon: Twitter },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "GitHub", href: "#", icon: Github },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white dark:border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Logo className="[&_span]:text-white" />
            <p className="max-w-[240px] text-sm leading-7 text-slate-400">
              PostSathi helps creators generate, schedule, and publish content with one AI-powered workflow.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <Link key={label} href={href} aria-label={label} className="text-slate-400 transition hover:text-white">
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
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
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/privacy" className="text-xs text-slate-500 transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-slate-500 transition hover:text-white">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs text-slate-500 transition hover:text-white">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
