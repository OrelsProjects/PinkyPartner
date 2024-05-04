"use client";

import React from "react";
import * as toast from "react-toastify";

export default function ToastProvider() {
  return (
    <div className="relative z-[51]">
      <toast.ToastContainer
        stacked
        newestOnTop
        theme={"colored"}
        autoClose={2500}
        draggablePercent={60}
        className="!mb-16 z-[51] absolute"
        transition={toast.Flip}
        position="bottom-center"
        pauseOnHover={false}
      />
    </div>
  );
}
