import React, { useMemo } from "react";
import { toast } from "react-toastify";
import { Logger } from "@/logger";
import { useAppSelector } from "@/lib/hooks/redux";
import { useObligations } from "@/lib/hooks/useObligations";
import { cn } from "@/lib/utils";
import {
  dateToDayString,
  daysOfWeek,
  isDateSameDay,
} from "@/lib/utils/dateUtils";
import { UserContractObligationData } from "@/models/userContractObligation";
import { UserAvatar } from "../ui/avatar";
import Contract from "@/models/contract";
import NotificationBadge from "../ui/notificationBadge";
import ObligationCheckbox from "./obligationCheckbox";

const UserIndicator = ({
  isSigned,
  photoURL,
  displayName,
  isObligationCompleted,
}: {
  isSigned?: boolean;
  photoURL?: string | null;
  displayName?: string | null;
  isObligationCompleted?: boolean;
}) => {
  if (!displayName && !photoURL) return null;
  const text = isSigned
    ? isObligationCompleted
      ? "Done"
      : "Waiting"
    : "Not signed";

  return (
    <div className="w-16ו flex flex-col justify-center items-center gap-0.5 transition-all">
      <UserAvatar
        displayName={displayName}
        photoURL={photoURL}
        className={cn(
          "h-9 w-9",
          {
            "border-2 border-green-500 rounded-full": isObligationCompleted,
          },
          { "opacity-50": !isSigned },
        )}
      />
      <span
        className={cn("text-[10px] font-thin text-muted-foreground", {
          "text-muted-foreground/60": !isSigned,
        })}
      >
        {text}
      </span>
    </div>
  );
};

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
  partnerDetails,
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
  partnerDetails?: {
    isPartnerSigned?: boolean;
    photoURL?: string | null;
    displayName?: string | null;
    isPartnerObligationCompleted?: boolean;
  };
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
          <UserIndicator
            isSigned={true}
            photoURL={userPhotoUrl || user?.photoURL}
            displayName={user?.displayName}
            isObligationCompleted={isCompleted}
          />
          {partnerDetails && (
            <UserIndicator
              isSigned={partnerDetails.isPartnerSigned}
              photoURL={partnerDetails.photoURL}
              displayName={partnerDetails.displayName}
              isObligationCompleted={
                partnerDetails.isPartnerObligationCompleted
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ObligationsComponent = ({
  isPartnerSigned,
  newObligations,
  obligations,
  partnerData,
  contract,
}: {
  contract: Contract;
  isPartnerSigned?: boolean;
  newObligations: UserContractObligationData[];
  obligations: UserContractObligationData[];
  partnerData?: UserContractObligationData[];
}) => {
  const { state } = useAppSelector(state => state.auth);
  const { completeObligation } = useObligations();
  const [loadingObligationDays, setLoadingObligationDays] = React.useState<
    Record<string, boolean>
  >({});

  const userContractObligation = useMemo(() => {
    if (obligations.length > 0) {
      return obligations[0];
    }
  }, [obligations]);

  // Returns an array of all the indices of days the obligation was completedAt
  const daysObligationsCompleted = useMemo(() => {
    return obligations.reduce((acc: Date[], { completedAt, dueDate }) => {
      if (completedAt && dueDate) {
        acc.push(new Date(dueDate));
      }
      return acc;
    }, []);
  }, [obligations]);

  const daysObligationsCompletedPartner = useMemo(() => {
    return partnerData?.reduce((acc: Date[], { completedAt, dueDate }) => {
      if (completedAt && dueDate) {
        acc.push(new Date(dueDate));
      }
      return acc;
    }, []);
  }, [obligations]);

  const handleCompleteObligation = async (day: string, completed: boolean) => {
    const loading = loadingObligationDays[day];
    if (loading) return;

    const dayInObligationIndex = obligations.findIndex(
      obligation =>
        obligation.dueDate && dateToDayString(obligation.dueDate) === day,
    );

    const obligation = obligations[dayInObligationIndex];

    if (!obligation) return;

    try {
      setLoadingObligationDays(prev => ({
        ...prev,
        [day]: true,
      }));
      if (!completed) {
        // show yes no alert
        const shouldContinue = window.confirm(
          "Are you sure you want to mark this promise as incomplete?",
        );
        if (!shouldContinue) {
          return;
        }
      } else {
        const hasPartner = partnerData && partnerData.length > 0;
        const partnerName = hasPartner
          ? partnerData[0].appUser.displayName
          : "Your partner";
        const completedText = `Good job! ${hasPartner ? `${partnerName} will be notified` : ""}`;
        toast(completedText, {
          autoClose: hasPartner ? 3000 : 1500,
          theme: "light",
        });
      }

      completeObligation(obligation, contract.contractId, completed);
    } catch (e: any) {
      Logger.error(e);
    } finally {
      setLoadingObligationDays(prev => ({
        ...prev,
        [day]: false,
      }));
    }
  };

  const obligationsDays = useMemo(() => {
    if (obligations.length > 0) {
      return obligations[0].obligation.days.map(day => daysOfWeek[day]);
    }
    return [];
  }, [obligations]);

  const isObligationCompleted = (day: string) =>
    daysObligationsCompleted.some(date => isDateSameDay(day, date));

  const isPartnerObligationCompleted = (day: string) =>
    daysObligationsCompletedPartner?.some(date => isDateSameDay(day, date));

  const isNewObligation = (day: string) =>
    newObligations.some(
      obligation =>
        obligation.dueDate && isDateSameDay(day, obligation.dueDate),
    );

  const partnerDetails = useMemo(() => {
    if (partnerData && partnerData.length > 0) {
      return partnerData[0].appUser;
    }
    return null;
  }, [partnerData]);

  return (
    userContractObligation && (
      <div className="w-full h-fit flex flex-col gap-3">
        <div className="flex flex-col justify-between items-start h-fit w-full gap-1">

          {obligationsDays.map((day, index) => {
            return (
              <ObligationBox
                key={`obligation-in-contract-${day}`}
                day={day}
                index={index}
                emoji={userContractObligation.obligation.emoji || ""}
                isCompleted={isObligationCompleted(day)}
                loading={loadingObligationDays[day]}
                title={userContractObligation.obligation.title}
                isNewObligation={isNewObligation(day)}
                partnerDetails={{
                  isPartnerSigned,
                  photoURL: partnerDetails?.photoURL,
                  displayName: partnerDetails?.displayName,
                  isPartnerObligationCompleted:
                    isPartnerObligationCompleted(day),
                }}
                handleCompleteObligation={handleCompleteObligation}
                dummy={state !== "authenticated"}
              />
            );
          })}
        </div>
      </div>
    )
  );
};

export default ObligationsComponent;
