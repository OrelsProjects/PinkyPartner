import React from "react";
import useAuth from "../../lib/hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { InvalidCredentialsError } from "../../models/errors/InvalidCredentialsError";
import { toast } from "react-toastify";
import { UnknownUserError } from "../../models/errors/UnknownUserError";
import UserAlreadyExistsError from "../../models/errors/UserAlreadyExistsError";

interface GoogleLoginProps {
  className?: string;
  signInTextPrefix?: string;
  referralCode?: string;
}

export default function GoogleLogin({
  className,
  signInTextPrefix,
  referralCode,
}: GoogleLoginProps) {
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      toast.promise(
        signInWithGoogle({
          referralCode: referralCode,
        }),
        {
          pending: "Signing in...",
        },
      );
    } catch (error: any) {
      if (error instanceof InvalidCredentialsError) {
        toast.error("Invalid credentials");
      } else if (error instanceof UnknownUserError) {
        toast.error("Unknown user");
      } else if (error instanceof UserAlreadyExistsError) {
        toast.error("User already exists");
      } else {
        toast.error("Unknown error");
      }
    }
  };

  return (
    <div
      className={`w-full h-12 flex flex-row gap-2 bg-background dark:bg-card justify-center items-center rounded-lg hover:cursor-pointer ${className}`}
      onClick={handleGoogleLogin}
    >
      <FcGoogle className="w-7 h-7" />
      <h1 className="uppercase">{signInTextPrefix} Google</h1>
    </div>
  );
}
