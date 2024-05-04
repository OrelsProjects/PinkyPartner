"use client";

import React, { useMemo } from "react";
import AccountabilityPartnerComponent, {
  AccountabilityPartnerComponentLoading,
} from "./accountabilityPartnerComponent";
import { useContracts } from "../lib/hooks/useContracts";
import { useAppSelector } from "../lib/hooks/redux";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import ContractViewComponent from "./contractViewComponent";
import Contract, { ContractWithExtras } from "../models/contract";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";
import { useObligations } from "../lib/hooks/useObligations";
import InvitePartnerComponent from "./invitePartnerComponent";

interface ContractComponentProps {
  contract: ContractWithExtras;
}

export const ContractComponentLoading = ({
  className,
}: {
  className?: string;
}) => (
  <div
    className={cn(
      "w-full md:w-[23.5rem] h-60 shadow-md dark:bg-card rounded-md flex flex-col justify-between gap-1 p-3",
      className,
    )}
  >
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-between">
        <Skeleton className="w-40 h-6 rounded-lg" />
        <Skeleton className="w-32 h-9 rounded-lg" />
      </div>
      <Skeleton className="w-4/6 h-5 rounded-lg" />
      <Skeleton className="w-32 h-5 rounded-lg" />
    </div>
    <div className="w-full flex flex-row justify-around md:justify-start gap-1 md:gap-3">
      <AccountabilityPartnerComponentLoading
        key={"accountabilityPartnerComponentLoading - 1"}
      />
      <AccountabilityPartnerComponentLoading
        key={"accountabilityPartnerComponentLoading - 2"}
      />
    </div>
  </div>
);

const ContractComponent: React.FC<ContractComponentProps> = ({ contract }) => {
  const { signContract } = useContracts();
  const { fetchNextUpObligations } = useObligations();
  const { user } = useAppSelector(state => state.auth);

  const isUserSigned = useMemo(
    () =>
      contract.signatures.some(signature => signature.userId === user?.userId),
    [contract.signatures, user],
  );

  const isContractHasPartner = useMemo(
    () => contract.contractees.length > 1,
    [contract.contractees],
  );

  const handleSignContract = () => {
    toast.promise(signContract(contract.contractId, user), {
      pending: "Signing contract...",
      success: {
        async render() {
          fetchNextUpObligations();
          return "Contract signed successfully";
        },
      },
      error: "Failed to sign contract",
    });
  };

  return (
    <div
      className={cn(
        "w-full md:w-[23.5rem] h-60 shadow-md bg-card/70 dark:bg-card rounded-md flex flex-col justify-between gap-1 p-3",
        { "border-primary/50": !isUserSigned },
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <h1 className="font-semibold text-lg truncate">{contract.title}</h1>
          {user &&
            (isContractHasPartner ? (
              <ContractViewComponent
                contract={contract}
                isSigned={isUserSigned}
                onSign={handleSignContract}
              />
            ) : (
              <InvitePartnerComponent
                contract={contract}
                referralCode={user.meta?.referralCode}
                buttonText="Invite a partner"
                variant="default"
              />
            ))}
        </div>
        <h3 className="font-normal text-base line-clamp-2">
          {contract.description}
        </h3>
        <h4 className="font-normal text-base text-muted-foreground truncate">
          {new Date(contract.dueDate).toDateString()}
        </h4>
      </div>
      <div className="w-full flex flex-row justify-between md:justify-start gap-1 md:gap-3">
        {contract.contractees.map(contractee => (
          <AccountabilityPartnerComponent
            key={contractee.userId}
            partner={contractee}
            signed={contract.signatures.some(
              signature => signature.userId === contractee.userId,
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default ContractComponent;
