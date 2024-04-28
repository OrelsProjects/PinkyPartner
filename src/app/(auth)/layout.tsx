import AuthLayout from "../layouts/AuthLayout";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: RootLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>;
}