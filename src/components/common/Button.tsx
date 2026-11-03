import type { ReactNode } from "react";

export function Button({
  children,
  className = "",
  disabled = false,
  label,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  label?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      aria-label={label}
      className={`focus-ring cursor-pointer transition-all duration-150 active:translate-y-[1px] ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
