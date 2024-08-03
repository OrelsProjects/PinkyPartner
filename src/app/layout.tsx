import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./providers/StoreProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import SessionWrapper from "./providers/SessionWrapper";
import React from "react";
import LiveChatProvider from "./providers/LiveChatProvider";
import AuthProvider from "./providers/AuthProvider";
import TopLoaderProvider from "./providers/TopLoaderProvider";
// import ProductHuntProvider from "./providers/ProductHuntProvider";

const OG_IMAGE_URL =
  "https://firebasestorage.googleapis.com/v0/b/myworkout-ca350.appspot.com/o/og-image.png?alt=media&token=7402d6a6-b8fa-4881-98ad-02e4656578a4";
const APP_NAME = "PinkyPartner";
const APP_DEFAULT_TITLE = "PinkyPartner";
const APP_TITLE_TEMPLATE = "%s - PinkyPartner";
const APP_DESCRIPTION = "Create habits with a partner!";
const APP_URL = "https://www.pinkypartner.com";
const APP_STARTUP_IMAGE = "/favicon.ico";

interface RootLayoutProps {
  children: React.ReactNode;
  locale: never;
}

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    startupImage: APP_STARTUP_IMAGE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: APP_NAME,
    url: APP_URL,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: { url: OG_IMAGE_URL, width: 1200, height: 630 },
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: { url: OG_IMAGE_URL, width: 1200, height: 630 },
  },
};

export default function Layout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="font-montserrat">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#00000000" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:image" content="<generated>" />
        <meta property="og:image:type" content="<generated>" />
        <meta property="og:image:width" content="<generated>" />
        <meta property="og:image:height" content="<generated>" />
      </head>
      <body className="!overscroll-contain">
        <LiveChatProvider />
        <StoreProvider>
          <SessionWrapper>
            <ThemeProvider>
              <AuthProvider>
                <TopLoaderProvider />
                {/* <ProductHuntProvider /> */}
                {children}
                {/* <SpeedInsights />
                <Analytics /> */}
              </AuthProvider>
            </ThemeProvider>
          </SessionWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}
