"use client";

import React, { useMemo } from "react";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import { useContracts } from "../../../lib/hooks/useContracts";
import ContractComponent, {
  ContractComponentLoading,
} from "../../../components/contractComponent";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";

interface ContractsProps {}

const ContractsPage: React.FC<ContractsProps> = () => {
  const router = useRouter();

  const { contracts: contractsData, loadingData } = useContracts();

  const sortedContracts = useMemo(() => {
    // Slice is required because array is frozen in strict mode
    return contractsData.slice().sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });
  }, [contractsData]);

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
          data-onboarding-id="contracts-plus-button"
        >
          <FaPlus className="w-5 h-5 fill-muted-foreground" />
        </Button>
      </div>
      <motion.div
        className="h-fit w-full flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-12 md:justify-between overflow-auto mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loadingData
          ? Array.from({ length: contractsData.length || 6 }).map(
              (_, index) => (
                <ContractComponentLoading
                  key={`contractComponentLoading - ${index}`}
                />
              ),
            )
          : sortedContracts.map(contractData => (
              <ContractComponent
                contract={contractData}
                key={contractData.contractId}
              />
            ))}
      </motion.div>
    </div>
  );
};

export default ContractsPage;
