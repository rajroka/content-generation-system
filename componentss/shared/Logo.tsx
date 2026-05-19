import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const imgSizes = {
    sm: 80,
    md: 120,
    lg: 180,
  };

  return (
    <Link href="/" className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="PostSathi"
        width={imgSizes[size]}
        height={imgSizes[size]}
        className="object-contain"
        priority
      />
    </Link>
  );
}
