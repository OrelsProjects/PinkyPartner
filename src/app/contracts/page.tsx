"use client";

import React from "react";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { useContracts } from "../../lib/hooks/useContracts";
import ContractComponent from "../../components/contractComponent";

interface ContractsProps {}

const ContractsPage: React.FC<ContractsProps> = () => {
  const router = useRouter();
  const { contracts: contractsData } = useContracts();
  return (
    <div className="flex flex-col gap-1">
      <Button onClick={() => router.push("/contracts/new")}>
        Create new contract
      </Button>
      {/*<div className="flex flex-wrap">
        {
          contractsData.map((contractData) => <ContractComponent title={contractData./>

          );
        }
      </div> */}
    </div>
  );
};

export default ContractsPage;
