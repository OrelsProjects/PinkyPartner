"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "../../lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";

type Stage =
  | "navigation-bar-item-Contracts"
  | "search-partner"
  | "no-partner"
  | "fill-contract"
  | "invite-partner-button"
  | "home-start-doing"
  | "done";

const timeDelays: Record<Stage, number> = {
  "navigation-bar-item-Contracts": 1000,
  "search-partner": 500,
  "no-partner": 0,
  "fill-contract": 200,
  "invite-partner-button": 500,
  "home-start-doing": 500,
  done: 0,
};

const shouldFetchElement: Record<Stage, boolean> = {
  "navigation-bar-item-Contracts": true,
  "search-partner": true,
  "no-partner": true,
  "fill-contract": false,
  "invite-partner-button": true,
  "home-start-doing": true,
  done: false,
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

const leftMultipliers: Record<Stage, number> = {
  "navigation-bar-item-Contracts": 2,
  "search-partner": 7,
  "no-partner": 2,
  "fill-contract": 2,
  "invite-partner-button": 2,
  "home-start-doing": 10,
  done: 2,
};

const hasMobileVersion: Record<Stage, boolean> = {
  "navigation-bar-item-Contracts": true,
  "search-partner": false,
  "no-partner": false,
  "fill-contract": false,
  "invite-partner-button": false,
  "home-start-doing": false,
  done: false,
};

export default function OnboardingProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingElement = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage>(
    "navigation-bar-item-Contracts",
  );
  const [elementPosition, setElementPosition] = useState<
    | {
        top: number;
        bottom: number;
        left: number;
        right: number;
      }
    | undefined
  >();

  const [elementSize, setElementSize] = useState<number[]>([]);

  const elementsActions: Record<Stage, (() => void) | null> = {
    "navigation-bar-item-Contracts": () => {
      router.push("/contracts/new");
      setCurrentStage("search-partner");
    },
    "search-partner": () => {
      setCurrentStage("no-partner");
    },
    "no-partner": () => {
      setCurrentStage("fill-contract");
    },
    "fill-contract": null,
    "invite-partner-button": () => {
      router.push("/home");
      setCurrentStage("home-start-doing");
    },
    "home-start-doing": () => {
      setCurrentStage("done");
    },
    done: null,
  };

  useEffect(() => {
    // set is mobile if under min-width: 768px
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const setOnboardingViewed = async () => {
    // localStorage.setItem("onboardingViewed", "true");
  };

  const setElement = () => {
    setTimeout(() => {
      if (!shouldFetchElement[currentStage]) {
        return;
      }
      // GET Element by data-onboarding-id
      const id = `[data-onboarding-id=${currentStage}${
        isMobile && hasMobileVersion[currentStage] ? "-mobile" : ""
      }]`;
      let el = document.querySelector(id);
      if (!el) {
        setElement();
        return;
      }

      const clone = el.cloneNode(true);
      if (elementsActions[currentStage]) {
        clone.addEventListener("click", () => {
          while (onboardingElement.current?.firstChild) {
            onboardingElement.current?.removeChild(
              onboardingElement.current.firstChild,
            );
          }
          setElementPosition(undefined);
          setElementSize([0, 0]);
          elementsActions[currentStage]?.();
        });
      }
      while (onboardingElement.current?.firstChild) {
        onboardingElement.current?.removeChild(
          onboardingElement.current.firstChild,
        );
      }
      // append to onboarding element
      onboardingElement.current?.appendChild(clone);
      const positionTop = el.getBoundingClientRect().top;
      const positionBottom = el.getBoundingClientRect().bottom;
      const positionLeft = el.getBoundingClientRect().left;
      const positionRight = el.getBoundingClientRect().right;
      setElementPosition({
        top: positionTop,
        bottom: positionBottom,
        left: positionLeft,
        right: positionRight,
      });

      const height = el.getBoundingClientRect().height;
      const width = el.getBoundingClientRect().width;
      setElementSize([height, width]);
    }, timeDelays[currentStage]);
  };

  const isOnboardingViewed = () => {
    return localStorage.getItem("onboardingViewed") === "true";
  };

  useEffect(() => {
    localStorage.removeItem("onboardingViewed");
    if (isOnboardingViewed()) {
      return;
    }
    if (currentStage === "done") {
      setOnboardingViewed();
      return;
    }
    setElement();
  }, [currentStage, isMobile]);

  useEffect(() => {
    if (isOnboardingViewed()) {
      return;
    }
    switch (pathname) {
      case "/contracts":
        if (currentStage === "fill-contract") {
          setCurrentStage("invite-partner-button");
          break;
        }
      case "/home":
        if (currentStage === "invite-partner-button") {
          setCurrentStage("home-start-doing");
        }
        break;
    }
  }, [pathname, isMobile]);

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
