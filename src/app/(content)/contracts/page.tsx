"use client";

import React from "react";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import { useContracts } from "../../../lib/hooks/useContracts";
import ContractComponent, {
  ContractComponentLoading,
} from "../../../components/contractComponent";
import { FaPlus } from "react-icons/fa";

interface ContractsProps {}

const ContractsPage: React.FC<ContractsProps> = () => {
  const router = useRouter();
  const { contracts: contractsData, loading } = useContracts();
  return (
    <div className="h-full w-full flex flex-col gap-1">
      <div className="flex flex-row gap-1">
        <span className="text-lg lg:text-xl text-muted-foreground mt-1">
          CONTRACTS {contractsData.length > 0 && `(${contractsData.length})`}
        </span>
        <Button
          variant="link"
          onClick={() => router.push("/contracts/new")}
          className="text-2xl flex justify-center items-center p-2 hover:bg-muted/50"
        >
          <FaPlus className="w-5 h-5 fill-muted-foreground" />
        </Button>
      </div>
      <div className="h-full w-full flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-12 overflow-auto">
        {loading
          ? Array.from({ length: contractsData.length || 6 }).map((_, index) => (
              <ContractComponentLoading
                key={`contractComponentLoading - ${index}`}
              />
            ))
          : contractsData.map(contractData => (
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
