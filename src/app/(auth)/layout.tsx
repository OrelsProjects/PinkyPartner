import AuthLayout from "../layouts/authLayout";
import AuthHeader from "./layoutHeader";

interface RootLayoutProps {
  children: React.ReactNode;
}


export default function Layout({ children }: RootLayoutProps) {

  return (
    <AuthLayout>
      <AuthHeader />
      {children}
    </AuthLayout>
  );
}
