"use client";

import React from "react";
import { HeroHighlight, Highlight } from "../components/ui/heroHighlight";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "../components/ui/textGenerateEffect";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { useAppDispatch } from "../lib/hooks/redux";
import { setUser } from "../lib/features/auth/authSlice";
import useOnboarding from "../lib/hooks/useOnboarding";

const Header = ({
  onGetStarted,
  getStartedUrl,
}: {
  onGetStarted: () => void;
  getStartedUrl: string;
}) => (
  <header className="w-full fixed top-0 left-0 h-20 flex flex-row justify-center items-center py-2 bg-card z-50">
    <div className="w-full px-4 lg:px-0 lg:w-[863px] flex flex-row justify-between items-center">
      <div className="text-3xl md:text-4xl font-medium text-foreground">
        PinkyPartner
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

const HeroSection = ({ onNext }: { onNext?: () => void }) => (
  <HeroHighlight
    containerClassName="items-center h-screen w-full relative"
    className="h-screen flex justify-start items-center pt-20 md:pt-0"
  >
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
      className="w-full h-80 md:h-fit text-2xl md:text-4xl lg:text-5xl font-medium text-start leading-relaxed lg:leading-snug mx-auto lg:w-[863px]"
    >
      <div className="flex flex-col lg:flex-row justify-start gap-1 tracking-tighter">
        <TextGenerateEffect
          words={"Building habits is hard "}
          className="!font-medium"
        />
        <Highlight
          className="
          w-fit
          from-orange-400 to-red-400 dark:from-orange-500 dark:to-red-500
          text-white
          "
          duration={0.8}
          delay={0.8}
        >
          Alone.
        </Highlight>
      </div>
      <div className="flex flex-col lg:flex-row justify-start gap-1 tracking-tighter">
        <TextGenerateEffect
          words="But it's easier when you have a"
          delay={2}
          className="hidden lg:block !font-medium"
        />
        <TextGenerateEffect
          words="But it's easier with a"
          delay={2.5}
          className="lg:hidden !font-medium"
        />
        <Highlight
          duration={0.8}
          delay={3.5}
          className="w-fit from-blue-400 to-indigo-400 dark:from-blue-500 dark:to-indigo-500 text-white"
        >
          Partner.
        </Highlight>
      </div>
    </motion.div>

    {onNext && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5 }}
        className="z-30 absolute bottom-0 inset-x-0"
      ></motion.div>
    )}
  </HeroHighlight>
);

export default function Home() {
  const { isOnboardingCompleted } = useOnboarding();
  const dispatch = useAppDispatch();
  return (
    <div className="h-full w-full gap-1 flex flex-col overflow-auto relative">
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
      <HeroSection />
    </div>
  );
}
