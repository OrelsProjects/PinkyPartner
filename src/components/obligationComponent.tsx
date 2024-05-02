"use client";

import React, { ElementType } from "react";
import Obligation from "../models/obligation";
import { useObligations } from "../lib/hooks/useObligations";
import { FiMinusCircle as Minus } from "react-icons/fi";
import { Button } from "./ui/button";

import CheckboxObligation from "./checkboxObligation";
import RepeatComponent from "./repeatComponent";
import { toast } from "react-toastify";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";
import { dateToHourMinute } from "../lib/utils/dateUtils";
import AccountabilityPartnerComponent from "./accountabilityPartnerComponent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import Contract from "../models/contract";

interface ObligationProps {
  obligation: Obligation;
  contract?: Contract;
  onClick?: (obligation: Obligation) => void;
  onDelete?: (obligation: Obligation) => void;
  showDelete?: boolean;
  showComplete?: boolean;
  deleteIcon?: ElementType;
  className?: string;
  completedAt?: Date;
  ownerImageUrl?: string | null;
  trailingIcon?: React.ReactNode;
}

export const ObligationComponentLoading: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={`rounded-lg h-16 w-full md:w-96 bg-card flex flex-row justify-between items-start gap-3 p-2 ${className}
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
  contract,
  onClick,
  onDelete,
  showDelete,
  showComplete,
  deleteIcon,
  className,
  completedAt,
  ownerImageUrl,
  trailingIcon,
}) => {
  const { deleteObligation } = useObligations();

  const DeleteIcon: ElementType = deleteIcon ?? Minus;

  const handleDelete = () => {
    toast.promise(deleteObligation(obligation), {
      pending: "Deleting...",
      success: `Deleted ${obligation.title}`,
      error: "Something went wrong... Try again?",
    });
  };

  const DeleteButton = () =>
    showDelete && (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="!p-1 self-center"
            onClick={(e: any) => {
              e.stopPropagation();
            }}
          >
            <DeleteIcon className="text-red-500 cursor-pointer text-2xl" />
          </Button>
        </DialogTrigger>
        <DialogContent className="space-y-4">
          <DialogTitle>Giving up?</DialogTitle>
          <DialogDescription>
            {`Are you sure you want to go back on your promise to:`}
            <br />
            <span className="font-semibold">{obligation.title}</span>
            <br />
            <div className="text-sm text-muted-foreground italic mt-4">
              This action will remove this promise from all of your contracts.
            </div>
          </DialogDescription>

          <div className="w-full flex items-center flex-col gap-0">
            <DialogClose asChild>
              <Button
                onClick={(e: any) => {
                  e.stopPropagation();
                }}
              >
                I changed my mind
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant="link"
                className="font-light text-foreground hover:no-underline"
                onClick={(e: any) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onDelete) {
                    onDelete(obligation);
                  } else {
                    handleDelete();
                  }
                }}
              >
                Yes, I give up
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    );
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
        <DeleteButton />
        {trailingIcon}
        {contract && showComplete && (
          <CheckboxObligation obligation={obligation} contract={contract} />
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
