"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "./redux";
import {
  Stage,
  stages,
  shouldFetchElement,
  hasMobileVersion,
  timeDelays,
} from "../consts/onboarding";

export default function useOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingElement = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { contracts } = useAppSelector(state => state.contracts);
  const [currentStage, setCurrentStage] = useState<Stage>(stages[0]);
  const [elementPosition, setElementPosition] = useState<
    | {
        top: number;
        bottom: number;
        left: number;
        right: number;
      }
    | undefined
  >();

  const [elementSize, setElementSize] = useState<
    | {
        height: number;
        width: number;
      }
    | undefined
  >();

  useEffect(() => {
    const lastStage = getLastStage();
    if (lastStage) {
      setCurrentStage(lastStage);
    }
  }, []);

  const handleNextStage = (stage: Stage) => {
    localStorage.setItem("lastOnboardingStage", stage);
    setCurrentStage(stage);
  };

  const elementsActions: Record<Stage, (() => void) | null> = {
    welcome: () => {
      handleNextStage("navigation-bar-item-Contracts");
    },
    "navigation-bar-item-Contracts": () => {
      router.push("/contracts");
      handleNextStage("contracts-plus-button");
    },
    "contracts-plus-button": () => {
      router.push("/contracts/new");
      handleNextStage("search-partner");
    },
    "search-partner": () => {
      handleNextStage("no-partner");
    },
    "no-partner": () => {
      handleNextStage("fill-contract");
    },
    "fill-contract": null,
    "invite-partner-button": () => {
      router.push("/home");
      handleNextStage("home-start-doing");
    },
    "wait-for-partner": () => {
      router.push("/home");
      handleNextStage("home-start-doing");
    },
    "home-start-doing": () => {
      handleNextStage("done");
      setOnboardingViewed();
    },
    done: null,
  };

  //   useEffect(() => {
  //     if (isOnboardingViewed()) {
  //       return;
  //     }
  //     const lastStage = getLastStage();
  //     if (lastStage) {
  //       if (lastStage !== currentStage) {
  //         setCurrentStage(lastStage);
  //         switch (lastStage) {
  //           case "welcome":
  //             if (window.location.pathname === "/home") {
  //               router.push("/home");
  //             }
  //           case "home-start-doing":
  //             if (window.location.pathname === "/home") {
  //               router.push("/home");
  //             }
  //           case "navigation-bar-item-Contracts":
  //             if (window.location.pathname === "/home") {
  //               router.push("/home");
  //             }
  //           case "contracts-plus-button":
  //             if (window.location.pathname === "/contracts") {
  //               router.push("/contracts");
  //             }
  //           case "search-partner":
  //             if (window.location.pathname === "/contracts/new") {
  //               router.push("/contracts/new");
  //             }
  //           case "no-partner":
  //             if (window.location.pathname === "/contracts/new") {
  //               router.push("/contracts/new");
  //             }
  //           case "fill-contract":
  //             if (window.location.pathname === "/contracts/new") {
  //               router.push("/contracts/new");
  //             }
  //           case "invite-partner-button":
  //             if (window.location.pathname === "/contracts") {
  //               router.push("/contracts");
  //             }
  //           case "wait-for-partner":
  //             if (window.location.pathname === "/contracts") {
  //               router.push("/contracts");
  //             }
  //           case "done":
  //             if (window.location.pathname === "/home") {
  //               router.push("/home");
  //             }
  //         }
  //       }
  //     }
  //   }, []);

  useEffect(() => {
    if (getLastStage() === "done") {
      setCurrentStage("done");
      return;
    }
    updateLastStage();
  }, [currentStage]);

  useEffect(() => {
    // set is mobile if under min-width: 768px
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
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
    setCurrentStage("done");
    localStorage.setItem("onboardingViewed", "true");
  };

  const setElement = () => {
    setTimeout(() => {
      if (!shouldFetchElement[currentStage]) {
        return;
      }
      // It's possible that the user has invited a partner. Therefore, we'll check it first.
      // If they did, we'll skip the invite-partner-button stage.
      if (currentStage === "invite-partner-button") {
        if (contracts.length > 0) {
          if (contracts[0].contractees.length > 1) {
            setCurrentStage("wait-for-partner");
            return;
          }
        }
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

      el.className += " !cursor-pointer";
      let clone = el.cloneNode(true);
      // clear all onClicks
      clone.removeEventListener("click", null);

      // Avoid z
      if (clone.nodeName.toLowerCase() === "a") {
        const div = document.createElement("div");
        const a = clone as HTMLAnchorElement;
        div.innerHTML = a.innerHTML;
        div.className = a.className;
        div.className += " !cursor-pointer";
        clone = div.cloneNode(true);
      }
      // add cursor-pointer to className of the element

      if (elementsActions[currentStage]) {
        clone.addEventListener("click", () => {
          while (onboardingElement.current?.firstChild) {
            onboardingElement.current?.removeChild(
              onboardingElement.current.firstChild,
            );
          }
          setElementPosition(undefined);
          setElementSize(undefined);
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
      setElementSize({
        height,
        width,
      });
    }, timeDelays[currentStage]);
  };

  const updateLastStage = () => {
    localStorage.setItem("lastOnboardingStage", currentStage);
  };

  const getLastStage = () => {
    return localStorage.getItem("lastOnboardingStage") as Stage;
  };

  const isOnboardingViewed = () => {
    return (
      localStorage.getItem("onboardingViewed") === "true" ||
      getLastStage() === "done"
    );
  };

  const nextStage = (specificStage?: Stage) => {
    if (specificStage) {
      setCurrentStage(specificStage);
      return;
    }
    const index = stages.indexOf(currentStage);
    if (index === stages.length - 1) {
      return;
    }
    setCurrentStage(stages[index + 1]);
  };

  return {
    isMobile,
    nextStage,
    setElement,
    elementSize,
    currentStage,
    elementsActions,
    elementPosition,
    onboardingElement,
    isOnboardingViewed,
    setOnboardingViewed,
  };
}
