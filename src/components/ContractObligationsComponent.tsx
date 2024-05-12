import React, { useEffect, useMemo } from "react";
import { UserContractObligationData } from "../models/userContractObligation";
import Contract, { ContractWithExtras } from "../models/contract";
import { useAppSelector } from "../lib/hooks/redux";
import { Checkbox } from "./ui/checkbox";
import { dayNameToNumber, daysOfWeek } from "../lib/utils/dateUtils";
import { useObligations } from "../lib/hooks/useObligations";
import { toast } from "react-toastify";
import { UserAvatar } from "./ui/avatar";
import { cn } from "../lib/utils";
import ContractViewComponent from "./contractViewComponent";
import { useContracts } from "../lib/hooks/useContracts";
import { AnimatePresence, motion } from "framer-motion";

export type GroupedObligations = {
  [key: string]: {
    userObligations: UserContractObligationData[];
    partnerObligation: UserContractObligationData[];
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

const ObligationsComponent = ({
  obligations,
  contract,
}: {
  obligations: UserContractObligationData[];
  contract: Contract;
}) => {
  if (!obligations.length) return null;

  const { user } = useAppSelector(state => state.auth);
  const { completeObligation } = useObligations();

  // Returns an array of all the indices of days the obligation was completedAt
  const daysObligationsCompleted = useMemo(() => {
    return obligations.reduce((acc: number[], { completedAt, dueDate }) => {
      if (completedAt && dueDate) {
        acc.push(new Date(dueDate).getDay());
      }
      return acc;
    }, []);
  }, [obligations]);
  console.log("daysObligationsCompleted", daysObligationsCompleted);

  const handleCompleteObligation = async (
    day: string,
    completed: boolean = true,
  ) => {
    const dayInObligationIndex = obligations[0].obligation.days.findIndex(
      obligationDay => obligationDay === dayNameToNumber(day),
    );
    const obligation = obligations[dayInObligationIndex];
    if (!obligation) return;
    toast.promise(
      completeObligation(obligation, contract.contractId, completed),
      {
        pending: completed
          ? "Completing obligation..."
          : "Uncompleting obligation...",
        success: completed ? "Obligation completed" : "Obligation uncompleted",
        error: completed
          ? "Failed to complete obligation"
          : "Failed to uncomplete obligation",
      },
    );
  };

  const isPartner = useMemo(() => {
    return obligations[0].userId !== user?.userId;
  }, [obligations, user]);

  const userDetails = useMemo(() => {
    if (isPartner) {
      return {
        photoURL: obligations[0].appUser.photoURL,
        displayName: obligations[0].appUser.displayName,
      };
    }
    return {
      photoURL: user?.photoURL,
      displayName: user?.displayName,
    };
  }, [obligations, user]);

  const obligationsDays = useMemo(() => {
    if (obligations.length > 0) {
      return obligations[0].obligation.days.map(day => daysOfWeek[day]);
    }
    return [];
  }, [obligations]);

  const isObligationCompleted = (
    userContractObligation: UserContractObligationData,
  ) => {
    const dayOfObligation = userContractObligation.dueDate?.getDay();
    if (dayOfObligation === undefined) return false;
    return daysObligationsCompleted.includes(dayOfObligation);
  };

  return (
    <div className="flex flex-col h-fit w-full gap-1">
      <UserAvatar {...userDetails} />

      <div className="flex flex-row justify-between items-start h-fit w-full gap-3">
        {daysOfWeek.map(day => {
          return (
            <div
              key={`obligation-in-contract-${day}`}
              className="flex flex-col justify-start items-center text-muted-foreground"
            >
              <Checkbox
                className="w-7 md:w-8 h-7 md:h-8 rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-background"
                checked={daysObligationsCompleted.includes(
                  dayNameToNumber(day),
                )}
                onCheckedChange={(checked: boolean) => {
                  handleCompleteObligation(day, checked);
                }}
                variant="outline"
                disabled={!obligationsDays.includes(day) || isPartner}
              />
              <div>{day[0].toUpperCase()}</div>
            </div>
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
  console.log("my data", userData);
  console.log("partner data", partnerData);
  const { user } = useAppSelector(state => state.auth);
  const { contracts } = useAppSelector(state => state.contracts);
  const { signContract } = useContracts();

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
              partnerObligation: [],
              contract: userContract,
              isSigned,
              isPartnerSigned,
            };
          }

          if (isPartner) {
            acc[contractId].partnerObligation.push(obligation);
          } else {
            acc[contractId].userObligations.push(obligation);
          }
          return acc;
        },
        {},
      );
    setGroupedObligations(groupedObligations);
  }, [userData, partnerData]);

  const handleOnSign = (contract: ContractWithExtras) => {
    toast.promise(signContract(contract.contractId, user), {
      pending: "Signing contract...",
      success: {
        async render() {
          return "Contract signed successfully";
        },
      },
      error: "Failed to sign contract",
    });
  };

  return (
    <div className="h-full w-full flex flex-col gap-10 overflow-auto relative">
      {Object.values(groupedObligations).map(
        ({
          userObligations,
          partnerObligation,
          contract,
          isSigned,
          isPartnerSigned,
        }) => (
          <div
            className={cn("w-full h-fit relative", {
              "p-2": !isSigned,
            })}
            key={contract.contractId}
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
            <h1 className="font-semibold text-2xl tracking-wide">
              {contract.title}
            </h1>
            <ObligationsComponent
              obligations={userObligations}
              contract={contract}
            />
            <ObligationsComponent
              obligations={partnerObligation}
              contract={contract}
            />
          </div>
        ),
      )}
    </div>
  );
}
