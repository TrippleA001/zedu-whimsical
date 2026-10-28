"use client";

import Image from "next/image";

export type LogoVariant = "nav" | "rail";

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
};

const SIZES: Record<LogoVariant, { w: number; h: number }> = {
  nav: { w: 28, h: 28 },
  rail: { w: 36, h: 36 },
};

/**
 * The actual Zedu logo (a bell), with a gentle ringing animation so the
 * brand feels alive. Dark variant by default; light mode swaps the source.
 */
export default function Logo({
  variant = "nav",
  className,
}: LogoProps) {
  const { w, h } = SIZES[variant];
  return (
    <span
      className={`logo logo--${variant} ${className ?? ""}`}
      aria-hidden="true"
    >
      <Image
        src="/Zedu.png"
        alt=""
        width={w}
        height={h}
        className="logo__img"
        loading="eager"
        priority
        draggable={false}
        style={{ display: "block" }}
      />
    </span>
  );
}
