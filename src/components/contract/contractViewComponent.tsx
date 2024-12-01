import React, { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ContractWithExtras } from "@/lib/models/contract";
import Obligation from "@/lib/models/obligation";
import { Button } from "../ui/button";
import { dayNumbersToNames } from "@/lib/utils/dateUtils";
import { timesAWeekToText } from "@/lib/utils/textUtils";
import {
  SectionContainer,
  SectionTitle,
  SectionTitleContainer,
  SectionTitleExplanation,
  SectionTitleSecondary,
} from "@/components/ui/section";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { setShowStatusOfContractId } from "@/lib/features/status/statusSlice";

interface ContractViewComponentProps {
  contract: ContractWithExtras;
  isSigned?: boolean;
  open?: boolean | undefined;
  showReport?: boolean;
  children?: React.ReactNode;
  onClose?: () => void;
  onSign: (contract: ContractWithExtras) => void;
}

const ContractViewComponent: React.FC<ContractViewComponentProps> = ({
  showReport,
  contract,
  isSigned,
  children,
  onClose,
  onSign,
  open,
}) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = React.useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const contracteesNames = useMemo(() => {
    return contract.contractees.map(ce => ce.displayName);
  }, [contract.contractees]);

  const SignedNames = useMemo(() => {
    if (contracteesNames.length > 1) {
      const maxContractees = 2;
      const last = contracteesNames[contracteesNames.length - 1];
      return (
        <>
          {contracteesNames.slice(0, -1).map((name, index) => (
            <React.Fragment key={index}>
              <strong>{name}</strong>
              {index < contracteesNames.length - maxContractees ? ", " : " "}
            </React.Fragment>
          ))}
          and <strong>{last}</strong>
        </>
      );
    }
    return <strong>{contracteesNames[0]}</strong>;
  }, [contract.contractees]);

  const areAllSigned = useMemo(
    () => contract.signatures.length >= contract.contractees.length,
    [contract],
  );

  const missingSignatures = useMemo(() => {
    const signedUserIds = new Set(
      contract.signatures
        .filter(signature => signature.signedAt !== null)
        .map(signature => signature.userId),
    );

    return contract.contractees
      .filter(ce => !signedUserIds.has(ce.userId))
      .map(ce => ce.displayName);
  }, [contract]);

  const ContractDetails = () => (
    <DialogContent
      className="h-fit flex flex-col gap-4 overflow-auto"
      closeOnOutsideClick
    >
      <DialogTitle className="text-3xl">{contract.title}</DialogTitle>
      <SectionContainer>
        <SectionTitleContainer className="gap-2">
          <SectionTitle text="Promises" />
          <div className="flex flex-col gap-4">
            {contract.obligations.map(
              (obligation: Obligation, index: number) => (
                <div key={index}>
                  <SectionTitleSecondary
                    text={`${obligation.emoji} ${obligation.title}`}
                  />
                  <div className="flex flex-row gap-2">
                    <p>Frequency:</p>
                    <span className="font-thin">{obligation.repeat}</span>
                  </div>
                  {obligation.days && obligation.days?.length > 0 ? (
                    <div className="flex flex-row gap-2">
                      <p className="flex-shrink-0">Repeated:</p>
                      <span className="font-thin">
                        {obligation.days.length === 7
                          ? "Every day"
                          : dayNumbersToNames(obligation.days)
                              .map(day => day.slice(0, 2))
                              .join(", ")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-row gap-1">
                      <p className="flex-shrink-0">Repeat:</p>
                      <span className="font-thin">
                        {timesAWeekToText(obligation.timesAWeek)}
                      </span>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </SectionTitleContainer>
      </SectionContainer>
      <SectionContainer>
        <SectionTitleContainer>
          <SectionTitle text="Due date" />
          <SectionTitleExplanation text="This is when the contract will expire" />
          <p className="pt-2 font-normal">
            {new Date(contract.dueDate).toLocaleDateString(undefined, {
              dateStyle: "long",
            })}
          </p>
        </SectionTitleContainer>
      </SectionContainer>
      <div className="mt-4">
        <SectionTitle text="Pinky agreement" />
        {!areAllSigned && missingSignatures.length > 0 ? (
          <p className="font-thin mt-2">
            Missing pinkies:{" "}
            <p className="font-semibold">{missingSignatures.join(", ")}</p>
          </p>
        ) : (
          <p className="font-thin mt-2">
            {contracteesNames.length > 1 ? "We" : "I"}, {SignedNames}, hereby
            commit to the terms outlined within this contract with{" "}
            {contracteesNames.length > 1 ? "our pinkies" : "my pinky"}.
          </p>
        )}
      </div>
      {!isSigned && (
        <DialogFooter>
          <div className="w-full flex justify-start items-center">
            <DialogClose>
              <Button onClick={() => onSign(contract)}>
                Put your pinky in!
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      )}
      {showReport && (
        <DialogFooter>
          <Button
            className="bg-primary text-white mt-6"
            onClick={() => {
              dispatch(setShowStatusOfContractId(contract.contractId));
            }}
          >
            Show report
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
  );

  return (
    <Dialog
      onOpenChange={value => {
        setIsOpen(value);
        if (!value) {
          onClose?.();
        }
      }}
      open={isOpen}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <ContractDetails />
    </Dialog>
  );
};

export default ContractViewComponent;
