"use client";
import { useEffect } from "react";
import * as NProgress from "nprogress";

export default function LoadingPage() {
  useEffect(() => {
    NProgress.start();
    NProgress.configure({ showSpinner: false });
    return () => {
      NProgress.done();
    };
  }, []);
}
