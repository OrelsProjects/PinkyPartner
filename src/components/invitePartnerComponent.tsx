import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button, ButtonVariants } from "./ui/button";
import { toast } from "react-toastify";
import { EventTracker } from "../eventTracker";
import { cn } from "../lib/utils";
import Contract from "../models/contract";
interface InvitePartnerComponentProps {
  buttonText: string;
  referralCode?: string;
  className?: string;
  variant?: ButtonVariants;
  contract?: Contract;
}

const InvitePartnerComponent: React.FC<InvitePartnerComponentProps> = ({
  buttonText,
  referralCode,
  className,
  variant,
  contract,
}) => {
  const url = useMemo(() => {
    const baseUrl = window.location.origin;
    const registerUrl = `${baseUrl}/register`;
    let url = referralCode
      ? `${registerUrl}?referralCode=${referralCode}`
      : registerUrl;

    if (contract) {
      url += referralCode
        ? `&contractId=${contract.contractId}`
        : `?contractId=${contract.contractId}`;
    }
    return url;
  }, [referralCode]);

  const handleCopyLink = () => {
    EventTracker.track("Copy Invite Link", { url });
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!", {
      autoClose: 1000,
      delay: 0,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant || "link"} className={cn(className)}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4 h-[18rem]">
        <DialogHeader className="gap-3">
          <DialogTitle>Great choice!</DialogTitle>
          <DialogDescription>
            Copy this link and send it to your partner to invite them to sign up
            and put their pinky in!
          </DialogDescription>
          <DialogDescription>
            Once they join, you will be able to search for them :)
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full !flex flex-col gap-1 justify-center items-center md:!justify-end md:!items-center">
          <Button variant="default" onClick={handleCopyLink}>
            Copy Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvitePartnerComponent;
