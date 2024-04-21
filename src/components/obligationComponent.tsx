import React from "react";
import Obligation from "../models/obligation";

interface ObligationProps {
  obligation: Obligation;
  onClick?: (obligation: Obligation) => void;
  className?: string;
}

const ObligationComponent: React.FC<ObligationProps> = ({
  obligation,
  onClick,
  className,
}) => {
  return (
    <div
      className={`rounded-lg h-10 w-full bg-muted flex flex-row justify-start items-center gap-3 p-2 ${className}
      shadow-md
      `}
      onClick={() => onClick?.(obligation)}
    >
      <span className="text-card-foreground">{obligation.emoji}</span>
      <span className="text-card-foreground truncate">{obligation.title}</span>
    </div>
  );
};

export default ObligationComponent;
