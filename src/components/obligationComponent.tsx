import React from "react";
import Obligation from "../models/obligation";

interface ObligationProps {
  obligation: Obligation;
  onClick?: (obligation: Obligation) => void;
}

const ObligationComponent: React.FC<ObligationProps> = ({
  obligation,
  onClick,
}) => {
  return (
    <div
      className="rounded-lg h-24 w-24 bg-card flex flex-col justify-center items-center"
      onClick={() => onClick?.(obligation)}
    >
      <span className="text-card-foreground">{obligation.emoji ?? "📝"}</span>
      <span className="text-card-foreground">{obligation.title}</span>
    </div>
  );
};

export default ObligationComponent;
