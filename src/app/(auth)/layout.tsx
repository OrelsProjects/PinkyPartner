import AuthLayout from "../layouts/authLayout";``

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: RootLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>;
}