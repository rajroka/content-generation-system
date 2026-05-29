import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
  variant?: "wordmark" | "mark";
  href?: string;
}

const LOGO_SRC = "/postsathi-logo.png";

export function Logo({
  className,
  size = "md",
  responsive = false,
  variant = "wordmark",
  href = "/",
}: LogoProps) {
  const wordmarkSizes = {
    sm: "h-9 w-32",
    md: "h-10 w-36",
    lg: "h-12 w-44",
    xl: "h-16 w-56",
  };

  const markSizes = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-9 w-9",
    xl: "h-10 w-10",
  };

  const markPixels = {
    sm: 28,
    md: 32,
    lg: 36,
    xl: 40,
  };

  const imageSizes = {
    sm: "128px",
    md: "144px",
    lg: "176px",
    xl: "224px",
  };

  const wrapperClass =
    variant === "mark"
      ? markSizes[size]
      : cn(
          wordmarkSizes[size],
          responsive && "h-12 w-40 sm:h-14 sm:w-48 md:h-16 md:w-56"
        );

  const markImageSize = markPixels[size] * 3.8;

  return (
    <Link href={href} className={cn("inline-flex items-center", className)}>
      <span className={cn("relative block shrink-0 overflow-hidden", wrapperClass)}>
        {variant === "mark" ? (
          <Image
            src={LOGO_SRC}
            alt="PostSathi"
            width={Math.round(markImageSize)}
            height={Math.round(markImageSize)}
            className="absolute max-w-none"
            style={{
              height: markImageSize,
              left: -(markPixels[size] * 0.3),
              top: -(markPixels[size] * 1.35),
              width: markImageSize,
            }}
            priority
          />
        ) : (
          <Image
            src={LOGO_SRC}
            alt="PostSathi"
            fill
            className="object-cover object-center"
            sizes={responsive ? "(max-width: 640px) 160px, (max-width: 768px) 192px, 224px" : imageSizes[size]}
            priority
          />
        )}
      </span>
    </Link>
  );
}
