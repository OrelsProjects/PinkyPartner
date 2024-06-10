"use client";

import React from "react";
import * as toast from "react-toastify";

interface ToastProviderProps {
  className?: string;
}

export default function ToastProvider({ className }: ToastProviderProps) {
  return (
    <div className="relative z-[51]">
      <toast.ToastContainer
        stacked
        newestOnTop
        theme={"colored"}
        autoClose={1500}
        draggablePercent={60}
        className={className}
        transition={toast.Flip}
        position="bottom-center"
        pauseOnHover={false}
      />
    </div>
  );
}
