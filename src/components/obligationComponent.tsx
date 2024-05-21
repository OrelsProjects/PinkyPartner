"use client";

import React, { ElementType } from "react";
import Obligation from "../models/obligation";
import { useObligations } from "../lib/hooks/useObligations";
import { FiMinusCircle as Minus } from "react-icons/fi";
import { Button } from "./ui/button";

import RepeatComponent from "./repeatComponent";
import { toast } from "react-toastify";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";
import { dateToDayString, dateToHourMinute } from "../lib/utils/dateUtils";
import AccountabilityPartnerComponent from "./accountabilityPartnerComponent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";

interface ObligationProps {
  obligation: Obligation;
  completedAt?: Date | null;
  ownerImageUrl?: string | null;
  showDelete?: boolean; // Show complete checkbox
  showRepeat?: boolean; // Show repeat component
  showFullDay?: boolean; // Show full day (instead of su,mo,...)
  deleteIcon?: ElementType; // Icon for delete button to replace default
  trailingIcon?: React.ReactNode; // Icon to show at the end of the obligation
  onClick?: (obligation: Obligation) => void;
  onDelete?: (obligation: Obligation) => void;
  onDeleteBefore?: (obligation: Obligation) => void;
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

const ObligationComponent: React.FC<ObligationProps> = ({
  obligation,
  completedAt,
  ownerImageUrl,
  deleteIcon,
  trailingIcon,
  showDelete,
  showRepeat = true,
  showFullDay,
  onClick,
  onDelete,
  className,
}) => {

  const DeleteIcon: ElementType = deleteIcon ?? Minus;

  const DeleteButton = () =>
    showDelete && (
      <Button
        variant="ghost"
        className="!p-1 self-center"
        type="button"
        onClick={(e: any) => {
          e.stopPropagation();

          onDelete?.(obligation);
        }}
      >
        <DeleteIcon className="text-red-500 cursor-pointer text-2xl" />
      </Button>
    );

  return (
    <div
      className={`rounded-lg h-16 w-full md:w-[20.5rem] lg:w-[23.5rem] bg-card flex flex-row justify-between items-start gap-3 p-2 ${className}
      shadow-sm hover:cursor-pointer hover:shadow-md
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
          <RepeatComponent obligation={obligation} showFullDay={showFullDay} />
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
        <DeleteButton />
        {trailingIcon}
      </div>
    </div>
  );
};

export default ObligationComponent;
