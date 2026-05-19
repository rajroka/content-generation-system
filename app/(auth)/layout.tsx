import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/componentss/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-12 text-white relative overflow-hidden">
        {/* Subtle teal glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-700/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <div className="relative z-10">
          <Logo className="text-white [&_span]:text-white" size="md" />
        </div>

        {/* Hero image + tagline */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <Image
            src="/newheroimage.png"
            alt="PostSathi creator"
            width={380}
            height={420}
            className="w-72 xl:w-80 drop-shadow-2xl mix-blend-luminosity opacity-90"
            priority
          />
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              Create once.<br />
              <span className="text-teal-400">Post everywhere.</span>
            </h2>
            <p className="mt-3 text-sm text-white/60 max-w-xs mx-auto leading-6">
              AI-powered captions, hashtags, and scheduling for every platform — in seconds.
            </p>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: "4+", label: "Platforms" },
            { value: "10s", label: "Per caption" },
            { value: "24/7", label: "Scheduling" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-2xl font-black text-teal-400">{s.value}</p>
              <p className="mt-1 text-xs text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950 px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Logo size="md" />
        </div>

        {children}

        <p className="mt-8 text-xs text-slate-400 dark:text-slate-600 text-center">
          By continuing, you agree to our{" "}
          <Link href="/" className="underline hover:text-teal-700 dark:hover:text-teal-400">Terms</Link>
          {" "}and{" "}
          <Link href="/" className="underline hover:text-teal-700 dark:hover:text-teal-400">Privacy Policy</Link>.
        </p>
      </div>

    </div>
  );
}
