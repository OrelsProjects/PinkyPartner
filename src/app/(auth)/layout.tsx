import { Suspense } from "react";
import AuthLayout from "../layouts/authLayout";
import AuthHeader from "./layoutHeader";
import Loading from "../../components/ui/loading";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: RootLayoutProps) {
  return (
    <Suspense
      fallback={
        <Loading spinnerClassName="absolute top-1/2 left-1/2 h-10 w-10" />
      }
    >
      <AuthLayout>
        <AuthHeader />
        {children}
      </AuthLayout>
    </Suspense>
  );
}
