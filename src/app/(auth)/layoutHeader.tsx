"use client";

import React from "react";
import { SparklesCore } from "../../components/ui/sparkles";
import { useTheme } from "next-themes";
import Link from "next/link";

const AuthHeader = () => {
  const { theme } = useTheme();

  return (
    <div className="h-[10rem] w-full absolute top-10 lg:top-10 flex flex-col items-center justify-start overflow-hidden rounded-md">
      <Link
        className="md:text-7xl text-[2.5rem] lg:text-7xl font-bold text-center relative z-20 "
        href={"/"}
      >
        PinkyPartner
      </Link>
      <div className="w-[15rem] lg:w-[40rem] h-24 lg:h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-8 lg:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-8 lg:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-24 lg:inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-24 lg:inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div
          className="absolute inset-0 w-full h-full bg-background
        [mask-image:radial-gradient(150px_100px_at_top,transparent_20%,white)]
        lg:[mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"
        ></div>
      </div>
    </div>
  );
};

export default AuthHeader;
