"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Button } from "../components/ui/button";

const NotFound = () => {
  const router = useRouter();

  return (
    <div>
      Whoops! Page not found.{" "}
      <Button onClick={() => router.push("/")}>Go back home</Button>
    </div>
  );
};

export default NotFound;
