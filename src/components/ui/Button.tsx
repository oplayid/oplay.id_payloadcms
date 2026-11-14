import React from "react";
import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
  disabled,
  type = "button",
}: ButtonProps) {
  // Basis gaya desain konsisten ala enterprise dengan radius dinamis
  const baseStyles =
    "inline-flex items-center justify-center px-5 py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 font-sub disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--theme-shadow)]";

  // Varian warna berbasis token dinamis yang ideal
  const variants = {
    // Primary: Menggunakan warna aksen/primary tema sebagai latar dan primary-text untuk teksnya agar kontras
    primary:
      "bg-(--theme-primary) text-(--theme-primary-text) hover:opacity-90 shadow-lg",

    // Secondary: Permukaan transparan dengan border dan teks adaptif
    secondary:
      "bg-(--theme-surface)/60 text-(--theme-text) border border-(--theme-border) hover:bg-(--theme-surface)",

    // Outline: Transparan dengan border tema
    outline:
      "bg-transparent text-(--theme-text) border border-(--theme-border) hover:bg-(--theme-text) hover:text-(--theme-bg)",
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${className}`;
  const buttonStyle = { borderRadius: "var(--theme-radius-btn)" };

  if (href) {
    return (
      <Link href={href} style={buttonStyle} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      className={combinedClasses}
    >
      {children}
    </button>
  );
}
