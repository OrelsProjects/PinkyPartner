"use client";

import { cn } from "../../lib/utils";
import { FaArrowDownLong } from "react-icons/fa6";
import useOnboarding, {
  Stage,
  hasMobileVersion,
  shouldFetchElement,
} from "../../lib/hooks/useOnboarding";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";

const specialSigns = ["~", "-"];

const stageText: Record<
  Stage,
  {
    title: string;
    description: string;
  }
> = {
  welcome: {
    title: "Welcome to Pinky Partner!",
    description: `With Pinky Partner you can easily build new habits with your partner.\n-(Click anywhere to continue.)-`,
  },
  "navigation-bar-item-Contracts": {
    title: "Let's begin!",
    description:
      "Go to your contracts section.\n-(Click on the highlighted section.)-",
  },
  "contracts-plus-button": {
    title: "",
    description: "Create your first contract by clicking the plus button.",
  },
  "search-partner": {
    title: "Find your Pinky Partner",
    description:
      "Here you can search for your partner.\n~-hint: if your partner is not in PinkyPartner, invite them from the settings menu-~",
  },
  "no-partner": {
    title: "Continue solo! For now...",
    description: "You can start solo and invite your partner later on.",
  },
  "fill-contract": {
    title: "",
    description: "",
  },
  "invite-partner-button": {
    title: "Invite your partner",
    description:
      "Here you can share a link via your selected platform.\n Send it to your future Pinky Partner ;)",
  },
  "wait-for-partner": {
    title: "Wait for your partner's pinky!",
    description:
      "Now your pinky partner got a notification to come sign the contract. Make sure to remind them ;)\n~-hint: You can start solo and your partner will join later.-~",
  },
  "home-start-doing": {
    title: "Get to work!",
    description:
      "Now start building your habits while your partner is on the way.",
  },
  done: {
    title: "Done",
    description: "You have completed the onboarding",
  },
};

const backgroundForNextStage: Record<Stage, boolean> = {
  welcome: true,
  "navigation-bar-item-Contracts": false,
  "contracts-plus-button": false,
  "search-partner": false,
  "no-partner": false,
  "fill-contract": false,
  "invite-partner-button": false,
  "wait-for-partner": true,
  "home-start-doing": false,
  done: false,
};

const showBackground: Record<Stage, boolean> = {
  welcome: true,
  "navigation-bar-item-Contracts": true,
  "contracts-plus-button": true,
  "search-partner": true,
  "no-partner": true,
  "fill-contract": false,
  "invite-partner-button": true,
  "wait-for-partner": true,
  "home-start-doing": true,
  done: false,
};

export default function OnboardingProvider() {
  const {
    isMobile,
    nextStage,
    elementSize,
    currentStage,
    elementsActions,
    elementPosition,
    onboardingElement,
    isOnboardingViewed,
    setOnboardingViewed,
  } = useOnboarding();

  const router = useRouter();

  const Arrow = () => {
    const mobile = isMobile && hasMobileVersion[currentStage];
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
            <FaArrowDownLong //TODO: Consider using an icon of an arrow instead of an image
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
      <div className="absolute flex flex-col gap-2 text-white text-center p-2 md:p-0">
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

  return (
    !isOnboardingViewed() &&
    showBackground[currentStage] && (
      <div
        className={cn(
          "h-[100svh] w-[100vw] absolute inset-0 bg-black/80 z-50 flex justify-center items-center",
          {
            "hover:cursor-pointer": backgroundForNextStage[currentStage],
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
            "absolute bg-background h-fit w-fit flex justify-center items-center",
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
          className="absolute top-10 right-10 md:bottom-10 md:top-auto"
          onClick={() => {
            setOnboardingViewed();
          }}
          variant={"link"}
        >
          Skip
        </Button>

        <Arrow />
        <div
          className={cn(
            "w-full md:w-full h-fit absolute flex justify-center items-center px-2",
          )}
        >
          <Text />
        </div>
      </div>
    )
  );
}
