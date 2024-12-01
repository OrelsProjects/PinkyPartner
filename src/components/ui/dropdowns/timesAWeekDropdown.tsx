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
import { TimesAWeek } from "../../../lib/models/obligation";

interface TimesAWeekDropdownProps {
  onSelect: (timesAWeek: TimesAWeek) => void;
  defaultValue?: TimesAWeek;
  disabled?: boolean;
  error?: string;
}

const TimesAWeekDropdown: React.FC<TimesAWeekDropdownProps> = ({
  onSelect,
  defaultValue = 1,
  disabled,
  error,
}) => {
  const [selected, setSelected] = useState<TimesAWeek>(defaultValue);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="border border-1 border-input rounded-md p-2 w-10 h-10"
        disabled={disabled}
      >
        {selected}
      </DropdownMenuTrigger>
      <DropdownMenuContent defaultValue={defaultValue}>
        <DropdownMenuLabel>Times a week</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {[1, 2, 3, 4, 5, 6, 7].map(timesAWeek => (
          <DropdownMenuItem
            key={timesAWeek}
            onSelect={() => {
              setSelected(timesAWeek as TimesAWeek);
              onSelect(timesAWeek as TimesAWeek);
            }}
          >
            {timesAWeek}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TimesAWeekDropdown;
