"use client";

import React from "react";
import { Button } from "../components/ui/button";
import { useCustomRouter } from "../lib/hooks/useCustomRouter";

const NotFound = () => {
  const router = useCustomRouter();

  return (
    <div className="absolute inset-0 flex flex-col gap-1 justify-center items-center">
      Whoops! Page not found.{" "}
      <Button onClick={() => router.push("/home")}>Go back home</Button>
    </div>
  );
};

export default NotFound;
