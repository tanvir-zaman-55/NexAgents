import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95",
        secondary:
          "bg-secondary text-white shadow-md hover:bg-secondary-hover hover:shadow-lg hover:scale-105 active:scale-95",
        accent:
          "bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30 hover:scale-105 active:scale-95",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white hover:scale-105 active:scale-95",
        ghost:
          "text-primary hover:bg-primary/10 hover:scale-105 active:scale-95",
        professional:
          "bg-charcoal-900 text-white shadow-lg hover:bg-charcoal-800 hover:shadow-xl hover:scale-105 active:scale-95",
        "professional-accent":
          "bg-bronze text-white shadow-lg shadow-bronze/25 hover:bg-bronze-600 hover:shadow-xl hover:shadow-bronze/30 hover:scale-105 active:scale-95",
        tech:
          "bg-gradient-accent text-white shadow-lg shadow-cyber/25 hover:shadow-xl hover:shadow-cyber/30 hover:scale-105 active:scale-95",
        warm:
          "bg-amber text-white shadow-lg shadow-amber/25 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber/30 hover:scale-105 active:scale-95",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        xl: "h-16 px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
