"use client";

import React from "react";
import useAuth from "@/lib/hooks/useAuth";
import { FaApple } from "react-icons/fa";
import { EventTracker } from "@/eventTracker";
import { toast } from "react-toastify";
import Loading from "../ui/loading";
import { motion } from "framer-motion";

interface AppleLoginProps {
  className?: string;
  signInTextPrefix?: string;
}

export default function AppleLogin({
  className,
  signInTextPrefix,
}: AppleLoginProps) {
  const { signInWithApple } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [showThanks, setShowThanks] = React.useState(false);

  const handleAppleLogin = async () => {
    await signInWithApple();
  };

  const requestAppleSignIn = () => {
    EventTracker.track("apple_sign_in_request");
    setLoading(true);
    const randomBetween700and1200 = Math.floor(Math.random() * 500) + 700;
    setTimeout(() => {
      setLoading(false);
      setShowThanks(true);
      setTimeout(() => {
        setShowThanks(false);
      }, 3000);
    }, randomBetween700and1200);
  };

  return (
    <div
      className={`w-full h-12 flex flex-row gap-2 justify-center hover:cursor-pointer items-center bg-black rounded-lg text-white ${className}`}
      onClick={requestAppleSignIn}
    >
      {loading ? (
        <Loading className="w-7 h-7" />
      ) : (
        <div
          className={`w-full h-12 flex flex-row gap-2 justify-center items-center rounded-lg hover:cursor-pointer`}
          onClick={handleAppleLogin}
        >
          <FaApple className="w-7 h-7" />
          <h1 className="uppercase">{signInTextPrefix} APPLE</h1>
        </div>
      )}
    </div>
  );
}
