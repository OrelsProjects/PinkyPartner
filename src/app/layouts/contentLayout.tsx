"use client";

import React from "react";
import "../../../firebase.config";
import type { Viewport } from "next";
import ContentProvider from "../providers/ContentProvider";
import HeightProvider from "../providers/HeightProvider";
import AuthProvider from "../providers/AuthProvider";
import DataProvider from "../providers/DataProvider";
import NotificationsProvider from "../providers/NotificationsProvider";
import OnboardingProvider from "../providers/OnboardingProvider";
import AnimationProvider from "../providers/AnimationProvider";
import TopLoaderProvider from "../providers/TopLoaderProvider";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function ContentLayout({ children }: RootLayoutProps) {
  return (
    <main>
      <AuthProvider>
        <NotificationsProvider />
        <DataProvider>
          <HeightProvider>
            <ContentProvider>
              <TopLoaderProvider />
              <AnimationProvider>{children}</AnimationProvider>
            </ContentProvider>
          </HeightProvider>
        </DataProvider>
        <OnboardingProvider />
      </AuthProvider>
    </main>
  );
}

export const viewport: Viewport = {
  themeColor: "#121212",
};
