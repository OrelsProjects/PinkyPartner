import React from "react";
import { cn } from "../../lib/utils";
import ShowContentContainer from "./showContentContainer";
import { Button } from "../ui/button";
import Link from "next/link";
import { EventTracker } from "../../eventTracker";
import CustomLink from "../ui/customLink";

interface HeroProps {}

const Mission = ({ className }: { className?: string }) => {
  return (
    <ShowContentContainer variant="secondary">
      <div
        className={cn(
          "max-w-full h-fit flex flex-col justify-start items-start bg-card p-4 rounded-xl text-base font-light overflow-hidden",
          className,
        )}
      >
        <span
          className={cn(
            "text-xl font-bold flex flex-row justify-start items-center mb-2 transition-color text-primary",
          )}
        >
          My mission
        </span>
        <p>
          Loneliness and burnout are an integral part of being a solopreneur.
        </p>
        <p>But they don&apos;t have to be.</p>
        <br />
        <p>By changing your habits and having someone to share it with,</p>
        <p>you can avoid both.</p>
        <br />
        <p>
          I have experienced the effect of having someone to build new habits
          with first hand. And it felt great.
        </p>
        <br />
        <p> Now, I want to help you experience the same.</p>
      </div>
    </ShowContentContainer>
  );
};

const Hero: React.FC<HeroProps> = () => {
  return (
    <div className="h-fit w-full flex justify-center items-center">
      <ShowContentContainer
        className="w-full h-fit flex flex-col justify-center items-center gap-8 md:gap-6 md:h-fit text-5xl md:text-3xl lg:text-5xl font-medium text-start leading-relaxed md:leading-snug"
        variant="main"
      >
        <div className="w-full flex flex-col md:flex-row md:gap-5 justify-center text-center items-center md:justify-center md:items-center gap-1 text-[44px] leading-none md:text-5xl lg:text-6xl font-extrabold tracking-tight">
          <div className="text-foreground/90">Build habits</div>
          <div className="text-primary">with a partner</div>
        </div>
        <div className="w-full md:w-fit text-center md:text-center text-lg md:text-xl opacity-90 font-light md:items-start">
          Stop fighting procrastination
          <span> alone.</span>
          <br />
          Start building habits together.
        </div>
        <div className="w-full md:w-fit flex flex-col justify-center items-center md:items-start text-foreground/80 text-lg text-center">
          <Button asChild className="text-lg py-6 px-12 text-white">
            <CustomLink
              href="/register"
              onClick={() => {
                EventTracker.track("take_my_pinky_clicked");
              }}
            >
              Take my pinky!
            </CustomLink>
          </Button>
          <Button
            variant="link"
            className="w-full underline decoration-muted-foreground/10"
            asChild
          >
            <CustomLink href="/login">
              <span className="w-full text-base text-center text-muted-foreground/70">
                I have an account
              </span>
            </CustomLink>
          </Button>
        </div>
        <Mission />
      </ShowContentContainer>
    </div>
  );
};

export default Hero;
