import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { cn } from "../../lib/utils";
import {
  ObligationStatus,
  UserIndicator,
  UserIndicatorProps,
} from "./usersIndicator";

export interface ExtraPartnersComponentProps {
  partnersData: UserIndicatorProps[];
  partnersCount: number;
  didAllPartnersCompleteObligation?: boolean;
}

export default function ExtraPartnersComponent({
  partnersData,
  partnersCount,
  didAllPartnersCompleteObligation,
}: ExtraPartnersComponentProps) {
  return (
    <Dialog>
      <DialogTrigger className="absolute z-20">
        <div
          className={cn(
            "w-10 h-10 bg-card flex justify-center items-center rounded-full border-[2px] border-muted-foreground/30",
            {
              "!border-green-500": didAllPartnersCompleteObligation,
            },
          )}
        >
          <span className="text-muted-foreground text-center text-xs">
            {partnersCount >= 100 ? "99+" : `+${partnersCount}`}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="h-fit max-h-[50%]">
        <DialogHeader>Partners</DialogHeader>
        <div className="w-full flex flex-col justify-start items-start gap-4 overflow-auto pb-2">
          {partnersData?.map((partner, index) => (
            <div key={index} className="flex flex-row gap-1">
              <UserIndicator
                showStatus={false}
                {...partner}
                className={cn({
                  "border-green-500": partner.isObligationCompleted,
                })}
              />
              <div className="h-full justify-center flex flex-col gap-0">
                <span className="text-foreground font-medium text-sm">
                  {partner.displayName}
                </span>
                <ObligationStatus
                  isSigned={partner.isSigned}
                  isObligationCompleted={partner.isObligationCompleted}
                />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
