import React, { useEffect } from "react";
import ContentLayout from "../layouts/contentLayout";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: RootLayoutProps) {
  useEffect(() => {
    // use window to set display mode standalone
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("display-mode is standalone");
    }
    
  }, []);

  return <ContentLayout>{children}</ContentLayout>;
}
