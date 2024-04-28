import React from "react";
import { LoadingSvg } from "../components/ui/loading";

export default function Loading() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <LoadingSvg className="h-20 w-20"/>
    </div>
  );
}
