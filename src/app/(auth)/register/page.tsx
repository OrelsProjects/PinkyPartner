"use client";

import GoogleLogin from "../../../components/auth/googleLogin";
import AppleLogin from "../../../components/auth/appleLogin";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const RegisterPage = () => {
  const searchParams = useSearchParams();

  const referralCode = useMemo(() => {
    return searchParams.get("referralCode") || undefined;
  }, [searchParams]);

  const router = useRouter();
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center text-center overflow-hidden px-6 lg:px-0 ">
      <div className="w-full flex flex-col gap-3 lg:max-w-[420px] rounded-xl p-8 bg-card">
        <GoogleLogin
          signInTextPrefix="Sign up with"
          referralCode={referralCode}
        />
        <AppleLogin
          signInTextPrefix="Sign up with"
          referralCode={referralCode}
        />
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

export default RegisterPage;
