"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type Stage =
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

export const hasMobileVersion: Record<Stage, boolean> = {
  "navigation-bar-item-Contracts": true,
  "search-partner": false,
  "no-partner": false,
  "fill-contract": false,
  "invite-partner-button": false,
  "home-start-doing": false,
  done: false,
};

export default function useOnboarding() {
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

  return {
    isMobile,
    setElement,
    elementSize,
    currentStage,
    elementPosition,
    onboardingElement,
    isOnboardingViewed,
    setOnboardingViewed,
  };
}
