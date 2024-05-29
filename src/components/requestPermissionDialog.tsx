import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";

const titlesMap: Record<PermissionType, string> = {
  notifications: "Make the most out of PinkyPartner",
};

const messagesMap: Record<PermissionType, string> = {
  notifications:
    "To know if your partner is honoring your pinky promise, enable notifications.",
};

export type PermissionType = "notifications";

interface RequestPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  onEnablePermission: (permission: PermissionType) => Promise<void>;
  permission: PermissionType;
}

const RequestPermissionDialog: React.FC<RequestPermissionDialogProps> = ({
  open,
  onClose,
  onEnablePermission,
  permission,
}) => {
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={value => {
          if (!value) {
            onClose();
          }
        }}
      >
        <DialogContent closeOnOutsideClick={false}>
          <DialogTitle>
            <p className="font-bold">{titlesMap[permission]}</p>
          </DialogTitle>
          <DialogDescription>{messagesMap[permission]}</DialogDescription>
          <DialogFooter>
            <div className="w-full flex flex-col justify-center items-center gap-0">
              <Button
                onClick={() => onEnablePermission(permission)}
                className="w-fit"
              >
                Enable notifications
              </Button>
              <Button
                variant="link"
                onClick={() => {
                  onClose();
                }}
              >
                Not now
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestPermissionDialog;
