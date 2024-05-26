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
import ContractViewComponent from "../contractViewComponent";
import { useContracts } from "../../lib/hooks/useContracts";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "./checkbox";
import { Logger } from "../../logger";
import { UserAvatar } from "./avatar";
import { FaLock } from "react-icons/fa";

export type GroupedObligations = {
  [key: string]: {
    userObligations: UserContractObligationData[];
    partnerObligations: UserContractObligationData[];
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
  isPartnerSigned,
  obligations,
  partnerData,
  contract,
}: {
  contract: Contract;
  isPartnerSigned?: boolean;
  obligations: UserContractObligationData[];
  partnerData?: UserContractObligationData[];
}) => {
  if (!obligations.length) return null;

  const { user } = useAppSelector(state => state.auth);
  const { completeObligation } = useObligations();
  const [loadingObligationDays, setLoadingObligationDays] = React.useState<
    Record<string, boolean>
  >({});

  const userContractObligation = useMemo(() => {
    if (obligations.length > 0) {
      return obligations[0];
    }
  }, [obligations]);

  // Returns an array of all the indices of days the obligation was completedAt
  const daysObligationsCompleted = useMemo(() => {
    return obligations.reduce((acc: Date[], { completedAt, dueDate }) => {
      if (completedAt && dueDate) {
        acc.push(new Date(dueDate));
      }
      return acc;
    }, []);
  }, [obligations]);

  const daysObligationsCompletedPartner = useMemo(() => {
    return partnerData?.reduce((acc: Date[], { completedAt, dueDate }) => {
      if (completedAt && dueDate) {
        acc.push(new Date(dueDate));
      }
      return acc;
    }, []);
  }, [obligations]);

  const handleCompleteObligation = async (day: string, completed: boolean) => {
    const loading = loadingObligationDays[day];
    if (loading) return;

    const dayInObligationIndex = obligations.findIndex(
      obligation =>
        obligation.dueDate && dateToDayString(obligation.dueDate) === day,
    );

    const obligation = obligations[dayInObligationIndex];

    if (!obligation) return;
    // const completed = !!obligation.completedAt;

    try {
      setLoadingObligationDays(prev => ({
        ...prev,
        [day]: true,
      }));
      if (!completed) {
        // show yes no alert
        const shouldContinue = window.confirm(
          "Are you sure you want to mark this obligation as incomplete?",
        );
        if (!shouldContinue) {
          return;
        }
      }
      await completeObligation(obligation, contract.contractId, completed);
      if (completed) {
        const hasPartner = partnerData && partnerData.length > 0;
        const completedText = `Good job! ${hasPartner ? " Your partner will be notified" : ""}`;
        toast(completedText, {
          autoClose: hasPartner ? 3000 : 1500,
          theme: "light",
        });
      }
    } catch (e: any) {
      Logger.error(e);
    } finally {
      setLoadingObligationDays(prev => ({
        ...prev,
        [day]: false,
      }));
    }
  };

  const isPartner = useMemo(() => {
    return obligations[0].userId !== user?.userId;
  }, [obligations, user]);

  const obligationsDays = useMemo(() => {
    if (obligations.length > 0) {
      console.log(obligations[0].contract.title);
      console.log(obligations[0]);
      return obligations[0].obligation.days.map(day => daysOfWeek[day]);
    }
    return [];
  }, [obligations]);

  const isObligationCompleted = (day: string) =>
    daysObligationsCompleted.some(date => isDateSameDay(day, date));

  const isPartnerObligationCompleted = (day: string) =>
    daysObligationsCompletedPartner?.some(date => isDateSameDay(day, date));

  const partnerDetails = useMemo(() => {
    if (partnerData && partnerData.length > 0) {
      return partnerData[0].appUser;
    }
    return null;
  }, [partnerData]);

  return (
    userContractObligation && (
      <div className="w-full h-fit flex flex-col gap-3">
        <div className="w-full h-full flex flex-row gap-1 justify-start items-center">
          <span className="text-card-foreground">
            {userContractObligation.obligation.emoji}
          </span>
          <h1 className="font-semibold text-lg lg:text-2xl tracking-wide">
            {contract.title}
          </h1>
        </div>
        <div className="flex flex-col justify-between items-start h-fit w-full gap-1">
          <h2 className="font-thin">{getWeekRangeFormatted()}</h2>
          {obligationsDays.map((day, index) => {
            return (
              <div
                className={cn(
                  "rounded-lg h-16 w-full bg-card flex flex-row justify-between items-start gap-3 p-2 shadow-sm duration-200",
                  {
                    "bg-card/50": isObligationCompleted(day),
                  },
                )}
                key={`obligation-in-contract-${day}`}
                data-onboarding-id={`${index === 0 ? "home-start-doing" : ""}`}
              >
                <div
                  className={cn(
                    "h-full flex flex-col gap-1 flex-shrink-1 items-start justify-center",
                    {
                      "opacity-50": isObligationCompleted(day),
                    },
                  )}
                >
                  <div className="flex flex-row gap-3 justify-center items-center">
                    <span
                      className={cn(
                        "text-card-foreground line-clamp-1 font-medium",
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn("transition-all  duration-200", {
                            "line-through text-muted-foreground font-normal":
                              isObligationCompleted(day),
                          })}
                        >
                          {userContractObligation.obligation.title}
                        </span>
                        <span className="text-foreground text-sm font-thin">
                          {/* {getDateFormatted(day)} */}
                          {day}
                        </span>
                      </div>
                    </span>
                  </div>
                </div>
                <div className="self-center flex flex-row gap-6">
                  <div className="self-center flex flex-row gap-3">
                    <UserAvatar
                      displayName={user?.displayName}
                      photoURL={user?.photoURL}
                      className={cn("h-9 w-9", {
                        "border-2 border-green-500 rounded-full":
                          isObligationCompleted(day),
                      })}
                      imageClassName={cn()}
                    />
                    {partnerDetails && (
                      <UserAvatar
                        displayName={partnerDetails?.displayName}
                        photoURL={partnerDetails?.photoURL}
                        // badge={!isPartnerSigned && badgeNotSigned}
                        className={cn("h-9 w-9", {
                          "border-2 border-green-500 rounded-full":
                            isPartnerObligationCompleted(day),
                        })}
                        badgeClassName="w-full h-full flex justify-center items-center rounded-full"
                        imageClassName={cn({ "opacity-50": !isPartnerSigned })}
                        tooltipContent={
                          isPartnerSigned ? "" : "Partner didn't sign yet"
                        }
                      />
                    )}
                  </div>
                  <Checkbox
                    className="w-7 md:w-8 h-7 md:h-8 self-center rounded-lg border-foreground/70 data-[state=checked]:bg-gradient-to-t data-[state=checked]:from-primary data-[state=checked]:to-primary-lighter data-[state=checked]:text-foreground data-[state=checked]:border-primary"
                    checked={isObligationCompleted(day)}
                    onCheckedChange={(checked: boolean) => {
                      handleCompleteObligation(day, checked);
                    }}
                    variant="default"
                    // disabled={!obligationsDays.includes(day) || isPartner}
                    loading={loadingObligationDays[day]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )
  );
};

export default function ContractObligationsComponent({
  userData,
  partnerData,
}: ContractAcccordionProps) {
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
              partnerObligations: [],
              contract: userContract,
              isSigned,
              isPartnerSigned,
            };
          }

          if (isPartner) {
            acc[contractId].partnerObligations.push(obligation);
          } else {
            acc[contractId].userObligations.push(obligation);
          }
          return acc;
        },
        {},
      );
    console.log("groupedObligations: ", partnerData);
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
    <div className="h-full w-full flex flex-col gap-10 overflow-auto relative pb-10">
      {Object.values(groupedObligations).map(
        (
          {
            userObligations,
            partnerObligations,
            contract,
            isSigned,
            isPartnerSigned,
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
              obligations={userObligations}
              partnerData={partnerObligations}
              contract={contract}
              isPartnerSigned={isPartnerSigned}
            />
          </div>
        ),
      )}
    </div>
  );
}
