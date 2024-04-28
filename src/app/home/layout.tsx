import ContentLayout from "../layouts/contentLayout";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: RootLayoutProps) {
  return <ContentLayout>{children}</ContentLayout>;
}