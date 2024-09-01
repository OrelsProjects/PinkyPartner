"use client";

import React, { Suspense, useEffect, useState } from "react";
import "@/../firebase.config";
import type { Viewport } from "next";
import ContentProvider from "@/app/providers/ContentProvider";
import HeightProvider from "@/app/providers/HeightProvider";
import AuthProvider from "@/app/providers/AuthProvider";
import DataProvider from "@/app/providers/DataProvider";
import NotificationsProvider from "@/app/providers/NotificationsProvider";
import OnboardingProvider from "@/app/providers/OnboardingProvider";
import AnimationProvider from "@/app/providers/AnimationProvider";
import TopLoaderProvider from "@/app/providers/TopLoaderProvider";
import { useAppDispatch } from "@/lib/hooks/redux";
import PullToRefresh from "@/components/ui/pullToRefresh";
import { setForceFetch } from "@/lib/features/auth/authSlice";
import Loading from "@/components/ui/loading";
import { usePathname } from "next/navigation";
import { BottomBarItems } from "@/components/navigationBar/_consts";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function ContentLayout({ children }: RootLayoutProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const [pageTitle, setPageTitle] = useState<string | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      console.log("Registering service worker");
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(function (registration) {
          registration.update(); // Check for updates immediately after registering
        });
    }
  }, []);

  useEffect(() => {
    for (const item of BottomBarItems) {
      if (pathname.includes(item.href)) {
        setPageTitle(
          item.header || (process.env.NEXT_PUBLIC_APP_NAME as string),
        );
        break;
      }
    }
  }, [pathname]);
  return (
    <main>
      <Suspense
        fallback={
          <Loading spinnerClassName="absolute top-1/2 left-1/2 h-10 w-10" />
        }
      >
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
                  <AnimationProvider>
                    <PayPalScriptProvider
                      options={{
                        clientId: process.env
                          .NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
                        vault: true, // Enable vault to store payment details
                        currency: "USD",
                      }}
                    >
                      {children}
                    </PayPalScriptProvider>
                  </AnimationProvider>
                </PullToRefresh>
              </ContentProvider>
            </HeightProvider>
          </DataProvider>
          <OnboardingProvider />
        </AuthProvider>
      </Suspense>
    </main>
  );
}

export const viewport: Viewport = {
  themeColor: "#121212",
};
