"use client";

import React from "react";
import "../../../firebase.config";
import type { Viewport } from "next";
import ContentProvider from "../providers/ContentProvider";
import HeightProvider from "../providers/HeightProvider";
import AuthProvider from "../providers/AuthProvider";
import DataProvider from "../providers/DataProvider";
import NextTopLoader from "nextjs-toploader";
import NotificationsProvider from "../providers/NotificationsProvider";
import OnboardingProvider from "../providers/OnboardingProvider";
import AnimationProvider from "../providers/AnimationProvider";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function ContentLayout({ children }: RootLayoutProps) {
  return (
    <main>
      <AuthProvider>
        <NotificationsProvider>
          <DataProvider>
            <HeightProvider>
              <ContentProvider>
                <NextTopLoader
                  color="hsl(var(--primary))"
                  initialPosition={0.08}
                  crawlSpeed={250}
                  height={3}
                  crawl={true}
                  showSpinner={false}
                  easing="ease"
                  speed={1500}
                  shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
                />
                <AnimationProvider>{children}</AnimationProvider>
              </ContentProvider>
            </HeightProvider>
          </DataProvider>
          <OnboardingProvider />
        </NotificationsProvider>
      </AuthProvider>
    </main>
  );
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
