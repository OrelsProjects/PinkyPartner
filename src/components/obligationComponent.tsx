import React, { ElementType } from "react";
import Obligation from "../models/obligation";
import { useObligations } from "../lib/hooks/useObligations";
import { FiMinusCircle as Minus } from "react-icons/fi";
import { Button } from "./ui/button";
import Loading from "./ui/loading";

interface ObligationProps {
  obligation: Obligation;
  onClick?: (obligation: Obligation) => void;
  onDelete?: (obligation: Obligation) => void;
  deleteIcon?: ElementType;
  className?: string;
  showDelete?: boolean;
}

const ObligationComponent: React.FC<ObligationProps> = ({
  obligation,
  onClick,
  onDelete,
  deleteIcon,
  className,
  showDelete = true,
}) => {
  const { deleteObligation, loading } = useObligations();

  const DeleteIcon: ElementType = deleteIcon ?? Minus;

  return (
    <div
      className={`rounded-lg h-10 w-full bg-muted flex flex-row justify-between items-center gap-3 p-2 ${className}
      shadow-md
      `}
      onClick={() => onClick?.(obligation)}
    >
      <div>
        <span className="text-card-foreground">{obligation.emoji}</span>
        <span className="text-card-foreground truncate">
          {obligation.title}
        </span>
      </div>
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
                  deleteObligation(obligation);
                }
              }}
            />
          ) : (
            <Loading spinnerClassName="w-6 h-6 fill-red-500 text-red-500" />
          )}
        </Button>
      )}
    </div>
  );
};

export default ObligationComponent;
