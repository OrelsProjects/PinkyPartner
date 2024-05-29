"use client";

import React, { useMemo } from "react";
import AccountabilityPartnerComponent, {
  AccountabilityPartnerComponentLoading,
} from "../accountabilityPartnerComponent";
import { useContracts } from "../../lib/hooks/useContracts";
import { useAppSelector } from "../../lib/hooks/redux";
import { toast } from "react-toastify";
import ContractViewComponent from "./contractViewComponent";
import { ContractWithExtras } from "../../models/contract";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";
import InvitePartnerComponent from "../invitePartnerComponent";
import ContractViewDropdown from "./contractViewDropdown";
import OptOutComponent from "./optOutComponent";
import EditContractComponent from "./editContractComponent";

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
    <div className="flex flex-col gap-2 relative">
      <div className="flex flex-row justify-between">
        <Skeleton className="w-40 h-6 rounded-lg" />
      </div>
      <Skeleton className="absolute -top-1 -right-1 w-1.5 h-5 rounded-lg" />
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
  const { user } = useAppSelector(state => state.auth);
  const [showContract, setShowContract] = React.useState(false);
  const [showInvite, setShowInvite] = React.useState(false);
  const [showOptOut, setShowOptOut] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);

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
    toast.promise(signContract(contract.contractId), {
      pending: "Signing contract...",
      success: {
        render() {
          return "Contract signed successfully";
        },
      },
      error: "Failed to sign contract",
    });
  };

  return (
    <div
      className={cn(
        "w-full md:w-[23.5rem] h-60 shadow-md bg-card/70 dark:bg-card rounded-md flex flex-col justify-between gap-1 p-3 relative",
        { "border-primary/50": !isUserSigned },
      )}
    >
      <div className="absolute top-1.5 right-0.5">
        <ContractViewDropdown
          onView={() => setShowContract(true)}
          onInvite={
            contract.contractees.length <= 1
              ? () => setShowInvite(true)
              : undefined
          }
          onOptOut={() => setShowOptOut(true)}
          onEdit={() => setShowEdit(true)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <h1 className="font-semibold text-lg truncate">{contract.title}</h1>
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
      <div className="absolute right-4 bottom-4">
        <InvitePartnerComponent
          className={cn({ hidden: isContractHasPartner })}
          contract={contract}
          referralCode={user?.meta?.referralCode}
          buttonText="Invite"
          variant="default"
          onClose={() => setShowInvite(false)}
          open={showInvite}
        />
        <ContractViewComponent
          contract={contract}
          isSigned={isUserSigned}
          onSign={handleSignContract}
          onClose={() => setShowContract(false)}
          open={showContract}
          hideButton={true}
        />

        <OptOutComponent
          onClose={() => setShowOptOut(false)}
          open={showOptOut}
          contract={contract}
        />

        <EditContractComponent
          onClose={() => setShowEdit(false)}
          open={showEdit}
          contract={contract}
        />
      </div>
    </div>
  );
};

export default ContractComponent;
