import React from "react";
import { Label } from "./label";
import { cn } from "../../lib/utils";

export const SectionContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "w-full flex flex-col items-start gap-3 h-fit rounded-lg",
      className,
    )}
  >
    {children}
  </div>
);

export const SectionTitleContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn("flex flex-col gap-0 items-start justify-start", className)}
  >
    {children}
  </div>
);

export const SectionTitle = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => (
  <Label
    className={cn(
      "text-right text-lg md:text-xl font-normal md:font-semibold tracking-wide",
      className,
    )}
  >
    {text}
  </Label>
);

export const SectionTitleSecondary = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => (
  <Label
    className={cn(
      "text-right text-base md:text-lg font-light md:font-normal tracking-wide",
      className,
    )}
  >
    {text}
  </Label>
);

export const SectionTitleExplanation = ({ text }: { text: string }) => (
  <div className="text-xs md:text-sm font-thin">{text}</div>
);
