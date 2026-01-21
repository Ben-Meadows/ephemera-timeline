import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "stamp";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#8b4513] text-[#f5efe6] hover:bg-[#704214] focus-visible:outline-[#8b4513] border border-[#704214] shadow-sm",
  secondary:
    "bg-[#f5efe6] text-[#5c4033] border border-[#d4a574] hover:bg-[#e8dfd3] hover:border-[#8b4513] shadow-sm",
  ghost:
    "text-[#5c4033] hover:bg-[#e8dfd3]/50 focus-visible:outline-[#8b4513]",
  danger:
    "bg-[#722f37] text-[#f5efe6] hover:bg-[#5a252c] focus-visible:outline-[#722f37] border border-[#5a252c]",
  stamp:
    "bg-transparent text-[#722f37] border-2 border-[#722f37] hover:bg-[#722f37]/5 font-[family-name:var(--font-typewriter)] uppercase tracking-wider",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function buttonClasses(
  variant: Variant,
  size: Size,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    sizeClasses[size],
    variantClasses[variant],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";
