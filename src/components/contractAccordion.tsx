import React, { useMemo } from "react";
import Obligation, { ObligationsInContract } from "../models/obligation";
import ObligationCompleted from "../models/obligationCompleted";
import Contract from "../models/contract";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import ObligationComponent from "./obligationComponent";

export type GroupedObligations = {
  [key: string]: {
    contract: Contract;
    obligations: ObligationCompleted[];
  };
};

interface ContractAcccordionProps {
  userData: {
    obligationsToComplete: ObligationsInContract[];
    obligationsCompleted: ObligationCompleted[];
  };
  partnerData: {
    obligationsToComplete: ObligationsInContract[];
    obligationsCompleted: ObligationCompleted[];
  };
}

const AccordionTriggerMain = ({ children }: { children: React.ReactNode }) => (
  <AccordionTrigger className="font-bold tracking-wide shadow-md hover:shadow-lg hover:cursor-pointer rounded-lg px-3 border-[1px] border-foreground/10 bg-card/70">
    {children}
  </AccordionTrigger>
);

const AccordionTriggerSecondary = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <AccordionTrigger className="font-semibold mt-2 tracking-wide shadow-sm hover:cursor-pointer rounded-lg px-3 border-[1px] border-foreground/5 bg-card/40">
    {children}
  </AccordionTrigger>
);

const AccordionObligations = ({
  dailyObligations,
  groupedObligationsCompletedDaily,
  contract,
  partnerDailyObligations,
  partnerGroupedObligationsCompleted,
  partner,
}: {
  contract: Contract;
  dailyObligations: Obligation[];
  groupedObligationsCompletedDaily: GroupedObligations;
  partnerDailyObligations?: Obligation[];
  partnerGroupedObligationsCompleted: GroupedObligations;
  partner?: { photoURL: string };
}) => (
  <AccordionContent className="flex flex-row justify-start gap-1 mt-2">
    <div className="flex flex-col gap-1">
      {dailyObligations.map(obligation => (
        <div key={obligation.obligationId}>
          <ObligationComponent
            obligation={obligation}
            showComplete
            contract={contract}
            className="!shadow-none bg-card/30 border-[1px] border-foreground/10"
          />
        </div>
      ))}
      {groupedObligationsCompletedDaily[contract.contractId]?.obligations.map(
        obligationCompleted => (
          <div key={obligationCompleted.obligationId}>
            <ObligationComponent
              obligation={obligationCompleted.obligation}
              contract={contract}
              completedAt={obligationCompleted.completedAt}
              ownerImageUrl={obligationCompleted.appUser?.photoURL}
              className="!shadow-none bg-gray-500/20 dark:bg-gray-500/10 border-[1px] border-foreground/10"
            />
          </div>
        ),
      )}
    </div>
    <div className="flex flex-col gap-1">
      {partnerDailyObligations?.map(obligation => (
        <div key={obligation.obligationId}>
          <ObligationComponent
            obligation={obligation}
            ownerImageUrl={partner?.photoURL}
            className="!shadow-none bg-card/20 border-[1px] border-foreground/10"
          />
        </div>
      ))}
      {partnerGroupedObligationsCompleted[contract.contractId]?.obligations.map(
        obligationCompleted => (
          <div key={obligationCompleted.obligationId}>
            <ObligationComponent
              obligation={obligationCompleted.obligation}
              completedAt={obligationCompleted.completedAt}
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
  userData: { obligationsToComplete, obligationsCompleted },
  partnerData: {
    obligationsToComplete: partnerObligationsToComplete,
    obligationsCompleted: partnerObligationsCompleted,
  },
}: ContractAcccordionProps) {
  const groupObligations = (
    obligations: ObligationCompleted[],
  ): GroupedObligations =>
    obligations.reduce(
      (acc: GroupedObligations, obligation: ObligationCompleted) => {
        const contractId = obligation.contract.contractId;
        if (!acc[contractId]) {
          acc[contractId] = {
            contract: obligation.contract,
            obligations: [],
          };
        }

        acc[contractId].obligations.push(obligation);
        return acc;
      },
      {},
    );

  const groupedObligationsCompletedDaily = useMemo(() => {
    const groupedObligations = groupObligations(obligationsCompleted);
    return groupedObligations;
  }, [obligationsCompleted]);

  const groupedObligationsToCompleteDaily = useMemo(() => {
    Object.keys(groupedObligationsCompletedDaily).forEach(contractId => {
      const obligations =
        groupedObligationsCompletedDaily[contractId].obligations;
      const dailyObligations = obligations.filter(
        obligation => obligation.obligation.repeat === "Daily",
      );
      return dailyObligations;
    });
  }, [obligationsToComplete]);

  const groupedObligationsToCompleteWeekly = useMemo(() => {
    Object.keys(groupedObligationsCompletedDaily).forEach(contractId => {
      const obligations =
        groupedObligationsCompletedDaily[contractId].obligations;
      const weeklyObligations = obligations.filter(
        obligation => obligation.obligation.repeat === "Weekly",
      );
      return weeklyObligations;
    });
  }, [obligationsToComplete]);

  const partnerGroupedObligationsCompleted = useMemo(() => {
    const groupedObligations = groupObligations(partnerObligationsCompleted);
    return groupedObligations;
  }, [partnerObligationsCompleted]);

  const partnerGroupedObligationsToCompleteDaily = useMemo(() => {
    Object.keys(partnerGroupedObligationsCompleted).forEach(contractId => {
      const obligations =
        partnerGroupedObligationsCompleted[contractId].obligations;
      const dailyObligations = obligations.filter(
        obligation => obligation.obligation.repeat === "Daily",
      );
      return dailyObligations;
    });
  }, [partnerObligationsToComplete]);

  const partnerGroupedObligationsToCompleteWeekly = useMemo(() => {
    Object.keys(partnerGroupedObligationsCompleted).forEach(contractId => {
      const obligations =
        partnerGroupedObligationsCompleted[contractId].obligations;
      const weeklyObligations = obligations.filter(
        obligation => obligation.obligation.repeat === "Weekly",
      );
      return weeklyObligations;
    });
  }, [partnerObligationsToComplete]);

  /**
   * Accordion structure:
   * Contract name - Trigger
   *  Weekly - Trigger
   *    [toComplete promises list] - Content
   *    [completed promises list] - Content
   *  Daily - Trigger
   *    (current day) - Trigger
   *        [toComplete promises list] - Content
   *        [completed promises list] - Content
   *    (next day) - Trigger
   *        [toComplete promises list] - Content
   *        [completed promises list] - Content
   * ...
   */
  // Build the accordion for  !obligationsToComplete!
  return (
    <div className="max-h-full h-fit w-full flex flex-col gap-2  mt-16">
      <h1 className="font-bold tracking-wide"> Contracts</h1>
      <Accordion
        type="multiple"
        defaultValue={["Weekly"]}
        className="flex flex-col gap-3"
      >
        {obligationsToComplete.map(({ contract, obligations }) => {
          const weeklyObligations = obligations.filter(
            obligation => obligation.repeat === "Weekly",
          );
          const dailyObligations = obligations.filter(
            obligation => obligation.repeat === "Daily",
          );

          const partnerWeeklyObligationsToComplete =
            partnerObligationsToComplete
              .find(
                ({ contract: partnerContract }) =>
                  partnerContract.contractId === contract.contractId,
              )
              ?.obligations.filter(
                obligation => obligation.repeat === "Weekly",
              );

          const partnerDailyObligationsToComplete =
            partnerObligationsToComplete.find(
              ({ contract: partnerContract }) =>
                partnerContract.contractId === contract.contractId,
            );
          const partnerDailyObligations =
            partnerDailyObligationsToComplete?.obligations.filter(
              obligation => obligation.repeat === "Daily",
            );

          const partner = partnerDailyObligationsToComplete?.appUser;

          return (
            <AccordionItem
              key={contract.contractId}
              value={contract.contractId}
              className="border-0"
            >
              <AccordionTriggerMain>{contract.title}</AccordionTriggerMain>
              <AccordionContent>
                {weeklyObligations.length > 0 && (
                  <AccordionItem
                    value={`Weekly-${contract.contractId}`}
                    className="w-[96%] border-0"
                  >
                    <AccordionTriggerSecondary>
                      Weekly
                    </AccordionTriggerSecondary>
                    <AccordionObligations
                      contract={contract}
                      dailyObligations={weeklyObligations}
                      groupedObligationsCompletedDaily={
                        groupedObligationsCompletedDaily
                      }
                      partnerDailyObligations={
                        partnerWeeklyObligationsToComplete
                      }
                      partnerGroupedObligationsCompleted={
                        partnerGroupedObligationsCompleted
                      }
                      partner={partner}
                    />
                  </AccordionItem>
                )}
                {dailyObligations.length > 0 && (
                  <AccordionItem
                    value={`Daily-${contract.contractId}`}
                    className="w-[96%] border-0"
                  >
                    <AccordionTriggerSecondary>Daily</AccordionTriggerSecondary>

                    <AccordionObligations
                      contract={contract}
                      dailyObligations={dailyObligations}
                      groupedObligationsCompletedDaily={
                        groupedObligationsCompletedDaily
                      }
                      partnerDailyObligations={partnerDailyObligations}
                      partnerGroupedObligationsCompleted={
                        partnerGroupedObligationsCompleted
                      }
                      partner={partner}
                    />
                  </AccordionItem>
                )}
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
