"use client";

import React, { useMemo } from "react";
import Obligation from "../models/obligation";
import CheckboxObligation from "./checkboxObligation";
import RepeatComponent from "./repeatComponent";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";
import { dateToDayString, dateToHourMinute } from "../lib/utils/dateUtils";
import AccountabilityPartnerComponent from "./accountabilityPartnerComponent";
import { UserContractObligationData } from "../models/userContractObligation";
import { useAppSelector } from "../lib/hooks/redux";

interface ObligationProps {
  userContractObligation: UserContractObligationData;
  ownerImageUrl?: string | null;
  isSigned?: boolean;
  onClick?: (obligation: UserContractObligationData) => void;
  className?: string;
}

export const ObligationComponentLoading: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={`rounded-lg h-16 w-full  md:w-[23.5rem] bg-card flex flex-row justify-between items-start gap-3 p-2 ${className}
    shadow-md
  `}
  >
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-3">
        <Skeleton className="w-4 h-4 rounded-full" />
        <Skeleton className="w-24 h-4 rounded-full" />
      </div>
      <Skeleton className="w-16 h-4 rounded-full" />
    </div>
    <div className="flex flex-row gap-2 self-center">
      <Skeleton className="w-6 h-6 rounded-full" />
    </div>
  </div>
);

const ContractObligationComponent: React.FC<ObligationProps> = ({
  userContractObligation,
  isSigned,
  onClick,
  className,
}) => {
  const { user } = useAppSelector(state => state.auth);
  const completedAt = useMemo(() => {
    if (userContractObligation) {
      return userContractObligation.completedAt;
    }
    return null;
  }, [userContractObligation]);

  const obligation = useMemo(() => {
    if (userContractObligation) {
      return userContractObligation.obligation;
    }
    return {} as Obligation;
  }, [userContractObligation]);

  const showRepeat = useMemo(() => {
    return userContractObligation?.obligation.repeat.toLowerCase() === "daily";
  }, [userContractObligation]);

  const isBelongToCurrentUser = useMemo(() => {
    return userContractObligation?.userId === user?.userId;
  }, [userContractObligation, user]);

  const showCompleted = useMemo(() => {
    return !completedAt && userContractObligation?.userId === user?.userId;
  }, [completedAt, userContractObligation, user]);

  return (
    <div
      className={`rounded-lg relative h-16 w-full md:w-[20.5rem] lg:w-[23.5rem] bg-card flex flex-row justify-between items-start gap-3 p-2 ${className}
      shadow-md
      `}
      onClick={() => onClick?.(userContractObligation)}
    >
      <div
        className={cn({
          "absolute w-full h-full inset-y-0 left-0 right-4 rounded-lg z-50 bg-black/60":
            !isSigned,
        })}
      />
      <div className="h-full flex flex-col gap-1 flex-shrink-1 items-start justify-center">
        <div className="flex flex-row gap-3">
          <span className="text-card-foreground">{obligation.emoji}</span>
          <span
            className={cn(
              "text-card-foreground line-clamp-1 font-medium",
              completedAt
                ? "line-through text-muted-foreground font-normal"
                : "",
            )}
          >
            {obligation.title}
          </span>
        </div>
        {showRepeat && (
          <RepeatComponent
            obligation={obligation}
            showFullDay
            dueDate={
              userContractObligation?.dueDate &&
              dateToDayString(new Date(userContractObligation?.dueDate))
            }
          />
        )}
      </div>
      <div className="h-full flex flex-row gap-2 items-center flex-shrink-0">
        {completedAt && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              {dateToDayString(new Date(completedAt))}
            </span>
            <span className="text-sm text-muted-foreground">
              {dateToHourMinute(completedAt)}
            </span>
          </div>
        )}

        <AccountabilityPartnerComponent
          signed
          partner={{
            photoURL: userContractObligation?.appUser.photoURL,
            displayName: "",
            userId: "",
          }}
          className={cn({
            hidden: isBelongToCurrentUser,
          })}
        />

        <CheckboxObligation
          obligation={userContractObligation}
          contract={userContractObligation?.contract}
        />
      </div>
    </div>
  );
};

export default ContractObligationComponent;
