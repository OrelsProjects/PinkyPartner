import React, { useEffect } from "react";
import Contract from "../../models/contract";
import { Accordion, AccordionContent, AccordionItem } from "../ui/accordion";
import { UserContractObligationData } from "../../models/userContractObligation";
import { useAppSelector } from "../../lib/hooks/redux";
import AccordionTriggerMain from "./accordionTriggerMain";
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

export default function ContractsAccordion({
  userData,
  partnerData,
  loading,
}: ContractAcccordionProps) {
  const { user } = useAppSelector(state => state.auth);

  const { newObligations, markObligationsAsViewed } = useNotifications();
  const [newContracts, setNewContracts] = React.useState<Contract[]>([]);
  const [collapseFirstContract, setCollapseFirstContract] =
    React.useState<boolean>(false);

  useEffect(() => {
    if (!loading && newObligations.length > 0) {
      setTimeout(() => {
        markObligationsAsViewed();
        setNewContracts([]);
      }, 12000);
    }
  }, [newObligations, loading]);

  useEffect(() => {
    const contracts = userData.map(obligation => obligation.contract);

    if (contracts.length === 1) {
      setCollapseFirstContract(true);
    }
  }, []);

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

  const getDefaultValue = () => {
    if (collapseFirstContract) {
      const contracts = userData.map(obligation => obligation.contract);
      const contractId = contracts[0].contractId;
      const weeklyValue = `weekly-accordion-${contractId}`;
      const dailyValue = `daily-accordion-${contractId}`;
      return [contractId, weeklyValue, dailyValue];
    }
  };

  return (
    <div className="max-h-full h-fit w-full flex flex-col gap-2  mt-16">
      <h1 className="font-bold tracking-wide">Contracts</h1>
      <Accordion
        type="multiple"
        value={getDefaultValue()}
        onValueChange={() => {
          setCollapseFirstContract(false);
        }}
        defaultValue={getDefaultValue()}
        className="flex flex-col gap-3"
        aria-expanded="true"
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
