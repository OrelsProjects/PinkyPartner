import React, { useMemo } from "react";
import { AccountabilityPartner } from "../models/appUser";
import AccountabilityPartnerComponent, {
  AccountabilityPartnerComponentLoading,
} from "./accountabilityPartnerComponent";
import { useContracts } from "../lib/hooks/useContracts";
import { useAppSelector } from "../lib/hooks/redux";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import ContractViewComponent from "./contractViewComponent";
import Contract from "../models/contract";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";

interface ContractComponentProps {
  contract: Contract;
}

export const ContractComponentLoading = ({
  className,
}: {
  className?: string;
}) => (
  <div
    className={cn(
      "w-full md:w-5/12 h-60 border border-muted-foreground/50 rounded-md flex flex-col justify-between gap-1 p-3",
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
  const { user } = useAppSelector(state => state.auth);

  const isUserSigned = useMemo(
    () =>
      contract.signatures.some(signature => signature.userId === user?.userId),
    [contract.signatures, user],
  );

  const handleSignContract = () => {
    toast.promise(signContract(contract.contractId, user), {
      pending: "Signing contract...",
      success: "Contract signed!",
      error: "Failed to sign contract",
    });
  };

  return (
    <div className="w-full md:w-5/12 h-60 border border-muted-foreground/50 rounded-md flex flex-col justify-between gap-1 p-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <h1 className="font-semibold text-lg truncate">{contract.title}</h1>
          {user &&
            (!isUserSigned ? (
              <Button onClick={handleSignContract} className="relative">
                Sign contract
                <div className="shimmer-wrapper"></div>
              </Button>
            ) : (
              <ContractViewComponent contract={contract} />
            ))}
        </div>
        <h3 className="font-normal text-base line-clamp-2">
          {contract.description}
        </h3>
        <h4 className="font-normal text-base text-muted-foreground truncate">
          {new Date(contract.dueDate).toDateString()}
        </h4>
      </div>
      <div className="w-full flex flex-row justify-around md:justify-start gap-1 md:gap-3">
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
