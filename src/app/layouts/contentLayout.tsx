import type { Viewport } from "next";
import ContentProvider from "../providers/ContentProvider";
import HeightProvider from "../providers/HeightProvider";
import AuthProvider from "../providers/AuthProvider";
import DataProvider from "../providers/DataProvider";
import NextTopLoader from "nextjs-toploader";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function ContentLayout({ children }: RootLayoutProps) {
  return (
    <main>
      <AuthProvider>
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
              {children}
            </ContentProvider>
          </HeightProvider>
        </DataProvider>
      </AuthProvider>
    </main>
  );
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
