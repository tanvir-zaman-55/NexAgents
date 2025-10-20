import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-secondary border-2 border-gray-200 bg-white px-4 py-3 text-base text-charcoal-900 placeholder:text-secondary-light transition-all duration-200",
          "focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none",
          "hover:border-gray-300",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
