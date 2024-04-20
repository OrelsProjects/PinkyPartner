"use client";

import React from "react";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "../../../components/theme-toggle";

export default function Home() {
  const router = useRouter();
  return (
    <div className="w-full h-full">
      <h1>Home</h1>
      <Button
        onClick={() => {
          router.push("/obligations");
        }}
      >
        Add Obligation
      </Button>
      <ThemeToggle />
    </div>
  );
}
