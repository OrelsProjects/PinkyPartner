import React, { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Logger } from "../../logger";
import { useAppSelector } from "../../lib/hooks/redux";
import { useObligations } from "../../lib/hooks/useObligations";
import { cn } from "../../lib/utils";
import {
  dateToDayString,
  daysOfWeek,
  isDateSameDay,
} from "../../lib/utils/dateUtils";
import { UserContractObligationData } from "../../models/userContractObligation";
import { UserAvatar } from "../ui/avatar";
import Contract from "../../models/contract";
import NotificationBadge from "../ui/notificationBadge";
import ObligationCheckbox from "./obligationCheckbox";
import { ObligationBox } from "./obligationBox";

const ObligationsComponent = ({
  newObligations,
  obligations,
  partnersData,
  contract,
}: {
  contract: Contract;
  newObligations: UserContractObligationData[];
  obligations: UserContractObligationData[];
  partnersData?: {
    partnerId: string;
    isSigned: boolean;
    data: UserContractObligationData[];
  }[];
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

  const daysObligationsCompletedPartner: { partnerId: string; data: Date[] }[] =
    useMemo(() => {
      // patnerId to {completedAt, dueDate}
      return (
        partnersData?.reduce(
          (acc: { partnerId: string; data: Date[] }[], partnerData) => {
            return partnerData.data.reduce((acc, { completedAt, dueDate }) => {
              if (completedAt && dueDate) {
                acc.push({
                  partnerId: partnerData.partnerId,
                  data: [new Date(dueDate)],
                });
              }
              return acc;
            }, acc);
          },
          [],
        ) || []
      );
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
        // const shouldContinue = window.confirm(
        //   "Are you sure you want to mark this promise as incomplete?",
        // );
        // if (!shouldContinue) {
        //   return;
        // }
      } else {
        const hasPartner = partnersData && partnersData.length > 0;
        const partnerName = hasPartner
          ? partnersData.length > 1
            ? "Your partners"
            : partnersData[0].data[0].appUser.displayName
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

  const isPartnerObligationCompleted = useCallback(
    (partnerId: string, day: string) =>
      daysObligationsCompletedPartner?.some(
        data =>
          data.partnerId === partnerId &&
          data.data.some(date => isDateSameDay(day, date)),
      ),
    [daysObligationsCompletedPartner],
  );

  const isNewObligation = (day: string) =>
    newObligations.some(
      obligation =>
        obligation.dueDate && isDateSameDay(day, obligation.dueDate),
    );

  const partnerDetails = useCallback(
    (partnerId: string) => {
      const partnerData = partnersData?.find(
        partner => partner.partnerId === partnerId,
      );
      if (partnerData) {
        return {
          photoURL: partnerData.data[0].appUser.photoURL,
          displayName: partnerData.data[0].appUser.displayName,
        };
      }
      return null;
    },
    [partnersData],
  );

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
                partnersDetails={
                  partnersData?.map(({ isSigned, partnerId }) => ({
                    isSigned,
                    photoURL: partnerDetails(partnerId)?.photoURL,
                    displayName: partnerDetails(partnerId)?.displayName,
                    isObligationCompleted: isPartnerObligationCompleted(
                      partnerId,
                      day,
                    ),
                  })) || []
                }
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
