import React from "react";
import Contract from "../../models/contract";
import { Accordion, AccordionContent, AccordionItem } from "../ui/accordion";
import { UserContractObligationData } from "../../models/userContractObligation";
import { useAppSelector } from "../../lib/hooks/redux";
import AccordionTriggerMain from "./accordionTriggerMain";
import AccordionTriggerSecondary from "./accordionTriggerSecondary";
import ContractObligationComponent from "../contractObligationComponent";
import SingleContractAccordion from "./singleContractAccordion";

export type GroupedObligations = {
  [key: string]: {
    obligations: UserContractObligationData[];
    contract: Contract;
  };
};

interface ContractAcccordionProps {
  userData: UserContractObligationData[];
  partnerData: UserContractObligationData[];
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
            // ownerImageUrl={partner?.photoURL}
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

export default function ContractAccordion({
  userData,
  partnerData,
}: ContractAcccordionProps) {
  const { user } = useAppSelector(state => state.auth);

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
              className="border-0"
            >
              <AccordionTriggerMain>{contract.title}</AccordionTriggerMain>
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

  // return (
  //   <Accordion type="multiple" defaultValue={["Weekly"]}>
  //     {Object.values(groupedObligationsCompleted).map(
  //       ({ contract, obligations }) => {
  //         const weeklyObligations = obligations.filter(
  //           obligation => obligation.obligation.repeat === "Weekly",
  //         );
  //         const dailyObligations = obligations.filter(
  //           obligation => obligation.obligation.repeat === "Daily",
  //         );

  //         return (
  //           <AccordionItem
  //             key={contract.contractId}
  //             value={contract.contractId}
  //           >
  //             <AccordionTrigger>{contract.title}</AccordionTrigger>
  //             <AccordionContent>
  //               {weeklyObligations.length > 0 && (
  //                 <AccordionItem value={"Weekly"}>
  //                   <AccordionTrigger>Weekly</AccordionTrigger>
  //                   <AccordionContent>
  //                     {weeklyObligations.map(obligation => (
  //                       <div key={obligation.obligationCompletedId}>
  //                         {obligation.obligation.title}
  //                       </div>
  //                     ))}
  //                   </AccordionContent>
  //                 </AccordionItem>
  //               )}
  //               {dailyObligations.length > 0 && (
  //                 <AccordionItem value={"Daily"}>
  //                   <AccordionTrigger>Daily</AccordionTrigger>
  //                   <AccordionContent>
  //                     {dailyObligations.map(obligation => (
  //                       <AccordionItem
  //                         key={obligation.obligationCompletedId}
  //                         value={obligation.obligationCompletedId}
  //                       >
  //                         <AccordionTrigger>
  //                           {obligation.obligation.title}
  //                         </AccordionTrigger>
  //                         <AccordionContent>
  //                           <div>{obligation.obligation.title}</div>
  //                         </AccordionContent>
  //                       </AccordionItem>
  //                     ))}
  //                   </AccordionContent>
  //                 </AccordionItem>
  //               )}
  //             </AccordionContent>
  //           </AccordionItem>
  //         );
  //       },
  //     )}
  //   </Accordion>
  // );
}
