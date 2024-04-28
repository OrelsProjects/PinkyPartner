"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Button } from "../components/ui/button";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="absolute inset-0 flex flex-col gap-1 justify-center items-center">
      Whoops! Page not found.{" "}
      <Button onClick={() => router.push("/")}>Go back home</Button>
    </div>
  );
};

export default NotFound;
