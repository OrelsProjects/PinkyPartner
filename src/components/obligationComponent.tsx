import React, { ElementType } from "react";
import Obligation from "../models/obligation";
import { useObligations } from "../lib/hooks/useObligations";
import { FiMinusCircle as Minus } from "react-icons/fi";
import { Button } from "./ui/button";
import Loading from "./ui/loading";
import { Checkbox } from "./ui/checkbox";
import CheckboxObligation from "./checkboxObligation";
import RepeatComponent from "./repeatComponent";
import { toast } from "react-toastify";
import { Skeleton } from "./ui/skeleton";

interface ObligationProps {
  obligation: Obligation;
  onClick?: (obligation: Obligation) => void;
  onDelete?: (obligation: Obligation) => void;
  showDelete?: boolean;
  showComplete?: boolean;
  deleteIcon?: ElementType;
  className?: string;
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
  onClick,
  onDelete,
  showDelete,
  showComplete,
  deleteIcon,
  className,
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
      className={`rounded-lg h-16 w-full md:w-96 bg-muted flex flex-row justify-between items-start gap-3 p-2 ${className}
      shadow-md
      `}
      onClick={() => onClick?.(obligation)}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-3">
          <span className="text-card-foreground">{obligation.emoji}</span>
          <span className="text-card-foreground truncate">
            {obligation.title}
          </span>
        </div>
        <RepeatComponent obligation={obligation} />
      </div>
      <div className="flex flex-row gap-2 self-center">
        {showDelete && (
          <Button variant="ghost" className="!p-1">
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
        {showComplete && <CheckboxObligation obligation={obligation} />}
      </div>
    </div>
  );
};

export default ObligationComponent;
