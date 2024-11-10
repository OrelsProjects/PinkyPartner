import React from "react";
import ContentLayout from "../layouts/contentLayout";
import WeeklyStatusProvider from "./WeeklyStatusProvider";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: RootLayoutProps) {
  return (
    <ContentLayout>
      <WeeklyStatusProvider>{children}</WeeklyStatusProvider>
    </ContentLayout>
  );
}
