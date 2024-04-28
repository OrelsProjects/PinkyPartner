"use client";

import { ThemeToggle } from "../../../components/theme-toggle";
import useAuth from "../../../lib/hooks/useAuth";
import GoogleLogin from "../../../components/auth/googleLogin";
import AppleLogin from "../../../components/auth/appleLogin";
import Divider from "../../../components/ui/divider";
import EmailLogin from "../../../components/auth/emailLogin";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";

const Auth = () => {
  const router = useRouter();
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center text-center overflow-hidden">
      <div className="w-full flex flex-col gap-3 lg:max-w-[420px] bg-muted/20 rounded-xl p-8">
        <GoogleLogin signInTextPrefix="Sign up with" register />
        <AppleLogin signInTextPrefix="Sign up with" register />
        {/* <Divider textInCenter="OR" className="my-4" />
        <EmailLogin register /> */}
      </div>
      <div className="flex flex-row gap-1 justify-center items-center">
        <span className="text-muted-foreground">Already have an account?</span>
        <Button
          variant="link"
          onClick={() => router.push("/login")}
          className="text-base underline text-muted-foreground !p-0"
        >
          Login
        </Button>
      </div>
    </div>
  );
};

export default Auth;
