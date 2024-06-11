"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { useAppDispatch } from "../lib/hooks/redux";
import { setUser } from "../lib/features/auth/authSlice";
import useOnboarding from "../lib/hooks/useOnboarding";
import DummyObligationBox from "../components/contractObligations/dummyObligationBox";
import { FaArrowRightLong, FaR } from "react-icons/fa6";

const Mission = () => {
  const [expandMission, setExpandMission] = React.useState(false);

  useEffect(() => {
    // if expandMission is true, the height will be 1.5 times the original height
    // if expandMission is false, the height will be the original height
    // the transition duration is 0.5 seconds
    // the easing function is a cubic bezier curve
    // the height is set to 12rem when the component is mounted
    console.log("expandMission", expandMission);
  }, []);

  return (
    <motion.div
      // if expandMission is true, the height will be 1.5 times the original height
      // if expandMission is false, the height will be the original height
      // the transition duration is 0.5 seconds
      // the easing function is a cubic bezier curve
      animate={{
        height: expandMission ? "100vh" : "11.5rem",
      }}
      transition={{
        duration: 0.8,
        type: "spring",
      }}
      className="max-w-xl min-h-[15rem] lg:min-h-[11.5rem] max-h-[25rem] lg:max-h-[19.5rem] flex flex-col justify-start items-start bg-card p-4 rounded-xl text-base font-light overflow-hidden"
    >
      <motion.span
        // whileHover={{ translateX: 5 }}
        animate={{ translateX: expandMission ? 5 : 0 }}
        transition={{
          duration: 0.6,
          bounce: 0.5,
          type: "spring",
        }}
        className="text-xl font-bold flex flex-row justify-start items-center mb-2 lg:hover:cursor-pointer lg:hover:underline"
        onClick={() => setExpandMission(!expandMission)}
      >
        My mission
        <motion.div
          className="h-full inline-flex justify-center items-center text-primary text-xl ml-1.5"
          animate={{
            translateX: expandMission ? [0, 5] : 0,
          }}
          transition={{
            duration: 0.6,
            bounce: 0.5,
            type: "spring",
          }}
        >
          <FaArrowRightLong />
        </motion.div>
      </motion.span>
      <p>
        Loneliness and burn out are an integral part of being a solopreneur.
      </p>
      <p>But they don&apos;t have to be.</p>
      <br />
      <p>By changing your habits and having someone to share it with,</p>
      <p>you can avoid both.</p>
      <br />
      <p>
        I have experienced the effect of having someone to build new habits with
        first hand. And it felt great.
      </p>
      <br />
      <p> Now, I want to help you experience the same.</p>
    </motion.div>
  );
};

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
        <Mission />
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
