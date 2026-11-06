import type { ReactNode } from "react";

export function Button({
  children,
  className = "",
  disabled = false,
  label,
  onClick,
  title,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      aria-label={label}
      className={`focus-ring cursor-pointer transition-all duration-150 active:translate-y-[1px] ${className}`}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type={type}
    >
      {children}
    </button>
  );
}
