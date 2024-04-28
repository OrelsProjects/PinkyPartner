"use client";

import React from "react";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { useContracts } from "../../lib/hooks/useContracts";
import ContractComponent from "../../components/contractComponent";
import { FaPlus } from "react-icons/fa";

interface ContractsProps {}

const ContractsPage: React.FC<ContractsProps> = () => {
  const router = useRouter();
  const { contracts: contractsData } = useContracts();
  return (
    <div className="h-full w-full flex flex-col gap-1">
      <div className="flex flex-row gap-1">
        <span className="text-lg lg:text-xl text-muted-foreground">
          Contracts {contractsData.length > 0 && `(${contractsData.length})`}
        </span>
        <Button
          variant="link"
          className="!p-0"
          onClick={() => router.push("/contracts/new")}
        >
          <FaPlus className="w-5 h-5 mb-2 fill-muted-foreground" />
        </Button>
      </div>
      <div className="h-full w-full flex flex-col md:flex-wrap gap-3">
        {contractsData.map(contractData => (
          <ContractComponent
            contract={contractData}
            key={contractData.contractId}
          />
        ))}
      </div>
    </div>
  );
};

export default ContractsPage;
