import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-xl bg-[#00687A] flex items-center  justify-center font-bold text-white",
          sizes[size]
        )}
      >
        PS
      </div>
      <span className={cn("font-semibold text-foreground", textSizes[size])}>
        PostSathi
      </span>
    </Link>
  );
}