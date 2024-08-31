import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../lib/hooks/redux";
import { cn } from "../../lib/utils";
import { UserAvatar } from "../ui/avatar";
import NotificationBadge from "../ui/notificationBadge";
import ObligationCheckbox from "./obligationCheckbox";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "../ui/dialog";
import { UsersIndicator } from "./usersIndicator";

export const ObligationBox = ({
  day,
  dummy,
  index,
  title,
  emoji,
  loading,
  disabled,
  className,
  forceSound,
  isCompleted,
  userPhotoUrl,
  partnersDetails,
  isNewObligation,
  handleCompleteObligation,
}: {
  day: string;
  index: number;
  title: string;
  emoji?: string;
  dummy?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  forceSound?: boolean;
  isCompleted: boolean;
  isNewObligation?: boolean;
  partnersDetails?: {
    isSigned?: boolean;
    photoURL?: string | null;
    displayName?: string | null;
    isObligationCompleted?: boolean;
  }[];
  userPhotoUrl?: string | null; // For landing page
  handleCompleteObligation: (day: string, completed: boolean) => void;
}) => {
  const { user } = useAppSelector(state => state.auth);

  return (
    <div
      className={cn(
        "rounded-lg h-16 w-full bg-card p-px duration-500 transition-all relative",
        {
          "bg-card/50": isCompleted,
        },
        { "pointer-events-none": disabled },
        className,
      )}
      key={`obligation-in-contract-${day}`}
    >
      <div
        className={cn(
          "w-full h-full flex flex-row justify-between items-start gap-3  bg-card rounded-lg p-2",
        )}
      >
        {isNewObligation && (
          <NotificationBadge
            className="h-2.5 w-2.5  absolute -top-1 left-0.5 bg-primary bg-red-500 text-xs font-semibold rounded-full"
            count={1}
          />
        )}
        <div className="self-center flex flex-row gap-2">
          <ObligationCheckbox
            day={day}
            index={index}
            disabled={disabled}
            loading={loading}
            isCompleted={isCompleted}
            onCompletedChange={(day: string, checked: boolean) => {
              handleCompleteObligation(day, checked);
            }}
            dummy={dummy}
            forceSound={forceSound || dummy}
          />
          <div
            className={cn(
              "h-full flex flex-col gap-1 flex-shrink-1 items-start justify-center",
              {
                "opacity-50 line-through": isCompleted,
              },
            )}
          >
            <div className="h-full flex flex-row gap-3 justify-center items-center">
              <div
                className={cn(
                  "w-fit h-full text-card-foreground line-clamp-1 font-medium",
                )}
              >
                <div className="h-fit w-fit flex flex-col gap-0.5 flex-shrink">
                  <span
                    className={cn(
                      "transition-all  duration-500 line-clamp-1 w-fit",
                      {
                        "text-muted-foreground font-normal": isCompleted,
                      },
                    )}
                  >
                    {emoji} {title}
                  </span>
                  <span className="text-foreground text-sm font-thin">
                    {day}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-center flex flex-row gap-3 flex-shrink-0">
          {partnersDetails && (
            <UsersIndicator
              userData={{
                isSigned: true,
                photoURL: userPhotoUrl || user?.photoURL,
                displayName: user?.displayName,
                isObligationCompleted: isCompleted,
              }}
              partnersData={partnersDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};
