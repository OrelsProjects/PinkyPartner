import React from "react";
import useAuth from "../../lib/hooks/useAuth";
import { FcGoogle } from "react-icons/fc";

interface GoogleLoginProps {
  className?: string;
  signInTextPrefix?: string;
}

export default function GoogleLogin({
  className,
  signInTextPrefix,
}: GoogleLoginProps) {
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div
      className={`w-full h-12 flex flex-row gap-2 justify-center items-center bg-white rounded-lg text-black ${className}`}
      onClick={handleGoogleLogin}
    >
      <FcGoogle className="w-7 h-7" />
      <h1 className="uppercase">{signInTextPrefix} Google</h1>
    </div>
  );
}
