"use client";

import Image from "next/image";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import useOnboarding, {
  Stage,
  hasMobileVersion,
} from "../../lib/hooks/useOnboarding";

const leftMultipliers: Record<Stage, number> = {
  "navigation-bar-item-Contracts": 2,
  "search-partner": 7,
  "no-partner": 2,
  "fill-contract": 2,
  "invite-partner-button": 2,
  "home-start-doing": 10,
  done: 2,
};

const stageText: Record<
  Stage,
  {
    title: string;
    description: string;
  }
> = {
  "navigation-bar-item-Contracts": {
    title: "Create a contract",
    description: "Start by creating a contract with your partner",
  },
  "search-partner": {
    title: "Search for your partner",
    description: "Search for your partner to create a contract",
  },
  "no-partner": {
    title: "No partner found",
    description: "No partner found, create a contract with a new partner",
  },
  "fill-contract": {
    title: "Fill the contract",
    description: "Fill the contract with the details",
  },
  "invite-partner-button": {
    title: "Invite your partner",
    description: "Invite your partner to sign the contract",
  },
  "home-start-doing": {
    title: "Start doing",
    description: "Start doing the contract",
  },
  done: {
    title: "Done",
    description: "You have completed the onboarding",
  },
};

const topMultipliers: Record<Stage, number> = {
  "navigation-bar-item-Contracts": 1.7,
  "search-partner": 2,
  "no-partner": 2,
  "fill-contract": 2,
  "invite-partner-button": 2,
  "home-start-doing": 1,
  done: 2,
};

const showBackground: Record<Stage, boolean> = {
  "navigation-bar-item-Contracts": true,
  "search-partner": true,
  "no-partner": true,
  "fill-contract": false,
  "invite-partner-button": true,
  "home-start-doing": true,
  done: false,
};

export default function OnboardingProvider() {
  const {
    isMobile,
    setElement,
    elementSize,
    currentStage,
    elementPosition,
    onboardingElement,
    isOnboardingViewed,
    setOnboardingViewed,
  } = useOnboarding();

  const Arrow = () => {
    const mobile = isMobile && hasMobileVersion[currentStage];
    const leftMultiplier = leftMultipliers[currentStage];
    const topMultiplier = topMultipliers[currentStage];
    const elementTop = elementPosition?.top || 0;
    const elementLeft = elementPosition?.left || 0;
    const top = mobile
      ? elementTop - elementSize[0] * topMultiplier - 50
      : elementTop + elementSize[0] * topMultiplier - 50;
    const left = mobile
      ? elementLeft - 50
      : elementLeft - elementSize[1] / (1 / leftMultiplier) - 50;

    return (
      elementPosition && (
        <Image
          src="/arrow.png"
          alt="Arrow"
          height={150}
          width={150}
          className="absolute "
          style={{
            // if isMobile && hasMobileVersion[currentStage] flip 180deg
            transform: `${mobile ? "scale(1,-1)" : ""}`,
            top: mobile
              ? elementTop - elementSize[0]
              : elementTop + elementSize[0],
            left: elementLeft - elementSize[1] / leftMultipliers[currentStage],
          }}
        />
      )
    );
  };

  return (
    !isOnboardingViewed() &&
    showBackground[currentStage] && (
      <div className="h-[100svh] w-[100vw] absolute inset-0 bg-black/70 z-50">
        <div
          id="_PRIVATE_ONBOARDING_ELEMENT"
          ref={onboardingElement}
          className={cn(
            "absolute bg-background h-fit w-fit flex justify-center items-center",
          )}
          style={{
            top: elementPosition?.top,
            bottom: elementPosition?.bottom,
            left: elementPosition?.left,
            right: elementPosition?.right,
            height: elementSize[0],
            width: elementSize[1],
          }}
        />
        <Button
          className="absolute top-10 right-10 md:bottom-10"
          onClick={() => {
            setOnboardingViewed();
          }}
        >
          Skip
        </Button>
        <Arrow />
      </div>
    )
  );
}
