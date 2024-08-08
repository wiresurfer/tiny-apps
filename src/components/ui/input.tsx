import * as React from "react";

import { cn } from "./lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "my-4 flex h-12 mx-4 w-full rounded-md border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-blue-500 hover:file:bg-blue-400 file:text-sm  file:p-2 file:rounded-xl file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text:p-4 file:px-4 file:mr-4",
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
