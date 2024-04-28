"use client";

import { ThemeToggle } from "../../../components/theme-toggle";
import useAuth from "../../../lib/hooks/useAuth";
import GoogleLogin from "../../../components/auth/googleLogin";
import AppleLogin from "../../../components/auth/appleLogin";
import Divider from "../../../components/ui/divider";
import EmailLogin from "../../../components/auth/emailLogin";

const Auth = () => {

  return (
    <div className="h-full w-full flex flex-col justify-center items-center text-center overflow-hidden">
      <div className="w-full flex flex-col gap-3 lg:max-w-[420px] lg:bg-muted/20 lg:rounded-xl p-8">
        <GoogleLogin signInTextPrefix="Sign in with" />
        <AppleLogin signInTextPrefix="Sign in with" />
        {/* <Divider textInCenter="OR" className="my-4" />
        <EmailLogin /> */}
      </div>
    </div>
  );
};

export default Auth;
