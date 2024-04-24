"use client";

import React, { useEffect } from "react";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "../../components/theme-toggle";
import * as NProgress from "nprogress";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    NProgress.start();
    NProgress.inc(0.5);
  }, []);

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
