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
} from "@/components/ui/dialog";
import { ContractWithExtras } from "../models/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const NudgeInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <Input
      value={value}
      onChange={onChange}
      max={32}
      maxLength={32}
      placeholder="Enter custom nudge"
      className="p-2 w-full rounded-lg focus:outline-none transition-colors bg-card"
    />
  );
};

const SendNudgeDialog: React.FC<SendNudgeDialogProps> = ({
  contract,
  onNudgeSelected,
  children,
}) => {
  const [selectedNudge, setSelectedNudge] = React.useState<string>(nudges[0]);
  const [customNudge, setCustomNudge] = React.useState<string>("");

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
            <Button
              key={nudge}
              onClick={() => setSelectedNudge(nudge)}
              variant="secondary"
              className={`p-2 w-full rounded-lg focus:outline-none transition-colors ${
                selectedNudge === nudge
                  ? "bg-secondary text-secondary-foreground border-[1px] border-black/70"
                  : "bg-card"
              }`}
            >
              {nudge}
            </Button>
          ))}
          <NudgeInput
            value={customNudge}
            onChange={e => {
              setSelectedNudge(e.target.value);
              setCustomNudge(e.target.value);
            }}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => onNudgeSelected(contract, selectedNudge)}
            disabled={!selectedNudge}
            variant="outline"
            className="bg-transparent hover:bg-transparent"
          >
            Send Nudge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendNudgeDialog;
