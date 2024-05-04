import React, { useMemo } from "react";
import { AccordionContent, AccordionItem } from "../ui/accordion";
import AccordionTriggerMain from "./accordionTriggerMain";
import AccordionTriggerSecondary from "./accordionTriggerSecondary";
import UserContractObligation, {
  UserContractObligationData,
} from "../../models/userContractObligation";
import { useAppSelector } from "../../lib/hooks/redux";
import AccordionObligations from "./accordionObligations";

interface SingleContractAccordionProps {
  userContractObligations: UserContractObligationData[];
}

const SingleContractAccordion: React.FC<SingleContractAccordionProps> = ({
  userContractObligations,
}) => {
  const contract = useMemo(() => {
    return userContractObligations[0]?.contract;
  }, [userContractObligations]);

  const weeklyObligations = useMemo(
    () =>
      userContractObligations.filter(
        ({ obligation }) => obligation.repeat.toLowerCase() === "weekly",
      ),
    [userContractObligations],
  );

  const dailyObligations = useMemo(
    () =>
      userContractObligations.filter(
        ({ obligation }) => obligation.repeat.toLowerCase() === "daily",
      ),
    [userContractObligations],
  );

  return (
    <AccordionContent>
      {weeklyObligations.length > 0 && (
        <AccordionItem
          value={`weekly-accordion-${contract?.contractId}`}
          className="w-[96%] border-0"
        >
          <AccordionTriggerSecondary>Weekly</AccordionTriggerSecondary>
          <div className="w-full flex flex-col justify-between">
            <AccordionObligations obligations={weeklyObligations} />
          </div>
        </AccordionItem>
      )}
      {dailyObligations.length > 0 && (
        <AccordionItem
          value={`Daily-${contract.contractId}`}
          className="w-[96%] border-0"
        >
          <AccordionTriggerSecondary>Daily</AccordionTriggerSecondary>
          <AccordionObligations obligations={dailyObligations} />
        </AccordionItem>
      )}
    </AccordionContent>
  );
};

export default SingleContractAccordion;