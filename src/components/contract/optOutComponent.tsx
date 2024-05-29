import { Contract } from "@prisma/client";
import React, { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { EventTracker } from "../../eventTracker";
import { Button } from "../ui/button";
import { useContracts } from "../../lib/hooks/useContracts";
import { ContractWithExtras } from "../../models/contract";
import { toast } from "react-toastify";
import { useAppSelector } from "../../lib/hooks/redux";
import { DialogDescription } from "@radix-ui/react-dialog";

interface OptOutComponentProps {
  open?: boolean;
  className?: string;
  onClose?: () => void;
  contract: ContractWithExtras;
}

const OptOutComponent: React.FC<OptOutComponentProps> = ({
  open,
  className,
  onClose,
  contract,
}) => {
  const { user } = useAppSelector(state => state.auth);
  const { optOut } = useContracts();
  const [isOpen, setIsOpen] = React.useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOptOut = () => {
    onClose?.();
    setIsOpen(false);
    toast.promise(optOut(contract?.contractId), {
      pending: "Leaving the contract...",
      success: "You have opted out of the contract",
      error: "Failed to opt out of the contract",
    });
  };

  const isSigned = useMemo(() => {
    return contract?.signatures.some(s => s.userId === user?.userId);
  }, [contract, user]);

  const TextWithPartner = () => {
    return (
      <p>
        By giving up you break the pinky promise you made with{" "}
        <strong>
          {
            contract.contractees.find(c => c.userId !== user?.userId)
              ?.displayName
          }
        </strong>
        .
      </p>
    );
  };

  const TextAlone = () => {
    return <p>Are you sure you want to opt out?</p>;
  };

  const partner = useMemo(() => {
    return contract.contractees.find(c => c.userId !== user?.userId);
  }, [contract, user]);

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
      <DialogContent className="space-y-4 h-[18rem]">
        <DialogTitle>Giving up on {contract?.title}?</DialogTitle>
        <DialogDescription>
          {partner ? <TextWithPartner /> : <TextAlone />}
        </DialogDescription>
        <div className="flex flex-col gap-0">
          <Button
            onClick={e => {
              e.stopPropagation();
              EventTracker.track("Cancelled opt out of contract", {
                contractId: contract?.contractId,
              });
              onClose?.();
            }}
          >
            Nevermind, I&apos;ll{" "}
            {isSigned ? "keep my promise!" : "give it a go."}
          </Button>
          <Button
            onClick={e => {
              e.stopPropagation();
              EventTracker.track("Opted out of contract", {
                contractId: contract?.contractId,
              });
              handleOptOut();
            }}
            variant="link"
            className="text-destructive"
          >
            {isSigned ? "Yes, I give up" : "Opt out"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OptOutComponent;
