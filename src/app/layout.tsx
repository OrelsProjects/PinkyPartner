import type { Metadata, Viewport } from "next";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import StoreProvider from "./providers/StoreProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import AuthProvider from "./providers/AuthProvider";
import SessionWrapper from "./providers/SessionWrapper";
import DataProvider from "./providers/DataProvider";
import HeightProvider from "./providers/HeightProvider";
import ContentProvider from "./providers/ContentProvider";

const APP_NAME = "Fit Bud";
const APP_DEFAULT_TITLE = "Fit Bud";
const APP_TITLE_TEMPLATE = "%s - Fit Bud";
const APP_DESCRIPTION = "Do stuff with your buddy!";

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
              <AuthProvider>
                <DataProvider>
                  <HeightProvider>
                    <ContentProvider>{children}</ContentProvider>
                  </HeightProvider>
                </DataProvider>
              </AuthProvider>
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
