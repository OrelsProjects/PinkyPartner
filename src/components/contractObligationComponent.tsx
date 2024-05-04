"use client";

import React, { useMemo } from "react";
import Obligation from "../models/obligation";
import { useObligations } from "../lib/hooks/useObligations";
import CheckboxObligation from "./checkboxObligation";
import RepeatComponent from "./repeatComponent";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";
import { dateToDayString, dateToHourMinute } from "../lib/utils/dateUtils";
import AccountabilityPartnerComponent from "./accountabilityPartnerComponent";
import Contract from "../models/contract";
import { UserContractObligationData } from "../models/userContractObligation";

interface ObligationProps {
  userContractObligation?: UserContractObligationData;
  completedAt?: Date | null;
  ownerImageUrl?: string | null;
  onClick?: (obligation: Obligation) => void;
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
  completedAt,
  ownerImageUrl,
  onClick,
  className,
}) => {
  const { deleteObligation } = useObligations();

  const obligation = useMemo(() => {
    if (userContractObligation) {
      return userContractObligation.obligation;
    }
    return {} as Obligation;
  }, [userContractObligation]);

  const showRepeat = useMemo(() => {
    return userContractObligation?.obligation.repeat.toLowerCase() === "daily";
  }, [userContractObligation]);

  return (
    <div
      className={`rounded-lg h-16 w-full md:w-[20.5rem] lg:w-[23.5rem] bg-card flex flex-row justify-between items-start gap-3 p-2 ${className}
      shadow-md
      `}
      onClick={() => onClick?.(obligation)}
    >
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
        />

        {userContractObligation?.contract && (
          <CheckboxObligation
            obligation={obligation}
            contract={userContractObligation?.contract}
          />
        )}
      </div>
    </div>
  );
};

export default ContractObligationComponent;
