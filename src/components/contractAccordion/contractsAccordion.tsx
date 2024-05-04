import React, { useEffect, useMemo } from "react";
import Contract from "../../models/contract";
import { Accordion, AccordionContent, AccordionItem } from "../ui/accordion";
import { UserContractObligationData } from "../../models/userContractObligation";
import { useAppSelector } from "../../lib/hooks/redux";
import AccordionTriggerMain from "./accordionTriggerMain";
import AccordionTriggerSecondary from "./accordionTriggerSecondary";
import ContractObligationComponent from "../contractObligationComponent";
import SingleContractAccordion from "./singleContractAccordion";
import useNotifications from "../../lib/hooks/useNotifications";
import { cn } from "../../lib/utils";

export type GroupedObligations = {
  [key: string]: {
    obligations: UserContractObligationData[];
    contract: Contract;
  };
};

interface ContractAcccordionProps {
  userData: UserContractObligationData[];
  partnerData: UserContractObligationData[];
  loading?: boolean;
}

const AccordionObligations = ({
  dailyObligations,
  groupedObligationsCompletedDaily,
  contract,
  partnerDailyObligations,
  partnerGroupedObligationsCompleted,
  partner,
}: {
  contract: Contract;
  dailyObligations: UserContractObligationData[];
  groupedObligationsCompletedDaily: GroupedObligations;
  partnerDailyObligations?: UserContractObligationData[];
  partnerGroupedObligationsCompleted: GroupedObligations;
  partner?: { photoURL: string } | null;
}) => (
  <AccordionContent className="flex flex-row justify-start gap-1 mt-2">
    <div className="flex flex-col gap-1">
      {dailyObligations.map(obligation => (
        <div key={obligation.obligationId}>
          <ContractObligationComponent
            userContractObligation={obligation}
            className="!shadow-none bg-card/30 border-[1px] border-foreground/10"
          />
        </div>
      ))}
      {groupedObligationsCompletedDaily[contract.contractId]?.obligations.map(
        obligationCompleted => (
          <div key={obligationCompleted.obligationId}>
            <ContractObligationComponent
              userContractObligation={obligationCompleted}
              // ownerImageUrl={obligationCompleted.appUser?.photoURL}
              className="!shadow-none bg-gray-500/20 dark:bg-gray-500/10 border-[1px] border-foreground/10"
            />
          </div>
        ),
      )}
    </div>
    <div className="flex flex-col gap-1">
      {partnerDailyObligations?.map(obligation => (
        <div key={obligation.obligationId}>
          <ContractObligationComponent
            userContractObligation={obligation}
            className="!shadow-none bg-card/20 border-[1px] border-foreground/10"
          />
        </div>
      ))}
      {partnerGroupedObligationsCompleted[contract.contractId]?.obligations.map(
        obligationCompleted => (
          <div key={obligationCompleted.obligationId}>
            <ContractObligationComponent
              userContractObligation={obligationCompleted}
              ownerImageUrl={partner?.photoURL}
              className="!shadow-none bg-gray-500/20 dark:bg-gray-500/10 border-[1px] border-foreground/10"
            />
          </div>
        ),
      )}
    </div>
  </AccordionContent>
);

export default function ContractsAccordion({
  userData,
  partnerData,
  loading,
}: ContractAcccordionProps) {
  const { user } = useAppSelector(state => state.auth);

  const { newObligations, markObligationsAsViewed } = useNotifications();
  const [newContracts, setNewContracts] = React.useState<Contract[]>([]);

  useEffect(() => {
    if (!loading && newObligations.length > 0) {
      setTimeout(() => {
        markObligationsAsViewed();
        setNewContracts([]);
      }, 8000);
    }
  }, [newObligations, loading]);

  useEffect(() => {
    const contracts = userData.map(obligation => obligation.contract);
    setNewContracts(
      contracts.filter(contract =>
        newObligations.find(
          obligation => obligation.contractId === contract.contractId,
        ),
      ),
    );
  }, [userData, newObligations]);

  if (!user) {
    return null;
  }

  const groupObligations = (
    obligations: UserContractObligationData[],
  ): GroupedObligations =>
    obligations.reduce(
      (acc: GroupedObligations, obligation: UserContractObligationData) => {
        const contractId = obligation.contract.contractId;
        if (!acc[contractId]) {
          acc[contractId] = {
            obligations: [],
            contract: obligation.contract,
          };
        }

        acc[contractId].obligations.push(obligation);
        return acc;
      },
      {},
    );

  const allObligationsGrouped = () => {
    const groupedObligations = groupObligations(userData.concat(partnerData));
    return groupedObligations;
  };

  return (
    <div className="max-h-full h-fit w-full flex flex-col gap-2  mt-16">
      <h1 className="font-bold tracking-wide">Contracts</h1>
      <Accordion
        type="multiple"
        defaultValue={["Weekly"]}
        className="flex flex-col gap-3"
      >
        {Object.values(allObligationsGrouped()).map(contractObligations => {
          const { obligations, contract } = contractObligations;
          return (
            <AccordionItem
              key={contract.contractId}
              value={contract.contractId}
              className={"border-0"}
            >
              <AccordionTriggerMain>
                <div
                  className={cn({
                    "shimmer-animation-primary w-full h-full rounded-lg":
                      newContracts.some(
                        newContract =>
                          newContract.contractId === contract.contractId,
                      ),
                  })}
                />
                <div className="w-full flex justify-start">
                  {contract.title}
                </div>
              </AccordionTriggerMain>
              <AccordionContent>
                <SingleContractAccordion
                  userContractObligations={obligations}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
