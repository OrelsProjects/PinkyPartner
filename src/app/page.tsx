"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { useAppDispatch } from "../lib/hooks/redux";
import { setUser } from "../lib/features/auth/authSlice";
import useOnboarding from "../lib/hooks/useOnboarding";
import DummyObligationBox from "../components/contractObligations/dummyObligationBox";

const Header = ({
  onGetStarted,
  getStartedUrl,
}: {
  onGetStarted: () => void;
  getStartedUrl: string;
}) => (
  <header className="w-full h-20 flex flex-row justify-center items-center py-2 bg-card z-50">
    <div className="w-full px-4 lg:px-0 lg:w-[863px] flex flex-row justify-between items-center">
      <div className="text-3xl md:text-4xl font-medium text-foreground">
        <span className="">P</span>
        <span>inky</span>
        <span className="">P</span>
        <span>artner</span>
      </div>
      <div className="flex flex-row gap-2">
        <Button
          asChild
          variant="outline"
          className="rounded-full h-12 bg-transparent"
        >
          <Link href="/login" className="hidden lg:flex text-base md:text-lg ">
            Login
          </Link>
        </Button>
        <Button
          asChild
          variant="magic"
          className="bg-card"
          onClick={onGetStarted}
        >
          <Link href={getStartedUrl} className="text-lg md:text-xl">
            Get Started
          </Link>
        </Button>
      </div>
    </div>
  </header>
);

const HeroSection = () => {
  return (
    <div className="h-fit w-full lg:w-fit flex justify-center items-center">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="w-full h-fit flex flex-col justify-center items-start gap-14 lg:gap-10 md:h-fit text-5xl md:text-4xl lg:text-5xl font-medium text-start leading-relaxed lg:leading-snug"
      >
        <div className="w-full flex flex-col justify-center items-center lg:justify-start lg:items-start gap-1 tracking-tighter">
          <div className="text-[44px] leading-none lg:text-6xl font-extrabold tracking-tight text-foreground/90">
            Build habits
          </div>
          <div className="text-[44px] leading-none lg:text-6xl font-extrabold tracking-tight text-primary">
            with a partner
          </div>
        </div>
        <div className="w-full lg:w-fit text-center lg:text-start text-lg opacity-90 font-light lg:items-start">
          Stop fighting procrastination alone. <br />
          Start building habits together.
        </div>
        <div className="w-full lg:w-fit flex flex-col justify-center items-center lg:items-start text-foreground/80 text-lg text-center">
          <Button asChild className="text-lg py-6 px-12 text-white">
            <Link href="/register">Take my pinky!</Link>
          </Button>
          <Button variant="link" className="!no-underline w-full ">
            <Link
              href="/login"
              className="!no-underline text-lg text-primary-foreground/80"
            >
              <span className="w-full text-center">I have an account</span>
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default function Home() {
  const { isOnboardingCompleted } = useOnboarding();
  const dispatch = useAppDispatch();
  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-full w-full flex flex-col justify-center items-center gap-14 relative pb-10 overflow-auto">
        <Header
          onGetStarted={() => {
            dispatch(
              setUser({
                state: "anonymous",
                userId: "",
                email: "",
                settings: {
                  showNotifications: false,
                  soundEffects: true,
                },
              }),
            );
          }}
          getStartedUrl={isOnboardingCompleted() ? "/register" : "/home"}
        />
        <div className="h-fit w-full flex flex-col lg:flex-row lg:justify-between max-w-6xl mx-auto px-4 gap-14">
          <HeroSection />
          <div className="h-fit w-full lg:w-fit justify-center items-center">
            <DummyObligationBox />
          </div>
        </div>
      </div>
    </div>
  );
}
