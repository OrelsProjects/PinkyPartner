import type { Metadata, Viewport } from "next";
import "./globals.css";
import StoreProvider from "./providers/StoreProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import SessionWrapper from "./providers/SessionWrapper";

const APP_NAME = "PinkyPartner";
const APP_DEFAULT_TITLE = "PinkyPartner";
const APP_TITLE_TEMPLATE = "%s - PinkyPartner";
const APP_DESCRIPTION = "Do stuff with your partner!";

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
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export default function LocaleLayout({ children, locale }: RootLayoutProps) {
  return (
    <html lang={locale}>
      <body className="!overscroll-none">
        <StoreProvider>
          <SessionWrapper>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </SessionWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
