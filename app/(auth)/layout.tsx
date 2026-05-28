import Link from "next/link";
import { Logo } from "@/componentss/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="light min-h-screen flex flex-col items-center justify-center bg-[#eef2f7] px-4 py-12" style={{ colorScheme: "light" }}>

      {/* Logo */}
      <div className="mb-4">
        <Logo size="xl" responsive />
      </div>

      {/* Clerk widget — renders its own card, no wrapper needed */}
      {children}

      {/* Footer */}
      <p className="mt-6 text-xs text-slate-400 text-center">
        By continuing, you agree to our{" "}
        <Link href="/" className="text-blue-500 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/" className="text-blue-500 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
