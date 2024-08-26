"use client";

import GoogleLogin from "@/components/auth/googleLogin";
import AppleLogin from "@/components/auth/appleLogin";
import { Button } from "@/components/ui/button";
import CustomLink from "@/components/ui/customLink";

const Auth = () => {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center text-center overflow-hidden px-6 lg:px-0 ">
      <div className="w-full flex flex-col gap-3 lg:max-w-[420px] rounded-xl p-8 bg-slate-300 dark:bg-card">
        <GoogleLogin signInTextPrefix="Sign in with" />
        <AppleLogin signInTextPrefix="Sign in with" />
      </div>
      <div className="flex flex-row gap-1 justify-center items-center">
        <span className="text-muted-foreground">
          Don&apos;t have an account?
        </span>
        <Button
          variant="link"
          className="text-base underline text-muted-foreground !p-0"
          asChild
        >
          <CustomLink href="/register">Sign up</CustomLink>
        </Button>
      </div>
    </div>
  );
};

export default Auth;
