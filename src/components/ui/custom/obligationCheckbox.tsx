"use client";
import React from "react";
import { cn } from "../../../lib/utils";
import { IoRemoveOutline as Line } from "react-icons/io5";
import { dayNumberToName } from "../../../lib/utils/dateUtils";

interface ObligationCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline";
  onCheckedChange: (checked: boolean) => void;
  dueDate: Date;
}

const CheckboxLayout = ({
  date,
  checked,
  onClick,
  disabled,
}: {
  date?: Date;
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) => {
  const safeDate = date ? new Date(date) : new Date(); // date can also be a string
  const day = safeDate.getUTCDay();
  const dayString = dayNumberToName(day).slice(0, 3);
  const dayOfMonth = safeDate.getUTCDate();

  return (
    <div
      className={cn(
        "flex items-center justify-center flex-col w-10 h-14 border border-muted bg-card/30 rounded-xl gap-0 p-0.5",
        {
          "cursor-not-allowed opacity-50": disabled,
          // If checked, show a background color of gradient that starts from primary(bottom) to foreground(top)
          "bg-gradient-to-t from-primary to-primary-lighter text-foreground":
            checked,
        },
      )}
      onClick={onClick}
    >
      <span className="text-xs">{dayString}</span>
      <Line className="w-8 h-4 px-1 -rotate-12" />
      <span className="text-xs">{dayOfMonth}</span>
    </div>
  );
};

const ObligationCheckbox = React.forwardRef<
  HTMLInputElement,
  ObligationCheckboxProps
>(
  (
    {
      variant,
      checked,
      disabled,
      className,
      dueDate,
      onCheckedChange,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("w-fit h-fit", className)}>
        <CheckboxLayout
          date={dueDate}
          checked={checked}
          onClick={() => {
            if (disabled) return;
            onCheckedChange(!checked);
          }}
          disabled={disabled}
        />
      </div>
    );
  },
);

ObligationCheckbox.displayName = "ObligationCheckbox";

export default ObligationCheckbox;
