"use client";

import { cn } from "../../lib/utils";
import { FaArrowDownLong } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import {
  hasMobileVersion,
  shouldFetchElement,
  specialSigns,
  stageText,
  showBackground,
  backgroundForNextStage,
} from "../../lib/consts/onboarding";
import useOnboarding from "../../lib/hooks/useOnboarding";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "../../components/ui/dialog";
import { EventTracker } from "../../eventTracker";
import { useAppSelector } from "../../lib/hooks/redux";
import Link from "next/link";

export default function OnboardingProvider() {
  const { user, state } = useAppSelector(state => state.auth);

  const {
    isMobile,
    nextStage,
    elementSize,
    currentStage,
    elementsActions,
    elementPosition,
    onboardingElement,
    onboardingState,
    isOnboardingCompleted,
    setOnboardingViewed,
  } = useOnboarding();

  const router = useRouter();

  const mobile = useMemo(() => {
    const mobile = isMobile && hasMobileVersion[currentStage];
    return mobile;
  }, [isMobile, currentStage]);

  const Arrow = () => {
    const showArrow = shouldFetchElement[currentStage];

    const elementTop = elementPosition?.top || 0;
    const elementLeft = elementPosition?.left || 0;

    let top = `${
      mobile
        ? elementTop - (elementSize?.height || 0)
        : elementTop + (elementSize?.height || 0)
    }px`;

    let left = `${elementLeft + (elementSize?.width || 0) / 2 - 20}px`;

    top = showArrow ? top : "10%";
    left = showArrow ? left : "40%";

    const className = showArrow
      ? ""
      : isMobile
        ? "!top-32 !left-[20%]"
        : "!top-10 !left-[40%]";

    return (
      (elementPosition || !showArrow) && (
        <div
          className={cn(
            "w-fit h-fit rounded-full absolute",
            {
              "rotate-180": !mobile,
            },
            className,
          )}
          style={{
            top,
            left,
          }}
        >
          {showArrow && (
            <FaArrowDownLong
              className={cn("text-slate-200/90 w-10 h-10 animate-bounce")}
            />
          )}
        </div>
      )
    );
  };

  const cleanText = (text: string) => {
    let newText = text;
    specialSigns.forEach(sign => {
      newText = newText.replaceAll(sign, "");
    });
    return newText;
  };

  const Text = () => {
    let textLines = stageText[currentStage].description.split("\n");
    // All lines that start with ~ and end with ~ will be italic
    const italicText = textLines
      .filter(line => line.startsWith("~") && line.endsWith("~"))
      .map(line => line.slice(1, -1))
      .map(cleanText);

    const textLinesNoItalic = textLines.map(line => {
      if (line.startsWith("~") && line.endsWith("~")) {
        return line.slice(1, -1);
      }
      return line;
    });
    // All lines that start with - and end with - will be slimText
    const slimText = textLinesNoItalic
      .filter(line => line.startsWith("-") && line.endsWith("-"))
      .map(line => line.slice(1, -1))
      .map(cleanText);

    const cleanTextLines = textLines.map(cleanText);

    return (
      <div className="flex flex-col gap-2 text-white text-center p-2 md:p-0">
        <h1 className="text-2xl md:text-3xl font-medium md:font-semibold">
          {stageText[currentStage].title}
        </h1>
        {cleanTextLines.map((line, index) => (
          <p
            key={`onboarding-description-${index}`}
            className={cn("text-lg font-normal tracking-wide", {
              "font-thin": slimText.includes(line),
              italic: italicText.includes(line),
            })}
          >
            {line}
          </p>
        ))}
      </div>
    );
  };

  const shouldSignUp = useMemo(() => {
    return (
      (state === "anonymous" || state === "unauthenticated") &&
      isOnboardingCompleted()
    );
  }, [user, state]);

  return !isOnboardingCompleted() && showBackground[currentStage] ? (
    <div
      className={cn(
        "h-[100svh] w-[100vw] absolute inset-0 bg-black/80 z-50 flex justify-center items-center",
        {
          "hover:cursor-pointer": backgroundForNextStage[currentStage],
        },
        {
          "items-end pb-20 md:items-center md:pb-0":
            currentStage === "no-partner",
        },
      )}
      onClick={() => {
        if (currentStage === "welcome") {
          if (window.location.pathname !== "/home") {
            router.push("/home");
          }
        }
        if (backgroundForNextStage[currentStage]) {
          elementsActions[currentStage]?.();
        }
      }}
    >
      <div
        id="_PRIVATE_ONBOARDING_ELEMENT"
        ref={onboardingElement}
        className={cn(
          "absolute bg-background h-fit w-fit flex justify-center items-center md:hover:cursor-pointer",
        )}
        style={{
          top: elementPosition?.top,
          bottom: elementPosition?.bottom,
          left: elementPosition?.left,
          right: elementPosition?.right,
          height: elementSize?.height,
          width: elementSize?.width,
        }}
      />
      <Button
        className="absolute top-3 right-3 md:bottom-10 md:top-auto"
        onClick={() => {
          setOnboardingViewed().finally(() => {
            // router.refresh();
          });
        }}
        variant={"link"}
      >
        Skip
      </Button>

      <Arrow />
      <div
        className={cn(
          "w-full md:w-full h-fit flex justify-center items-center px-2",
        )}
      >
        <Text />
      </div>
    </div>
  ) : (
    <Dialog
      open={shouldSignUp}
      onOpenChange={open => {
        if (!open) {
          router.push("/");
        }
      }}
    >
      <DialogContent closeOnOutsideClick={false}>
        <DialogTitle>Great job!</DialogTitle>
        <DialogDescription>
          Now, in order to start building habits, you&apos;ll need to sign up :)
        </DialogDescription>
        <DialogFooter>
          <div className="w-full flex flex-col gap-0 justify-center items-center">
            <Button asChild>
              <Link href="/register">Let&apos;s go!</Link>
            </Button>
            <Button
              variant="link"
              onClick={() => {
                EventTracker.track("Cancelled sign up");
              }}
              asChild
            >
              <Link href="/">Maybe next time</Link>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
