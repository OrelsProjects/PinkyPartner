import React from "react";
import Contract from "../models/contract";

interface ContractComponentProps {
  title: string;
  description?: string;
  dueDate: Date;
}

const ContractComponent: React.FC<ContractComponentProps> = contract => {
  return (
    <div className="border border-muted-foreground/50 rounded-md flex flex-col gap-1 w-full h-full">
      <h1 className="font-semibold text-lg truncate">{contract.title}</h1>
      <h3 className="font-normal text-base line-clamp-2">
        {contract.description}
      </h3>
      <h4 className="font-normal text-base text-muted-foreground truncate">
        {contract.dueDate.toDateString()}
      </h4>
    </div>
  );
};

export default ContractComponent;
