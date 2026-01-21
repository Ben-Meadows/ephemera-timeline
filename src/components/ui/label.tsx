import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium text-[#5c4033] tracking-wide",
        "font-[family-name:var(--font-typewriter)] uppercase text-xs",
        className,
      )}
      {...props}
    />
  ),
);

Label.displayName = "Label";
