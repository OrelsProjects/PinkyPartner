import React, { useMemo } from "react";
import { AccordionContent, AccordionTrigger } from "../ui/accordion";
import ObligationComponent from "../obligationComponent";
import UserContractObligation, {
  UserBasicData,
  UserContractObligationData,
} from "../../models/userContractObligation";
import ContractObligationComponent from "../contractObligationComponent";
import { useAppSelector } from "../../lib/hooks/redux";

const AccordionObligations = ({
  obligations,
}: {
  obligations: UserContractObligationData[];
}) => {
  const { user } = useAppSelector(state => state.auth);
  const { contracts } = useAppSelector(state => state.contracts);

  const isPartnerSigned = useMemo(() => {
    return !!contracts
      .find(contract =>
        contract.signatures.some(
          signature => signature.userId === user?.userId,
        ),
      )
      ?.signatures.find(signature => signature.userId !== user?.userId);
  }, []);

  const partnerObligations = obligations.filter(
    obligation => obligation.userId !== user?.userId,
  );

  const userObligations = obligations.filter(
    obligation => obligation.userId === user?.userId,
  );

  return (
    <AccordionContent className="flex flex-row justify-start gap-1 mt-2">
      <div className="w-full flex flex-row justify-between">
        <div className="flex flex-col gap-1">
          {userObligations.map(contractObligation => (
            <ContractObligationComponent
              userContractObligation={contractObligation}
              className="!shadow-none bg-card/30 border-[1px] border-foreground/10"
              key={`accordion-obligations-${contractObligation.userContractObligationId}`}
              isSigned
            />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {partnerObligations.map(contractObligation => (
            <ContractObligationComponent
              userContractObligation={contractObligation}
              className="!shadow-none bg-card/30 border-[1px] border-foreground/10"
              key={`accordion-obligations-${contractObligation.userContractObligationId}`}
              isSigned={isPartnerSigned}
            />
          ))}
        </div>
      </div>
    </AccordionContent>
  );
};
export default AccordionObligations;
