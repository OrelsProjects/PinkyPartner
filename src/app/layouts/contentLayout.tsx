import type { Viewport } from "next";
import ContentProvider from "../providers/ContentProvider";
import HeightProvider from "../providers/HeightProvider";
import AuthProvider from "../providers/AuthProvider";
import DataProvider from "../providers/DataProvider";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function ContentLayout({ children }: RootLayoutProps) {
  return (
    <main>
      <AuthProvider>
        <DataProvider>
          <HeightProvider>
            <ContentProvider>{children}</ContentProvider>
          </HeightProvider>
        </DataProvider>
      </AuthProvider>
    </main>
  );
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
