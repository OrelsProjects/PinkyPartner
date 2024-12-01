"use client";

import React from "react";
import type { Viewport } from "next";
import ContentProvider from "../providers/ContentProvider";
import HeightProvider from "../providers/HeightProvider";
import AuthProvider from "../providers/AuthProvider";
import DataProvider from "../providers/DataProvider";
import NotificationsProvider from "../providers/NotificationsProvider";
import OnboardingProvider from "../providers/OnboardingProvider";
import AnimationProvider from "../providers/AnimationProvider";
import TopLoaderProvider from "../providers/TopLoaderProvider";
import { useAppDispatch } from "@/lib/hooks/redux";
import PullToRefresh from "../../components/ui/pullToRefresh";
import { setForceFetch } from "@/lib/features/auth/authSlice";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function ContentLayout({ children }: RootLayoutProps) {
  const dispatch = useAppDispatch();

  return (
    <main>
      <AuthProvider>
        <NotificationsProvider />
        <DataProvider>
          <HeightProvider>
            <ContentProvider>
              <TopLoaderProvider />
              <PullToRefresh
                onRefresh={async () => {
                  dispatch(setForceFetch(true));
                }}
              >
                <AnimationProvider>{children}</AnimationProvider>
              </PullToRefresh>
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
