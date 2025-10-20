import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-secondary border-2 border-gray-200 bg-white px-4 py-3 text-base text-charcoal-900 placeholder:text-secondary-light transition-all duration-200 resize-y",
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
Textarea.displayName = "Textarea";

export { Textarea };
