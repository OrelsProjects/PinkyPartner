"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { IoCheckmark } from "react-icons/io5";
import { cn } from "@/lib/utils";

type variant = "default" | "outline";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    variant?: variant;
    error?: any | null;
  }
>(({ className, error, variant = "default", ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        variant === "outline"
          ? "peer h-4 w-4 shrink-0 rounded-sm border-[1px] border-foreground/60 text-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-card data-[state=checked]:border-primary data-[state=checked]:text-primary"
          : "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      {variant === "outline" ? (
        <div className="w-full h-full flex justify-center items-center">
          <IoCheckmark className="h-4 w-4 font-bold" />
        </div>
      ) : (
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center")}
        >
          <IoCheckmark className="h-4 w-4 font-bold" />
        </CheckboxPrimitive.Indicator>
      )}
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
