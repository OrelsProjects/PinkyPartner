"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export const UserAvatar = ({
  badge,
  photoURL,
  className,
  displayName,
  hideTooltip,
  imageClassName,
  badgeClassName,
  tooltipContent,
}: {
  className?: string;
  hideTooltip?: boolean;
  imageClassName?: string;
  badgeClassName?: string;
  badge?: React.ReactNode;
  photoURL?: string | null;
  displayName?: string | null;
  tooltipContent?: React.ReactNode;
}) => {
  const [error, setError] = React.useState(false);

  const userInitials = React.useMemo(() => {
    const firstWord = displayName?.split(" ")?.[0];
    const secondWord = displayName?.split(" ")?.[1];

    if (!firstWord) return null;

    const firstLetter = firstWord[0];
    const secondLetter = secondWord?.[0] || firstWord[1] || "";

    if (!firstLetter && !secondLetter) return null;

    return `${firstLetter}${secondLetter || ""}`;
  }, [displayName]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Avatar
            className={cn(
              "relative rounded-none cursor-default h-11 w-11",
              className,
            )}
          >
            <Image
              id={`avatar-${displayName}`}
              src={photoURL || "/PP-round.png"}
              alt={displayName ?? "User photo"}
              onError={() => setError(true)}
              fill
              className={cn(
                "relative h-full w-full rounded-full brightness-90",
                imageClassName,
              )}
            />

            {badge && (
              <div
                className={cn(
                  "w-fit h-fit absolute top-0 right-0 flex",
                  badgeClassName,
                )}
              >
                {badge}
              </div>
            )}
          </Avatar>
          <TooltipContent className={"bg-background"}>
            {tooltipContent || hideTooltip ? "" : displayName}
          </TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
