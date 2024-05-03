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
import Contract from "../models/contract";
import Obligation from "../models/obligation";
import { Button } from "./ui/button";
import { dayNumbersToNames } from "@/lib/utils/dateUtils";
import { DialogClose } from "@radix-ui/react-dialog";
import { timesAWeekToText } from "../lib/utils/textUtils";

interface ContractViewComponentProps {
  contract: Contract;
  isSigned?: boolean;
  onSign?: (contract: Contract) => void;
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
    const signedNames = new Set(
      contract.signatures.map(signature => signature.displayName),
    );
    return contract.contractees
      .filter(ce => !signedNames.has(ce.displayName))
      .map(ce => ce.displayName);
  }, [contract]);

  const ContractDetails = () => (
    <DialogContent className="md:h-[575px] md:w-[575px]">
      <DialogHeader>
        <DialogTitle className="text-2xl">{contract.title}</DialogTitle>
      </DialogHeader>
      <div>
        <h1 className="font-semibold">Promises:</h1>
        <div className="flex flex-col gap-1 max-h-56 overflow-auto">
          {contract.obligations.map((obligation: Obligation, index: number) => (
            <div key={index}>
              <p className="font-semibold">
                {obligation.title} {obligation.emoji}
              </p>
              <div className="flex flex-row gap-1">
                <p>Frequency:</p>
                <span className="font-thin">{obligation.repeat}</span>
              </div>
              {obligation.days && obligation.days?.length > 0 ? (
                <div className="flex flex-row gap-1">
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
            </div>
          ))}
        </div>
      </div>
      <div className="text-sm">
        <h3 className="font-semibold text-base">Due Date:</h3>
        <p>
          {new Date(contract.dueDate).toLocaleDateString(undefined, {
            dateStyle: "long",
          })}
        </p>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Signatories:</h3>
        <p className="font-thin">
          We, {SignedNames}, hereby commit to the terms outlined within this
          contract.
        </p>
      </div>
      {!isSigned && (
        <DialogFooter>
          <div className="w-full flex justify-start items-center">
            <DialogClose>
              <Button onClick={() => onSign?.(contract)}>
                Put your pinky in!
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      )}
    </DialogContent>
  );

  const UnSignedNotice = () => (
    <DialogContent className="space-y-4">
      <DialogHeader>
        <DialogTitle>All Parties Must Sign</DialogTitle>
        <DialogDescription>
          This contract is pending signatures. All parties must sign the
          contract for it to be executed and considered valid.
        </DialogDescription>
      </DialogHeader>
      <div>
        <p className="text-sm">
          Missing Signatures:{" "}
          {missingSignatures.length > 0 ? missingSignatures.join(", ") : "None"}
        </p>
      </div>
    </DialogContent>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {!isSigned ? (
          <Button className="relative">
            Sign contract
            <div className="shimmer-animation"></div>
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
