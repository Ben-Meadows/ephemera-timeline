import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-sm border border-[#d4a574] bg-[#faf6f1] px-4 py-2.5 text-[#2c1810] shadow-inner transition-all duration-200",
        "placeholder:text-[#8b7355] placeholder:italic",
        "focus:border-[#8b4513] focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "font-[family-name:var(--font-crimson)]",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
