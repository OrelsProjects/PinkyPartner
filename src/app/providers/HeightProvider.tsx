"use client";

import React, { useContext, useEffect } from "react";
import SizeContext from "../../lib/context/sizeContext";
import BrowserContext from "../../lib/context/browserContext";

// this one calculates the height of the screen and sets it as max height
// for the children
export default function HeightProvider({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const browser = useContext(BrowserContext);
  const [height, setHeight] = React.useState<number>(0);
  const [width, setWidth] = React.useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      console.log("resize");
      console.log(window.innerHeight);
      console.log(window.innerWidth);
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [window.innerHeight, window.innerWidth, window]);

  return (
    <SizeContext.Provider value={{ height, width }}>
      <div
        className={`w-full h-full ${className}
        ${browser === "safari" ? "h-screen" : ""} pb-[calc(max(env(safe-area-inset-bottom),16px)-16px)]
        `}
        style={{ height: `${height}px` }}
      >
        {children}
      </div>
    </SizeContext.Provider>
  );
}
