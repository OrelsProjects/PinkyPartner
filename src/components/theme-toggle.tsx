"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Switch } from "./ui/switch";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Switch
      className="w-10"
      defaultChecked={theme === "dark"}
      checkedIcon={<Moon className="h-4 w-4" />}
      uncheckedIcon={<Sun className="h-4 w-4" />}
      onCheckedChange={checked => {
        setTheme(checked ? "dark" : "light");
      }}
    />
  );
}
