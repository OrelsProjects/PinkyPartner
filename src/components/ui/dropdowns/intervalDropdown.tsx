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
import { ObligationRepeat } from "../../../models/obligation";

interface IntervalDropdownProps {
  onSelect: (interval: ObligationRepeat) => void;
  defaultValue?: ObligationRepeat;
  error?: string;
}

const IntervalDropdown: React.FC<IntervalDropdownProps> = ({
  onSelect,
  defaultValue = "Daily",
  error,
}) => {
  const [selected, setSelected] = useState<ObligationRepeat>(defaultValue);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border border-1 border-input rounded-md p-2">
        {selected}
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
