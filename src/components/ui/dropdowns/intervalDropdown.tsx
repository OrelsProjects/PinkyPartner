"use client";
import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdOutlineKeyboardArrowDown as ArrowDown } from "react-icons/md";
import { ObligationRepeat } from "@/models/obligation";

interface IntervalDropdownProps {
  onSelect: (interval: ObligationRepeat) => void;
  defaultValue?: ObligationRepeat;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const IntervalDropdown: React.FC<IntervalDropdownProps> = ({
  onSelect,
  defaultValue = "Daily",
  className,
  disabled,
  error,
}) => {
  const [selected, setSelected] = useState<ObligationRepeat>(defaultValue);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className={`border border-1 border-input rounded-md p-2 ${className || ""}
        ${error ? "border-red-400" : ""}
        `}
      >
        <div className="flex flex-row justify-center items-center gap-5">
          <div className="font-light">{selected}</div>
          <ArrowDown />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Repeat</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {["Daily", "Weekly"].map(interval => (
          <DropdownMenuItem
            key={interval}
            onSelect={() => {
              setSelected(interval as ObligationRepeat);
              onSelect(interval as ObligationRepeat);
            }}
          >
            {interval}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default IntervalDropdown;
