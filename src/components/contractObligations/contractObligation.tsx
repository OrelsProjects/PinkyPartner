import React, { useMemo } from "react";
import { toast } from "react-toastify";
import { Logger } from "../../logger";
import { useAppSelector } from "../../lib/hooks/redux";
import { useObligations } from "../../lib/hooks/useObligations";
import { cn } from "../../lib/utils";
import {
  dateToDayString,
  daysOfWeek,
  isDateSameDay,
  getWeekRangeFormatted,
} from "../../lib/utils/dateUtils";
import { UserContractObligationData } from "../../models/userContractObligation";
import { UserAvatar } from "../ui/avatar";
import { Checkbox } from "../ui/checkbox";
import Contract from "../../models/contract";
import NotificationBadge from "../ui/notificationBadge";

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
  if (!obligations.length) return null;

  const { user } = useAppSelector(state => state.auth);
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
    // const completed = !!obligation.completedAt;

    try {
      setLoadingObligationDays(prev => ({
        ...prev,
        [day]: true,
      }));
      if (!completed) {
        // show yes no alert
        const shouldContinue = window.confirm(
          "Are you sure you want to mark this obligation as incomplete?",
        );
        if (!shouldContinue) {
          return;
        }
      }
      await completeObligation(obligation, contract.contractId, completed);
      if (completed) {
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
        <div className="w-full h-full flex flex-row gap-1 justify-start items-center">
          <span className="text-card-foreground">
            {userContractObligation.obligation.emoji}
          </span>
          <h1 className="font-semibold text-lg lg:text-2xl tracking-wide">
            {contract.title}
          </h1>
        </div>
        <div className="flex flex-col justify-between items-start h-fit w-full gap-1">
          <h2 className="font-thin">{getWeekRangeFormatted()}</h2>
          {obligationsDays.map((day, index) => {
            return (
              <div
                className={cn(
                  "rounded-lg h-16 w-full bg-card flex flex-row justify-between items-start gap-3 p-2 shadow-sm duration-200 relative",
                  {
                    "bg-card/50": isObligationCompleted(day),
                  },
                )}
                key={`obligation-in-contract-${day}`}
                data-onboarding-id={`${index === 0 ? "home-start-doing" : ""}`}
              >
                {isNewObligation(day) && (
                  <NotificationBadge
                    className="h-2.5 w-2.5  absolute -top-1 left-0.5 bg-primary bg-red-500 text-xs font-semibold rounded-full"
                    count={1}
                  />
                )}
                <div
                  className={cn(
                    "h-full flex flex-col gap-1 flex-shrink-1 items-start justify-center",
                    {
                      "opacity-50": isObligationCompleted(day),
                    },
                  )}
                >
                  <div className="flex flex-row gap-3 justify-center items-center">
                    <span
                      className={cn(
                        "text-card-foreground line-clamp-1 font-medium",
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn("transition-all  duration-200", {
                            "line-through text-muted-foreground font-normal":
                              isObligationCompleted(day),
                          })}
                        >
                          {userContractObligation.obligation.title}
                        </span>
                        <span className="text-foreground text-sm font-thin">
                          {day}
                        </span>
                      </div>
                    </span>
                  </div>
                </div>
                <div className="self-center flex flex-row gap-6">
                  <div className="self-center flex flex-row gap-3">
                    <UserAvatar
                      displayName={user?.displayName}
                      photoURL={user?.photoURL}
                      className={cn("h-9 w-9", {
                        "border-2 border-green-500 rounded-full":
                          isObligationCompleted(day),
                      })}
                      imageClassName={cn()}
                    />
                    {partnerDetails && (
                      <UserAvatar
                        displayName={partnerDetails?.displayName}
                        photoURL={partnerDetails?.photoURL}
                        className={cn("h-9 w-9", {
                          "border-2 border-green-500 rounded-full":
                            isPartnerObligationCompleted(day),
                        })}
                        badgeClassName="w-full h-full flex justify-center items-center rounded-full"
                        imageClassName={cn({ "opacity-50": !isPartnerSigned })}
                        tooltipContent={
                          isPartnerSigned ? "" : "Partner didn't sign yet"
                        }
                      />
                    )}
                  </div>
                  <Checkbox
                    className="w-7 md:w-8 h-7 md:h-8 self-center rounded-lg border-foreground/70 data-[state=checked]:bg-gradient-to-t data-[state=checked]:from-primary data-[state=checked]:to-primary-lighter data-[state=checked]:text-foreground data-[state=checked]:border-primary"
                    checked={isObligationCompleted(day)}
                    onCheckedChange={(checked: boolean) => {
                      handleCompleteObligation(day, checked);
                    }}
                    variant="default"
                    loading={loadingObligationDays[day]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )
  );
};

export default ObligationsComponent;
