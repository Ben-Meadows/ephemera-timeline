import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-500",
  secondary:
    "bg-white text-slate-900 ring-1 ring-slate-200 hover:ring-slate-300",
  ghost:
    "text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-400 dark:hover:bg-slate-900",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500",
};

export function buttonClasses(
  variant: Variant,
  size: Size,
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
    size === "sm" ? "px-3 py-1.5" : "px-4 py-2",
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
