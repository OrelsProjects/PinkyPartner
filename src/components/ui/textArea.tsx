import * as React from "react";

import { cn } from "@/lib/utils";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  resize?: boolean;
  loading?: boolean;
  error?: string;
  label?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, resize, loading, error, label, ...props }) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm text-foreground">{label}</label>}
        <textarea
          className={cn(
            //           "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",

            "flex h-full w-full relative border border-input rounded-lg bg-background px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            resize ? "resize" : "resize-none",
            error ? "border-error" : "",
            error ? "animation-error-fade" : "animate-none",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
TextArea.displayName = "TextArea";

export { TextArea };
