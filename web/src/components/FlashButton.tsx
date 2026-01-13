"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FlashButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost" | "outline";
};

export default function FlashButton({
  children,
  className = "",
  variant = "primary",
  href,
  onClick,
  disabled = false,
  type,
  ...rest
}: FlashButtonProps) {
  const router = useRouter();
  const [flashing, setFlashing] = useState(false);

  const variantClass =
    variant === "ghost"
      ? "bg-white/70 text-[var(--ink)] ring-1 ring-[var(--ring)] hover:shadow-[0_10px_24px_rgba(12,36,26,0.12)]"
      : variant === "outline"
        ? "bg-transparent text-[var(--ink)] ring-1 ring-[var(--mint-3)] hover:bg-white/60"
        : "bg-[var(--mint-4)] text-white shadow-[0_16px_30px_rgba(20,138,97,0.26)] hover:bg-[var(--mint-5)]";

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (flashing || disabled) {
      return;
    }
    onClick?.(event);
    setFlashing(true);

    if (!href) {
      window.setTimeout(() => setFlashing(false), 360);
      return;
    }

    window.setTimeout(() => {
      if (href.startsWith("#")) {
        const target = document.querySelector(href);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (href.startsWith("http")) {
        window.location.href = href;
      } else {
        router.push(href);
      }
    }, 240);
  };

  return (
    <button
      {...rest}
      type={type ?? "button"}
      disabled={disabled}
      onClick={handleClick}
      className={`btn-flash ${variantClass} ${flashing ? "flash" : ""} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
