import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-sm border border-[#d4a574] bg-[#faf6f1] px-4 py-2.5 text-[#2c1810] shadow-inner transition-all duration-200",
        "focus:border-[#8b4513] focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "font-[family-name:var(--font-crimson)]",
        "appearance-none bg-no-repeat bg-right",
        "pr-10",
        className,
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b4513' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundPosition: "right 0.75rem center",
      }}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = "Select";
