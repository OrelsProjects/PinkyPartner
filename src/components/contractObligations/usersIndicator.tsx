import { useState, useEffect, useMemo } from "react";
import { cn } from "../../lib/utils";
import { UserAvatar } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import ExtraPartnersComponent from "./extraPartnersComponent";

export const ObligationStatus = ({
  isSigned,
  isObligationCompleted,
}: {
  isSigned?: boolean;
  isObligationCompleted?: boolean;
}) => {
  const text = isSigned
    ? isObligationCompleted
      ? "Done"
      : "Waiting"
    : "Not signed";

  return (
    <span
      className={cn("text-[10px] font-thin text-muted-foreground", {
        "text-muted-foreground/60": !isSigned,
      })}
    >
      {text}
    </span>
  );
};

export interface UserIndicatorProps {
  isSigned?: boolean;
  photoURL?: string | null;
  displayName?: string | null;
  showTooltip?: boolean;
  showStatus?: boolean;
  isObligationCompleted?: boolean;
  className?: string;
}

export const UserIndicator = ({
  isSigned,
  photoURL,
  displayName,
  showTooltip,
  isObligationCompleted,
  showStatus = true,
  className,
}: UserIndicatorProps) => {
  if (!displayName && !photoURL) return null;
  const text = isSigned
    ? isObligationCompleted
      ? "Done"
      : "Waiting"
    : "Not signed";

  return (
    <div
      className={cn(
        "w-16ו flex flex-col justify-center items-center gap-0.5 transition-all",
        className,
      )}
    >
      <UserAvatar
        displayName={displayName}
        photoURL={photoURL}
        hideTooltip={!showTooltip}
        className={cn(
          "h-9 w-9",
          {
            "border-2 border-green-500 rounded-full": isObligationCompleted,
          },
          { "opacity-50": !isSigned },
        )}
      />
      {showStatus && (
        <ObligationStatus
          isSigned={isSigned}
          isObligationCompleted={isObligationCompleted}
        />
      )}
    </div>
  );
};

export const UsersIndicator = ({
  userData,
  partnersData,
}: {
  userData?: UserIndicatorProps;
  partnersData?: UserIndicatorProps[];
}) => {
  const [partnerComponent, setPartnerComponent] =
    useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (!partnersData || partnersData.length === 0) setPartnerComponent(null);
    else if (partnersData.length === 1)
      setPartnerComponent(<UserIndicator {...partnersData[0]} />);
  }, [partnersData]);

  const partnersCount = useMemo(
    () => partnersData?.length || 0,
    [partnersData],
  );

  const didAllPartnersCompleteObligation = useMemo(
    () =>
      partnersData?.every(
        partner => partner.isSigned && partner.isObligationCompleted,
      ),
    [partnersData],
  );

  return (
    <div
      className={cn(
        "w-10 h-full self-center flex flex-row justify-center items-center gap-3 flex-shrink-0 relative",
        { "w-fit": partnersCount <= 1 },
      )}
    >
      <UserIndicator
        {...userData}
        showStatus={partnersCount <= 1}
        className={cn({
          "absolute right-7 z-30": partnersCount > 1,
        })}
      />
      {partnerComponent
        ? partnerComponent
        : partnersCount > 0 && (
            <ExtraPartnersComponent
              partnersData={partnersData || []}
              partnersCount={partnersCount}
              didAllPartnersCompleteObligation={
                didAllPartnersCompleteObligation
              }
            />
          )}
    </div>
  );
};
