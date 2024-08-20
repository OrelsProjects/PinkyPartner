import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../lib/hooks/redux";
import { cn } from "../../lib/utils";
import { UserAvatar } from "../ui/avatar";
import NotificationBadge from "../ui/notificationBadge";
import ObligationCheckbox from "./obligationCheckbox";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "../ui/dialog";

export const ObligationBox = ({
  day,
  dummy,
  index,
  title,
  emoji,
  loading,
  disabled,
  className,
  forceSound,
  isCompleted,
  userPhotoUrl,
  partnersDetails,
  isNewObligation,
  handleCompleteObligation,
}: {
  day: string;
  index: number;
  title: string;
  emoji?: string;
  dummy?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  forceSound?: boolean;
  isCompleted: boolean;
  isNewObligation?: boolean;
  partnersDetails?: {
    isSigned?: boolean;
    photoURL?: string | null;
    displayName?: string | null;
    isObligationCompleted?: boolean;
  }[];
  userPhotoUrl?: string | null; // For landing page
  handleCompleteObligation: (day: string, completed: boolean) => void;
}) => {
  const { user } = useAppSelector(state => state.auth);

  return (
    <div
      className={cn(
        "rounded-lg h-16 w-full bg-card p-px duration-500 transition-all relative",
        {
          "bg-card/50": isCompleted,
        },
        { "pointer-events-none": disabled },
        className,
      )}
      key={`obligation-in-contract-${day}`}
    >
      <div
        className={cn(
          "w-full h-full flex flex-row justify-between items-start gap-3  bg-card rounded-lg p-2",
        )}
      >
        {isNewObligation && (
          <NotificationBadge
            className="h-2.5 w-2.5  absolute -top-1 left-0.5 bg-primary bg-red-500 text-xs font-semibold rounded-full"
            count={1}
          />
        )}
        <div className="self-center flex flex-row gap-2">
          <ObligationCheckbox
            day={day}
            index={index}
            disabled={disabled}
            loading={loading}
            isCompleted={isCompleted}
            onCompletedChange={(day: string, checked: boolean) => {
              handleCompleteObligation(day, checked);
            }}
            dummy={dummy}
            forceSound={forceSound || dummy}
          />
          <div
            className={cn(
              "h-full flex flex-col gap-1 flex-shrink-1 items-start justify-center",
              {
                "opacity-50 line-through": isCompleted,
              },
            )}
          >
            <div className="h-full flex flex-row gap-3 justify-center items-center">
              <div
                className={cn(
                  "w-fit h-full text-card-foreground line-clamp-1 font-medium",
                )}
              >
                <div className="h-fit w-fit flex flex-col gap-0.5 flex-shrink">
                  <span
                    className={cn(
                      "transition-all  duration-500 line-clamp-1 w-fit",
                      {
                        "text-muted-foreground font-normal": isCompleted,
                      },
                    )}
                  >
                    {emoji} {title}
                  </span>
                  <span className="text-foreground text-sm font-thin">
                    {day}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-center flex flex-row gap-3 flex-shrink-0">
          {partnersDetails && (
            <UsersIndicator
              userData={{
                isSigned: true,
                photoURL: userPhotoUrl || user?.photoURL,
                displayName: user?.displayName,
                isObligationCompleted: isCompleted,
              }}
              partnersData={partnersDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ObligationStatus = ({
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

interface UserIndicatorProps {
  isSigned?: boolean;
  photoURL?: string | null;
  displayName?: string | null;
  showTooltip?: boolean;
  showStatus?: boolean;
  isObligationCompleted?: boolean;
  className?: string;
}

const UserIndicator = ({
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
      {partnerComponent ? (
        partnerComponent
      ) : (
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
          <DialogContent className="h-[50%]">
            <DialogHeader>Partners</DialogHeader>
            <div className="w-full flex flex-col justify-start items-start gap-4 overflow-auto pb-2">
              {
                partnersData?.map((partner, index) => (
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
      )}
    </div>
  );
};
