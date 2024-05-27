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
  console.log(photoURL);

  const userInitials = React.useMemo(() => {
    const firstLetter = displayName?.[0];
    const secondLetter =
      displayName?.split(" ")[1]?.[0] || displayName?.[1] || "";
    return `${firstLetter}${secondLetter}`;
  }, [displayName]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Avatar
            className={cn("relative rounded-none cursor-default", className)}
          >
            {photoURL ? (
              <Image
                id={`avatar-${displayName}`}
                src={photoURL}
                alt={displayName ?? "User photo"}
                fill
                className={cn("relative h-9 w-9 rounded-full", imageClassName)}
              />
            ) : (
              <AvatarFallback
                className="bg-card"
                id={`avatar-fallback-${displayName}`}
              >
                {userInitials || "AN"}
              </AvatarFallback>
            )}
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
          <TooltipContent className="bg-background">
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
