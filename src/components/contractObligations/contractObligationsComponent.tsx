import React, { useEffect, useMemo } from "react";
import { UserContractObligationData } from "../../models/userContractObligation";
import Contract, { ContractWithExtras } from "../../models/contract";
import { useAppSelector } from "../../lib/hooks/redux";
import {
  dateToDayString,
  daysOfWeek,
  getWeekRangeFormatted,
  isDateSameDay,
} from "../../lib/utils/dateUtils";
import { useObligations } from "../../lib/hooks/useObligations";
import { toast } from "react-toastify";
import { cn } from "../../lib/utils";
import ContractViewComponent from "../contract/contractViewComponent";
import { useContracts } from "../../lib/hooks/useContracts";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "../ui/checkbox";
import { Logger } from "../../logger";
import { UserAvatar } from "../ui/avatar";
import { FaLock } from "react-icons/fa";
import { Skeleton } from "../ui/skeleton";
import useNotifications from "../../lib/hooks/useNotifications";
import ObligationsComponent from "./contractObligation";

export type GroupedObligations = {
  [key: string]: {
    userObligations: UserContractObligationData[];
    partnerObligations: UserContractObligationData[];
    newObligations: UserContractObligationData[];
    contract: ContractWithExtras;
    isSigned: boolean;
    isPartnerSigned: boolean;
  };
};

interface ContractAcccordionProps {
  userData: UserContractObligationData[];
  partnerData: UserContractObligationData[];
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
  userData,
  partnerData,
  loading,
}: ContractAcccordionProps) {
  const { user } = useAppSelector(state => state.auth);
  const { contracts } = useAppSelector(state => state.contracts);
  const { signContract } = useContracts();
  const { newObligations } = useNotifications();

  const [groupedObligations, setGroupedObligations] =
    React.useState<GroupedObligations>({});

  useEffect(() => {
    const groupedObligations = userData
      .concat(partnerData)
      .reduce(
        (acc: GroupedObligations, obligation: UserContractObligationData) => {
          const contractId = obligation.contract.contractId;
          const isPartner = obligation.userId !== user?.userId;

          if (!acc[contractId]) {
            const userContract = contracts.find(
              contract => contract.contractId === contractId,
            );
            if (!userContract) return acc;

            const isSigned =
              userContract?.signatures.some(
                signature => signature.userId === user?.userId,
              ) || false;

            const isPartnerSigned =
              userContract?.signatures.some(
                signature => signature.userId !== user?.userId,
              ) || false;

            acc[contractId] = {
              userObligations: [],
              partnerObligations: [],
              contract: userContract,
              newObligations: [],
              isSigned,
              isPartnerSigned,
            };
          }

          if (isPartner) {
            acc[contractId].partnerObligations.push(obligation);
          } else {
            acc[contractId].userObligations.push(obligation);
          }
          acc[contractId].newObligations = newObligations.filter(
            newObligation =>
              newObligation.obligationId === obligation.obligationId,
          );
          return acc;
        },
        {},
      );
    setGroupedObligations(groupedObligations);
  }, [userData, partnerData]);

  const handleOnSign = (contract: ContractWithExtras) => {
    toast.promise(signContract(contract.contractId), {
      pending: "Signing contract...",
      success: {
        async render() {
          return "Contract signed successfully";
        },
      },
      error: "Failed to sign contract",
    });
  };

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="h-full w-full flex flex-col gap-10 overflow-auto relative pb-10">
      {Object.values(groupedObligations).map(
        (
          {
            contract,
            isSigned,
            newObligations,
            isPartnerSigned,
            userObligations,
            partnerObligations,
          },
          index,
        ) => (
          <div
            className={cn("w-full h-fit relative", {
              "p-2": !isSigned,
            })}
            key={`contract.contractId-${index}`}
          >
            <AnimatePresence>
              {!isSigned && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={
                    "h-full w-full bg-foreground/60 absolute top-0 left-0 z-10 rounded-sm flex justify-center items-center flex-col gap-1"
                  }
                >
                  <h1 className="w-full text-center text-xl text-background font-semibold">
                    Sign the contract to start!
                  </h1>
                  <ContractViewComponent
                    contract={contract}
                    isSigned={isSigned}
                    onSign={handleOnSign}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <ObligationsComponent
              contract={contract}
              obligations={userObligations}
              newObligations={newObligations}
              partnerData={partnerObligations}
              isPartnerSigned={isPartnerSigned}
            />
          </div>
        ),
      )}
    </div>
  );
}
