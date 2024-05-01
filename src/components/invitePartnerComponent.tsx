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
interface InvitePartnerComponentProps {
  buttonText: string;
  referralCode?: string;
  className?: string;
  variant?: ButtonVariants;
}

const InvitePartnerComponent: React.FC<InvitePartnerComponentProps> = ({
  buttonText,
  referralCode,
  className,
  variant,
}) => {
  const url = useMemo(() => {
    const baseUrl = window.location.origin;
    const registerUrl = `${baseUrl}/register`;
    return referralCode
      ? `${registerUrl}?referralCode=${referralCode}`
      : registerUrl;
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
        <Button
          variant={variant || "link"}
          className={cn("py-0 pt-0.5 px-1", className)}
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Great choice!</DialogTitle>
          <DialogDescription>
            Copy this link and send it to your partner to invite them to sign up
            and put their pinky in!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full flex flex-col md:flex-row gap-1 justify-center items-center md:justify-start md:items-start">
          <span className="text-sm text-muted-foreground">{url}</span>
          <Button
            variant="link"
            onClick={handleCopyLink}
            className="py-0 items-start px-1"
          >
            Copy Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvitePartnerComponent;
