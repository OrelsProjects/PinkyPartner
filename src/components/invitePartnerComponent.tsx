import React, { useMemo } from "react";
import {
  EmailIcon,
  EmailShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button, ButtonVariants } from "./ui/button";
import { toast } from "react-toastify";
import { EventTracker } from "../eventTracker";
import { cn } from "../lib/utils";
import Contract from "../models/contract";
import { FaCopy } from "react-icons/fa";

interface InvitePartnerComponentProps {
  buttonText: string;
  referralCode?: string;
  className?: string;
  variant?: ButtonVariants;
  contract?: Contract;
  id?: string;
}

const InvitePartnerComponent: React.FC<InvitePartnerComponentProps> = ({
  buttonText,
  referralCode,
  className,
  variant,
  contract,
  id,
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

  const summary = useMemo(() => {
    if (contract) {
      return `Join my contract to: ${contract.title} on Pinky Promise!`;
    } else {
      return "Join me on Pinky Promise!";
    }
  }, [contract]);

  const body = useMemo(() => {
    if (contract) {
      return `Join my contract to: ${contract.title} on Pinky Promise!`;
    } else {
      return "Join me on Pinky Promise!";
    }
  }, [contract]);

  const handleCopyLink = () => {
    EventTracker.track("Copy Invite Link", { url });
    navigator.clipboard.writeText(url);
    toast("Copied! Now send it to your friend 😊", {
      autoClose: 3000,
      delay: 0,
    });
  };

  const ShareButtons = () => (
    <div className="flex flex-row gap-3 justify-center items-center">
      <div className="w-16 h-16 flex justify-center items-center rounded-full bg-gray-300 dark:bg-gray-700">
        <FaCopy className="cursor-pointer" size={32} onClick={handleCopyLink} />
      </div>
      <WhatsappShareButton title="Join me on Pinky Promise!" url={url}>
        <WhatsappIcon size={64} round={true} />
      </WhatsappShareButton>
      <EmailShareButton subject={summary} url={url} body={body}>
        <EmailIcon size={64} round={true} />
      </EmailShareButton>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={variant || "link"}
          className={cn(className)}
          data-onboarding-id="invite-partner-button"
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4 h-[18rem]">
        <ShareButtons />
      </DialogContent>
    </Dialog>
  );
};

export default InvitePartnerComponent;
