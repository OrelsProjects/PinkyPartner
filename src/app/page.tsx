"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { useAppDispatch } from "../lib/hooks/redux";
import { setUser } from "../lib/features/auth/authSlice";
import useOnboarding from "../lib/hooks/useOnboarding";
import DummyObligationBox from "../components/landingPage/dummyObligationBox";
import { FaArrowRightLong } from "react-icons/fa6";
import Walkthrough from "../components/landingPage/walkthrough";
import AvailableOn from "../components/landingPage/availableOn";
import ShowContentContainer from "../components/landingPage/showContentContainer";
import { cn } from "../lib/utils";

const MissionUpperText = () => (
  <>
    <p>Loneliness and burnout are an integral part of being a solopreneur.</p>
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
  </>
);

const MissionFull = ({ onBack }: { onBack: () => void }) => (
  <motion.div
    // Slide in from the right
    // Slide out to the right
    id="mission-full"
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    transition={{ duration: 0.35, type: "spring" }}
    className="w-screen h-screen absolute inset-0 bg-red-400 z-50"
  >
    <div
      className="p-2 flex flex-row gap-1 justify-center items-center rounded-full md:hover:bg-slate-400/40 absolute top-1 left-1"
      onClick={onBack}
    >
      {/* reversed arrow */}
      <FaArrowRightLong className="transform rotate-180 text-xl" />
      Back
    </div>
  </motion.div>
);

const Mission = ({ onExpand }: { onExpand: () => void }) => {
  const [expandMission, setExpandMission] = React.useState(false);

  return (
    <motion.div
      animate={{
        height: expandMission ? "100vh" : "11.5rem",
      }}
      transition={{
        duration: 0.3,
      }}
      className="max-w-xl min-h-[15rem] md:min-h-[11.5rem] max-h-[25.5rem] md:max-h-[19.5rem] flex flex-col justify-start items-start bg-card p-4 rounded-xl text-base font-light overflow-hidden"
    >
      <motion.span
        // whileHover={{ translateX: 5 }}
        animate={{ translateX: expandMission ? 5 : 0 }}
        transition={{
          duration: 0.6,
          bounce: 0.5,
          type: "spring",
        }}
        className={cn(
          "text-xl font-bold flex flex-row justify-start items-center mb-2 text-foreground md:hover:cursor-pointer md:hover:underline transition-color",
          {
            "text-primary": expandMission,
          },
        )}
        onClick={() => {
          setExpandMission(!expandMission);
          onExpand();
        }}
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
          <FaArrowRightLong
            className={cn("text-foreground transition-color", {
              "text-primary": expandMission,
            })}
          />
        </motion.div>
      </motion.span>
      <MissionUpperText />
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
  <header className="w-fit h-20 flex flex-row justify-center items-center p-2 md:p-6 rounded-full bg-card z-50 mt-4">
    <div className="w-full px-2 md:px-0 flex flex-row gap-4 md:gap-28 items-center justify-center">
      <div className="text-xl md:text-4xl font-medium text-foreground">
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
          <Link href="/login" className="hidden md:flex text-base md:text-lg ">
            Login
          </Link>
        </Button>
        <Button
          asChild
          variant="magic"
          className="bg-card"
          onClick={onGetStarted}
        >
          <Link href={getStartedUrl} className="text-base md:text-xl">
            Get Started
          </Link>
        </Button>
      </div>
    </div>
  </header>
);

const HeroSection = ({ onExpandMission }: { onExpandMission: () => void }) => {
  return (
    <div className="h-fit w-full md:w-fit flex justify-center items-center">
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
        className="w-full h-fit flex flex-col justify-center items-start gap-8 md:h-fit text-5xl md:text-4xl lg:text-5xl font-medium text-start leading-relaxed md:leading-snug"
      >
        <div className="w-full flex flex-col justify-center items-center md:justify-start md:items-start gap-1 tracking-tighter">
          <div className="text-[44px] leading-none md:text-6xl font-extrabold tracking-tight text-foreground/90">
            Build habits
          </div>
          <div className="text-[44px] leading-none md:text-6xl font-extrabold tracking-tight text-primary">
            with a partner
          </div>
        </div>
        <div className="w-full md:w-fit text-center md:text-start text-lg opacity-90 font-light md:items-start">
          Stop fighting procrastination alone. <br />
          Start building habits together.
        </div>
        <div className="w-full md:w-fit flex flex-col justify-center items-center md:items-start text-foreground/80 text-lg text-center">
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
        <Mission onExpand={onExpandMission} />
      </motion.div>
    </div>
  );
};

export default function Home() {
  const [expandMission, setExpandMission] = React.useState(false);
  const { clearOnboardingViewed } = useOnboarding();
  const dispatch = useAppDispatch();
  return (
    <div className="h-full w-full flex flex-col">
      <AnimatePresence>
        <ShowContentContainer className="h-full w-full flex flex-col justify-center items-center gap-14 relative pb-10 overflow-y-auto overflow-x-clip px-2 md:px-4">
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
            getStartedUrl={"/home"}
          />
          <div className="h-fit w-full flex flex-col md:justify-between max-w-6xl mx-auto px-2 md:px-4 gap-20 md:gap-32">
            <div className="h-fit w-full flex flex-col md:flex-row md:justify-between gap-8 pb-12">
              <HeroSection
                onExpandMission={() => setExpandMission(!expandMission)}
              />
              <div className="h-fit w-full flex md:w-fit justify-center items-center">
                <DummyObligationBox />
              </div>
            </div>
            <Walkthrough />
            <Button
              asChild
              className="w-fit text-lg py-6 px-12 text-white self-center"
              onClick={() => {
                clearOnboardingViewed();
              }}
            >
              <Link href="/home" className="relative">
                Give the demo a try.
                <div className="w-fit h-fit shimmer-animation rounded-lg"></div>
              </Link>
            </Button>
            <AvailableOn />
          </div>
        </ShowContentContainer>
      </AnimatePresence>
    </div>
  );
}
