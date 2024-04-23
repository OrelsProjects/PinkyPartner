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
import { Repeat } from "../../../models/obligation";

interface IntervalDropdownProps {
  onSelect: (interval: Repeat) => void;
  defaultValue?: Repeat;
  error?: string;
}

const IntervalDropdown: React.FC<IntervalDropdownProps> = ({
  onSelect,
  defaultValue = "Daily",
  error,
}) => {
  const [selected, setSelected] = useState<Repeat>(defaultValue);
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
              setSelected(interval as Repeat);
              onSelect(interval as Repeat);
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
