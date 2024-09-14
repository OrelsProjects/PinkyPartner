import React, { useEffect } from "react";
import { UserContractObligationData } from "@/models/userContractObligation";
import Contract, { ContractWithExtras } from "@/models/contract";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import ContractViewComponent from "../contract/contractViewComponent";
import { useContracts } from "@/lib/hooks/useContracts";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import useNotifications from "@/lib/hooks/useNotifications";
import ObligationsComponent from "./contractObligation";
import Loading from "../ui/loading";
import { FaBell } from "react-icons/fa6";
import CantBeNudgedError from "@/models/errors/CantBeNudgedError";
import { getWeekRangeFormatted } from "@/lib/utils/dateUtils";
import { Button } from "../ui/button";
import SendNudgeDialog from "../sendNudgeDialog";
import ContractViewDropdown from "../contract/contractViewDropdown";
import { setShowStatusOfContractId } from "@/lib/features/status/statusSlice";

export type GroupedObligations = {
  [key: string]: {
    userObligations: { [key: string]: UserContractObligationData[] };
    partnerObligations: { [key: string]: UserContractObligationData[] };
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
  showReport?: boolean;
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
  showReport,
}: ContractAcccordionProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { contracts } = useAppSelector(state => state.contracts);
  const { signContract } = useContracts();
  const { newObligations, nudgePartner, loadingNudge } = useNotifications();
  const [nudgeSentContractId, setNudgeSentContractId] =
    React.useState<string>(""); // Last contract id a nudge was successfully sent to

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
              userObligations: {},
              partnerObligations: {},
              contract: userContract,
              newObligations: [],
              isSigned,
              isPartnerSigned,
            };
          }

          if (isPartner) {
            if (!acc[contractId].partnerObligations[obligation.obligationId]) {
              acc[contractId].partnerObligations[obligation.obligationId] = [];
            }
            acc[contractId].partnerObligations[obligation.obligationId].push(
              obligation,
            );
          } else {
            if (!acc[contractId].userObligations[obligation.obligationId]) {
              acc[contractId].userObligations[obligation.obligationId] = [];
            }
            acc[contractId].userObligations[obligation.obligationId].push(
              obligation,
            );
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

  const handleNudgePartner = async (
    contract: ContractWithExtras,
    title: string,
  ) => {
    const to = contract.signatures.find(
      signature => signature.userId !== user?.userId,
    );
    if (to) {
      try {
        setNudgeSentContractId("");
        await nudgePartner(to.userId, contract, title);
        toast(`A nudge was sent to ${to.displayName}`);
        setNudgeSentContractId(contract.contractId);
      } catch (e: any) {
        if (e instanceof CantBeNudgedError) {
          toast.warn(
            `You can't nudge your partner for another ${e.nextNudgeTimeHours}:${e.nextNudgeTimeMinutes} hours.`,
          );
          return;
        } else {
          toast.error("Failed to nudge partner");
        }
      }
    } else {
      toast.warning("No partner to nudge");
    }
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
            className={cn("w-full h-fit relative bg-card/40 p-4 rounded-lg", {
              "p-2": !isSigned,
            })}
            key={`contract.contractId-${index}`}
          >
            <div className="absolute top-3 right-3 z-40">
              <ContractViewDropdown
                onShowStats={() => {
                  dispatch(setShowStatusOfContractId(contract.contractId));
                }}
              />
            </div>
            <AnimatePresence>
              {!isSigned && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={
                    "h-full w-full bg-foreground/60 absolute top-0 left-0 z-50 rounded-sm flex justify-center items-center flex-col gap-1"
                  }
                >
                  <h1 className="w-full text-center text-xl text-background font-semibold">
                    Sign the contract to start!
                  </h1>
                  <ContractViewComponent
                    contract={contract}
                    isSigned={isSigned}
                    onSign={handleOnSign}
                  >
                    <Button className="relative" variant="default">
                      Seal your pinky
                      <div className="shimmer-animation rounded-xl"></div>
                    </Button>
                  </ContractViewComponent>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="sticky top-0 w-full h-full flex flex-col gap-0 justify-start items-start mb-3">
              <div className="flex flex-row gap-4 items-center">
                <ContractViewComponent
                  contract={contract}
                  isSigned={isSigned}
                  onSign={handleOnSign}
                  // showReport={showReport}
                >
                  <h1 className="font-semibold text-lg lg:text-2xl tracking-wide hover:cursor-pointer hover:underline">
                    {contract.title}
                  </h1>
                </ContractViewComponent>
                {loadingNudge[contract.contractId] ? (
                  <Loading spinnerClassName="h-4 w-4 text-primary" />
                ) : (
                  isPartnerSigned && (
                    <SendNudgeDialog
                      contract={contract}
                      onNudgeSelected={handleNudgePartner}
                    >
                      <motion.div
                        // Ring bell if nudge was sent to this contract
                        initial={{ scale: 1 }}
                        whileTap={{ scale: 0.8 }}
                        animate={{
                          rotate:
                            nudgeSentContractId === contract.contractId
                              ? [0, -5, 5, -5, 5, -5, 5, -5, 5, 0]
                              : 0,
                          transition: {
                            duration: 0.5,
                          },
                        }}
                        className="cursor-pointer"
                      >
                        <FaBell className="text-primary cursor-pointer h-[19px] w-[19px]" />
                      </motion.div>
                    </SendNudgeDialog>
                  )
                )}
              </div>
              <h2 className="font-thin">{getWeekRangeFormatted()}</h2>
            </div>
            <div className="flex flex-col gap-3">
              {Object.keys(userObligations)?.map(obligationId => (
                <ObligationsComponent
                  key={`obligations-list-${obligationId}`}
                  contract={contract}
                  obligations={userObligations[obligationId]}
                  newObligations={newObligations}
                  partnerData={partnerObligations[obligationId]}
                  isPartnerSigned={isPartnerSigned}
                />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
