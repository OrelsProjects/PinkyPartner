"use client";

import React, { ElementType } from "react";
import Obligation from "../models/obligation";
import { useObligations } from "../lib/hooks/useObligations";
import { FiMinusCircle as Minus } from "react-icons/fi";
import { Button } from "./ui/button";
import Loading from "./ui/loading";

import CheckboxObligation from "./checkboxObligation";
import RepeatComponent from "./repeatComponent";
import { toast } from "react-toastify";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";
import { dateToHourMinute } from "../lib/utils/dateUtils";
import AccountabilityPartnerComponent from "./accountabilityPartnerComponent";

interface ObligationProps {
  obligation: Obligation;
  contractId?: string;
  onClick?: (obligation: Obligation) => void;
  onDelete?: (obligation: Obligation) => void;
  showDelete?: boolean;
  showComplete?: boolean;
  deleteIcon?: ElementType;
  className?: string;
  completedAt?: Date;
  ownerImageUrl?: string | null;
}

export const ObligationComponentLoading: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={`rounded-lg h-16 w-full md:w-96 bg-muted flex flex-row justify-between items-start gap-3 p-2 ${className}
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

const ObligationComponent: React.FC<ObligationProps> = ({
  obligation,
  contractId,
  onClick,
  onDelete,
  showDelete,
  showComplete,
  deleteIcon,
  className,
  completedAt,
  ownerImageUrl,
}) => {
  const { deleteObligation, loading } = useObligations();

  const DeleteIcon: ElementType = deleteIcon ?? Minus;

  const handleDelete = () => {
    toast.promise(deleteObligation(obligation), {
      pending: "Deleting...",
    });
  };

  return (
    <div
      className={`rounded-lg h-16 w-full md:w-96 bg-card flex flex-row justify-between items-start gap-3 p-2 ${className}
      shadow-md
      `}
      onClick={() => onClick?.(obligation)}
    >
      <div className="flex flex-col gap-1 flex-shrink-1">
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
        <RepeatComponent obligation={obligation} />
      </div>
      <div className="h-full flex flex-row gap-2 items-center flex-shrink-0">
        {ownerImageUrl && (
          <AccountabilityPartnerComponent
            signed
            partner={{
              photoURL: ownerImageUrl,
              displayName: "",
              userId: "",
            }}
          />
        )}
        {showDelete && (
          <Button variant="ghost" className="!p-1 self-center">
            {!loading ? (
              <DeleteIcon
                className="text-red-500 cursor-pointer text-2xl"
                onClick={(e: any) => {
                  e.stopPropagation();
                  if (onDelete) {
                    onDelete(obligation);
                  } else {
                    handleDelete();
                  }
                }}
              />
            ) : (
              <Loading spinnerClassName="w-6 h-6 fill-red-500 text-red-500" />
            )}
          </Button>
        )}
        {contractId && showComplete && (
          <CheckboxObligation obligation={obligation} contractId={contractId} />
        )}
        {completedAt && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              {new Date(completedAt).toLocaleDateString()}
            </span>
            <span className="text-sm text-muted-foreground">
              {dateToHourMinute(completedAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObligationComponent;
