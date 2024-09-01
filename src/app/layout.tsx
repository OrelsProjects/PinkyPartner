import type { Metadata } from "next";
import "./globals.css";
import "@dotlottie/react-player/dist/index.css";
import StoreProvider from "./providers/StoreProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import SessionWrapper from "./providers/SessionWrapper";
import React, { Suspense } from "react";
import LiveChatProvider from "./providers/LiveChatProvider";
import AuthProvider from "./providers/AuthProvider";
import TopLoaderProvider from "./providers/TopLoaderProvider";
import ChallengeProvider from "./providers/ChallengeProvider";
import Loading from "../components/ui/loading";
import Head from "next/head";
// import ProductHuntProvider from "./providers/ProductHuntProvider";

const OG_IMAGE_URL = process.env.NEXT_PUBLIC_OG_IMAGE_UR as string;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME as string;
const APP_DEFAULT_TITLE = process.env.NEXT_PUBLIC_APP_DEFAULT_TITLE as string;
const APP_TITLE_TEMPLATE = process.env.NEXT_PUBLIC_APP_TITLE_TEMPLATE as string;
const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION as string;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL as string;
const APP_STARTUP_IMAGE = process.env.NEXT_PUBLIC_APP_STARTUP_IMAGE as string;

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
      <Head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#00000000" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:image" content="<generated>" />
        <meta property="og:image:type" content="<generated>" />
        <meta property="og:image:width" content="<generated>" />
        <meta property="og:image:height" content="<generated>" />
      </Head>
      <body className="!overscroll-contain">
        <Suspense
          fallback={
            <Loading spinnerClassName="absolute top-1/2 left-1/2 h-10 w-10" />
          }
        >
          <LiveChatProvider />
          <StoreProvider>
            <SessionWrapper>
              <ThemeProvider>
                <AuthProvider>
                  <TopLoaderProvider />
                  {/* <ProductHuntProvider /> */}
                  <ChallengeProvider />
                  {children}
                  {/* <SpeedInsights />
                <Analytics /> */}
                </AuthProvider>
              </ThemeProvider>
            </SessionWrapper>
          </StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}
