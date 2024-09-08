import React, { useCallback, useEffect } from "react";
import { UserContractObligationData } from "../../models/userContractObligation";
import { ContractWithExtras } from "../../models/contract";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/redux";
import { toast } from "react-toastify";
import { cn } from "../../lib/utils";
import { useContracts } from "../../lib/hooks/useContracts";
import { Skeleton } from "../ui/skeleton";
import useNotifications from "../../lib/hooks/useNotifications";
import CantBeNudgedError from "../../models/errors/CantBeNudgedError";
import {
  buildGroupedObligationsForContract,
  GroupedObligations,
} from "./_utils";
import { SingleContract } from "./singleContract";

interface ContractObligationsProps {
  loading?: boolean;
}

const LoadingComponent = () => {
  return (
    <div className="h-full w-full flex flex-col gap-10 overflow-auto relative pb-10">
      {[0, 1].map((_, index) => {
        return (
          <div
            key={`contract-loading-${index}`}
            className="w-full h-fit relative p-2"
          >
            <LoadingObligationsComponent />
          </div>
        );
      })}
    </div>
  );
};

const LoadingObligationsComponent = () => {
  return (
    <div className="w-full h-fit flex flex-col gap-3">
      <div className="w-full h-full flex flex-row gap-1 justify-start items-center">
        <Skeleton className="h-4 w-32 rounded-full" />
      </div>
      <div className="flex flex-col justify-between items-start h-fit w-full gap-1">
        <Skeleton className="h-3 w-16" />
        {[0, 1, 2].map((_, index) => {
          return (
            <Skeleton
              className={cn(
                "rounded-lg h-16 w-full bg-card flex flex-row justify-between items-start gap-3 p-2 shadow-sm",
              )}
              key={`obligation-in-contract-loading-${index}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default function ContractObligationsComponent({
  loading,
}: ContractObligationsProps) {
  console.log("Rendered!");

  const { contracts } = useAppSelector(state => state.contracts);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="h-full w-full flex flex-col gap-10 overflow-auto relative pb-10">
      {contracts.map(({ contractId }) => (
        <SingleContract
          key={`contract-${contractId}`}
          contractId={contractId}
        />
      ))}
    </div>
  );
}
