"use client";

import React from "react";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { useAppDispatch } from "../lib/hooks/redux";
import { setUser } from "../lib/features/auth/authSlice";
import useOnboarding from "../lib/hooks/useOnboarding";
import DummyObligationBoxMobile from "../components/landingPage/dummyObligationBoxMobile";
import Walkthrough from "../components/landingPage/walkthrough";
import AvailableOn from "../components/landingPage/availableOn";
import ShowContentContainer from "../components/landingPage/showContentContainer";
import { cn } from "../lib/utils";
import DummyObligationBox from "../components/landingPage/dummyObligationBox";
import { isMobilePhone } from "../lib/utils/notificationUtils";
import Hero from "../components/landingPage/hero";
import StepFlow from "../components/landingPage/stepFlow";

const Header = ({
  onGetStarted,
  getStartedUrl,
}: {
  onGetStarted: () => void;
  getStartedUrl: string;
}) => (
  <header className="w-full h-20 flex flex-row justify-center items-center p-2 md:p-6 bg-card z-50">
    <div className="w-full md:px-0 flex flex-row gap-4 md:gap-28 items-center justify-between">
      <div className="text-xl md:text-4xl font-medium text-foreground">
        <span className="">P</span>
        <span>inky</span>
        <span className="">P</span>
        <span>artner</span>
      </div>
      <div className="flex flex-row gap-2">
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

const NotificationExplanation = () => (
  <ShowContentContainer
    className="flex flex-col gap-1.5 justify-center items-center font-semibold text-3xl md:text-4xl tracking-tight mb-4 md:mb-6 text-center"
    variant="main"
  >
    <div className="">
      <span className="">Most</span> New Year&apos;s Resolutions{" "}
      <span className="">Fail in 2 Weeks</span>
    </div>
    <div className="text-2xl text-muted-foreground">
      With a partner and notifications, your{" "}
      <span className="text-primary underline underline-offset-4">
        <Link
          href={
            "https://www.afcpe.org/news-and-publications/the-standard/2018-3/the-power-of-accountability/"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          chances to succeed are 95%
        </Link>
      </span>
    </div>
  </ShowContentContainer>
);

export default function Home() {
  const { clearOnboardingViewed, isOnboardingCompleted } = useOnboarding();
  const dispatch = useAppDispatch();

  return (
    <ShowContentContainer
      className="h-full w-full flex flex-col justify-center items-center gap-14 relative pb-10 overflow-y-auto overflow-x-clip"
      variant="main"
    >
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
      <div className="h-fit w-full flex flex-col md:items-center md:justify-between max-w-6xl mx-auto px-2 md:px-4 gap-20 md:gap-20 bg-red-500/0">
        <div className="h-fit w-full flex flex-col md:flex-row md:justify-center gap-8">
          <Hero />
        </div>
        <ShowContentContainer
          className="flex flex-col justify-center items-center gap-2"
          variant="secondary"
          animate={isMobilePhone()}
        >
          <NotificationExplanation />
          <DummyObligationBoxMobile />
          <DummyObligationBox />
        </ShowContentContainer>
        <Walkthrough />
        <ShowContentContainer
          className="self-center flex justify-center items-center"
          variant="main"
        >
          <Button
            asChild
            className="w-fit text-lg py-6 px-12 text-white"
            onClick={() => {
              clearOnboardingViewed();
            }}
          >
            <Link href="/home" className="relative">
              Give the demo a try
              <div className="w-fit h-fit shimmer-animation rounded-lg"></div>
            </Link>
          </Button>
        </ShowContentContainer>
        <AvailableOn />
      </div>
    </ShowContentContainer>
  );
}
