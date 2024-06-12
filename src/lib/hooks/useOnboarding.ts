"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  Stage,
  stages,
  shouldFetchElement,
  hasMobileVersion,
  timeDelays,
} from "../consts/onboarding";
import axios from "axios";
import { Logger } from "../../logger";
import { setUser, updateOnboardingCompleted } from "../features/auth/authSlice";
import { ANONYMOUS_USER_ID } from "../utils/consts";

export default function useOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const onboardingElement = useRef<HTMLDivElement>(null);
  const { user, state } = useAppSelector(state => state.auth);
  const { contracts } = useAppSelector(state => state.contracts);
  const [onboardingState, setOnboardingState] = useState<
    "ongoing" | "completed"
  >("ongoing");
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

  // Set anonymous user
  useEffect(() => {
    if (isOnboardingCompleted()) {
      return;
    }
    if (!user && state !== "authenticated") {
      dispatch(
        setUser({
          state: "anonymous",
          userId: ANONYMOUS_USER_ID,
          displayName: "Random Pinky",
          email: "",
          photoURL: "",
          meta: {
            referralCode: "",
            onboardingCompleted: false,
          },
          settings: {
            showNotifications: false,
            soundEffects: true,
          },
        }),
      );
    }
  }, [user, state]);

  useEffect(() => {
    if (user?.meta?.onboardingCompleted) {
      setOnboardingViewed(false);
    }
  }, [user]);

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
    "fill-contract": () => {
      router.push("/contracts/new/no-partner");
      handleNextStage("wait-fill-contract");
    },
    "wait-fill-contract": null,
    "invite-partner-button": () => {
      router.push("/home");
      handleNextStage("complete-promise-checkbox");
    },
    "wait-for-partner": () => {
      router.push("/home");
      handleNextStage("complete-promise-checkbox");
    },
    "complete-promise-checkbox": () => {
      handleNextStage("promise-completed");
    },
    "promise-completed": () => {
      handleNextStage("done");
      setOnboardingViewed();
    },
    done: null,
  };

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
    if (isOnboardingCompleted()) {
      return;
    }
    if (currentStage === "done") {
      setOnboardingViewed();
      return;
    }
    setElement();
  }, [currentStage, isMobile]);

  useEffect(() => {
    if (isOnboardingCompleted()) {
      return;
    }
    switch (pathname) {
      case "/contracts":
        if (currentStage === "wait-fill-contract") {
          if (contracts.length > 0) {
            setCurrentStage("invite-partner-button");
          }
          break;
        }
      case "/home":
        if (currentStage === "invite-partner-button") {
          setCurrentStage("complete-promise-checkbox");
        }
        break;
    }
  }, [pathname, isMobile]);

  const setOnboardingViewed = async (updateUser = true) => {
    localStorage.setItem("onboardingViewed", "true");
    localStorage.setItem("lastOnboardingStage", "done");
    setCurrentStage("done");
    setOnboardingState("completed");
    dispatch(updateOnboardingCompleted(true));
    try {
      if (updateUser && state === "authenticated") {
        await axios.post("/api/user/finish-onboarding");
      }
    } catch (e: any) {
      Logger.error(e);
    }
  };

  const clearOnboardingViewed = () => {
    localStorage.removeItem("onboardingViewed");
    localStorage.removeItem("lastOnboardingStage");
    dispatch(updateOnboardingCompleted(false));
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
      // @ts-ignore
      if (clone.disabled) {
        // @ts-ignore
        clone.disabled = false;
      }
      // clear all onClicks
      clone.removeEventListener("click", null);

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
            // if first child has data-onboarding-dont-delete, don't remove it
            if (
              (onboardingElement.current.firstChild as HTMLElement).dataset
                .onboardingDontDelete
            ) {
              continue;
            }
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

  const isOnboardingCompleted = () => {
    return (
      user?.meta?.onboardingCompleted ||
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
    onboardingState,
    elementPosition,
    onboardingElement,
    setOnboardingViewed,
    isOnboardingCompleted,
    clearOnboardingViewed,
  };
}
