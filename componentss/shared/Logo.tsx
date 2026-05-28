import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
}

export function Logo({ className, size = "md", responsive = false }: LogoProps) {
  const imgSizes = {
    sm: 80,
    md: 120,
    lg: 180,
    xl: 220,
  };

  return (
    <Link href="/" className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="PostSathi"
        width={imgSizes[size]}
        height={imgSizes[size]}
        className={cn(
          "object-contain",
          responsive && "w-[160px] sm:w-[190px] md:w-[220px]"
        )}
        priority
      />
    </Link>
  );
}
