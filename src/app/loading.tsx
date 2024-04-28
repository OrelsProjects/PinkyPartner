import React from "react";
import { LoadingSvg } from "../components/ui/loading";

export default function Loading() {
  return (
    <div className="absolute inset-0 flex justify-center items-center">
      <LoadingSvg className="h-20 w-20"/>
    </div>
  );
}
