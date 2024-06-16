import React, { useEffect, useMemo } from "react";
import {
  EmailIcon,
  EmailShareButton,
  TelegramIcon,
  TelegramShareButton,
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
  id?: string;
  open?: boolean;
  buttonText: string;
  className?: string;
  onClose?: () => void;
  contract?: Contract;
  referralCode?: string;
  variant?: ButtonVariants;
}

const InvitePartnerComponent: React.FC<InvitePartnerComponentProps> = ({
  buttonText,
  referralCode,
  className,
  variant,
  contract,
  onClose,
  open,
  id,
}) => {
  const [isOpen, setIsOpen] = React.useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

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
      return `Join my contract to: ${contract.title} on PinkyPartner!`;
    } else {
      return "Join me on PinkyPartner!";
    }
  }, [contract]);

  const body = useMemo(() => {
    if (contract) {
      return `Join my contract to: ${contract.title} on PinkyPartner!`;
    } else {
      return "Join me on PinkyPartner!";
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
    <div className="w-full flex flex-row gap-6 justify-start items-center overflow-auto">
      <div className="flex justify-center items-center flex-col flex-shrink-0">
        <div
          className="w-16 h-16 flex justify-center items-center flex-col rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
          onClick={e => {
            EventTracker.track("share_copy_link");
            handleCopyLink();
            e.stopPropagation();
          }}
        >
          <FaCopy size={32} />
        </div>
        <span>Copy Link</span>
      </div>
      <WhatsappShareButton
        title={summary}
        url={url}
        className="flex items-center justify-center flex-col"
        onClick={() => {
          EventTracker.track("share_whatsapp");
        }}
      >
        <WhatsappIcon size={64} round={true} />
        <span>Whatsapp</span>
      </WhatsappShareButton>
      <TelegramShareButton
        title={summary}
        url={url}
        className="flex items-center justify-center flex-col"
        onClick={() => {
          EventTracker.track("share_telegram");
        }}
      >
        <TelegramIcon size={64} round={true} />
        <span>Telegram</span>
      </TelegramShareButton>
      <EmailShareButton
        subject={summary}
        url={url}
        body={body}
        className="flex items-center justify-center flex-col"
        onClick={() => {
          EventTracker.track("share_email");
        }}
      >
        <EmailIcon size={64} round={true} />
        <span>Email</span>
      </EmailShareButton>
    </div>
  );

  if (contract?.contractId === "temp") {
    return;
  }

  return (
    <Dialog
      onOpenChange={value => {
        EventTracker.track("invite_partner_dialog", { open: value });
        setIsOpen(value);
        if (!value) {
          onClose?.();
        }
      }}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant={variant || "link"}
          className={cn(className)}
          data-onboarding-id="invite-partner-button"
          onClick={e => {
            e.stopPropagation();
            EventTracker.track("Invite Partner", { id });
            setIsOpen(true);
          }}
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full h-[18rem]">
        <ShareButtons />
      </DialogContent>
    </Dialog>
  );
};

export default InvitePartnerComponent;
