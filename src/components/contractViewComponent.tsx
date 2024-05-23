import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ContractWithExtras } from "../models/contract";
import Obligation from "../models/obligation";
import { Button } from "./ui/button";
import { dayNumbersToNames } from "@/lib/utils/dateUtils";
import { DialogClose } from "@radix-ui/react-dialog";
import { timesAWeekToText } from "../lib/utils/textUtils";
import {
  SectionContainer,
  SectionTitle,
  SectionTitleContainer,
  SectionTitleExplanation,
  SectionTitleSecondary,
} from "@/components/ui/section";
import Divider from "./ui/divider";
import { toast } from "react-toastify";
import { useContracts } from "../lib/hooks/useContracts";
import { useAppSelector } from "../lib/hooks/redux";

interface ContractViewComponentProps {
  contract: ContractWithExtras;
  isSigned?: boolean;
  onSign: (contract: ContractWithExtras) => void;
}

const ContractViewComponent: React.FC<ContractViewComponentProps> = ({
  contract,
  isSigned,
  onSign,
}) => {
  const SignedNames = useMemo(() => {
    const names = contract.contractees.map(ce => ce.displayName);
    if (names.length > 1) {
      const last = names.pop(); // Remove the last name to handle separately
      return (
        <>
          {names.map((name, index) => (
            <React.Fragment key={index}>
              <strong>{name}</strong>
              {index < names.length - 1 ? ", " : " "}
            </React.Fragment>
          ))}
          and <strong>{last}</strong>
        </>
      );
    }
    return <strong>{names[0]}</strong>;
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
    <DialogContent className="md:h-[575px] md:w-[575px]" closeOnOutsideClick>
      <DialogHeader>
        <DialogTitle className="text-3xl">{contract.title}</DialogTitle>
      </DialogHeader>
      <SectionContainer>
        <SectionTitleContainer className="gap-2">
          <SectionTitle text="Promises" />
          <div className="flex flex-col gap-4 max-h-56 overflow-auto">
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
                      <p className="flex-shrink-0">Repeated every:</p>
                      <span className="font-thin">
                        {dayNumbersToNames(obligation.days)
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
                  <Divider className="mt-3" />
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
        <p className="font-thin mt-2">
          We, {SignedNames}, hereby commit to the terms outlined within this
          contract with our pinkies.
        </p>
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
    </DialogContent>
  );

  const UnSignedNotice = () => (
    <DialogContent closeOnOutsideClick>
      <DialogHeader>
        <DialogTitle>Not all the pinkies were sealed</DialogTitle>
        <DialogDescription className="pt-1">
          <p>All the parties must commit a pinky for the contract to begin.</p>
        </DialogDescription>
      </DialogHeader>
      <div>
        <p className="text-sm flex flex-col">
          Missing pinkies:{" "}
          <p className="font-semibold">
            {missingSignatures.length > 0
              ? missingSignatures.join(", ")
              : "None"}
          </p>
        </p>
      </div>
    </DialogContent>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {!isSigned ? (
          <Button className="relative">
            Seal your pinky
            <div className="shimmer-animation rounded-lg"></div>
          </Button>
        ) : (
          <Button variant="outline" className="bg-transparent dark:bg-card">
            View Contract
          </Button>
        )}
      </DialogTrigger>
      {areAllSigned || !isSigned ? <ContractDetails /> : <UnSignedNotice />}
    </Dialog>
  );
};

export default ContractViewComponent;
