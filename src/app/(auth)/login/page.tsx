"use client";

import GoogleLogin from "../../../components/auth/googleLogin";
import AppleLogin from "../../../components/auth/appleLogin";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";

const Auth = () => {
  const router = useRouter();
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center text-center overflow-hidden">
      <div className="w-full flex flex-col gap-3 lg:max-w-[420px] bg-muted/20 rounded-xl p-8">
        <GoogleLogin signInTextPrefix="Sign in with" />
        <AppleLogin signInTextPrefix="Sign in with" />
        {/* <Divider textInCenter="OR" className="my-4" />
        <EmailLogin /> */}
      </div>
      <div className="flex flex-row gap-1 justify-center items-center">
        <span className="text-muted-foreground">
          Don&apos;t have an account?
        </span>
        <Button
          variant="link"
          onClick={() => router.push("/register")}
          className="text-base underline text-muted-foreground !p-0"
        >
          Sign up
        </Button>
      </div>
    </div>
  );
};

export default Auth;
