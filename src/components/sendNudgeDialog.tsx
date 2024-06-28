"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ContractWithExtras } from "../models/contract";
import { Button } from "./ui/button";

const nudges = [
  "Hey, stop binging Netflix!",
  "I see you're procrastinating again...",
  "You've been scrolling for a while now...",
];

interface SendNudgeDialogProps {
  contract: ContractWithExtras;
  onNudgeSelected: (contract: ContractWithExtras, nudge: string) => void;
  children: React.ReactNode;
}

const SendNudgeDialog: React.FC<SendNudgeDialogProps> = ({
  contract,
  onNudgeSelected,
  children,
}) => {
  const [selectedNudge, setSelectedNudge] = React.useState<string>(nudges[0]);
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose nudge</DialogTitle>
          <DialogDescription>
            What do you think your partner is doing right now?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {nudges.map(nudge => (
            <button
              key={nudge}
              onClick={() => setSelectedNudge(nudge)}
              className={`p-2 w-full rounded-lg focus:outline-none transition-colors ${
                selectedNudge === nudge
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card"
              }`}
            >
              {nudge}
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={() => onNudgeSelected(contract, selectedNudge)}
            disabled={!selectedNudge}
            variant="secondary"
          >
            Send Nudge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendNudgeDialog;
