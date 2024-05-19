"use client";

import React, { useEffect } from "react";
import { messaging } from "../../../firebase.config";
import { getToken } from "../../lib/services/notification";
import { Messaging, onMessage } from "firebase/messaging";
import axios from "axios";
import useNotifications from "../../lib/hooks/useNotifications";
import { Logger } from "../../logger";
import { useAppDispatch, useAppSelector } from "../../lib/hooks/redux";
import { usePathname } from "next/navigation";
import {
  setNewObligations,
  setNewContracts,
  setShownContractNotification,
} from "../../lib/features/notifications/notificationsSlice";
import { UserContractObligationData } from "../../models/userContractObligation";

const MIN_DELAY_BETWEEN_NOTIFICATIONS = 1000 * 60; // 1 minute

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { newContracts, newObligations, didShowContractNotification } =
    useAppSelector(state => state.notifications);

  const { showNotification, markContractsAsViewed, markObligationsAsViewed } =
    useNotifications();
  const {
    partnerData: { contractObligations: partnerContractObligations },
  } = useAppSelector(state => state.obligations);
  const { contracts } = useAppSelector(state => state.contracts);
  const { user } = useAppSelector(state => state.auth);

  const lastShownNewContractsNotification = React.useRef<number>(0);
  const lastShownNewObligationsNotification = React.useRef<number>(0);

  const init = async (messaging: Messaging) => {
    try {
      const token = await getToken();
      await axios.patch("/api/user", { token });
    } catch (error: any) {
      Logger.error("Error setting user token", { error });
    }

    onMessage(messaging, payload => {
      showNotification({
        title: payload.data?.title ?? "",
        body: payload.data?.body ?? "",
        image: payload.data?.image ?? "",
      });
    });
  };

  useEffect(() => {
    if (messaging) {
      init(messaging);
    }
  }, [messaging]);

  useEffect(() => {
    let promise: Promise<void> | null = null;
    switch (pathname) {
      case "/contracts":
        promise = markContractsAsViewed();
        break;
      case "/home":
        promise = markObligationsAsViewed();
        break;
    }
    if (promise) {
      setTimeout(async () => {
        await promise;
      }, 3000);
    }
  }, [newContracts, newObligations]);

  useEffect(() => {
    if (partnerContractObligations.length > 0) {
      const newObligations =
        partnerContractObligations.filter(obligation => !obligation.viewedAt) ||
        [];
      dispatch(setNewObligations(newObligations));

      if (newObligations.length > 0 && canShowObligationsNotification()) {
        lastShownNewObligationsNotification.current = Date.now();
        const distinctPartnersObligations = newObligations.reduce(
          (acc, obligation) => {
            if (!acc.some(o => o.userId === obligation.appUser?.userId)) {
              acc.push(obligation);
            }
            return acc;
          },
          [] as UserContractObligationData[],
        );
        distinctPartnersObligations.forEach(obligation => {
          showNotification({
            title: `${obligation.appUser?.displayName || "Your partner"} is progressing!`,
            body: `${newObligations.length > 1 ? newObligations.length + " promises" : newObligations[0]?.obligation.title} completed!`,
          });
        });
      }
    }
  }, [partnerContractObligations]);

  useEffect(() => {
    if (contracts) {
      const newContracts = contracts.filter(
        contract =>
          !contract.signatures.some(
            signature => signature.userId === user?.userId,
          ) && contract.viewedAt,
      );
      debugger;
      dispatch(setNewContracts(newContracts));
      setTimeout(() => {
        if (newContracts.length > 0 && canShowContractsNotification()) {
          dispatch(setShownContractNotification(true));
          lastShownNewContractsNotification.current = Date.now();
          const contractees = newContracts.map(contract =>
            contract.contractees.find(
              contractee => contractee.userId !== user?.userId,
            ),
          );
          // showNotification({
          //   title: "New contract!",
          //   body: `"${contractees.length > 1 ? "Serveral partners" : contractees[0]?.displayName}" sent you a new contract!`,
          // });
        }
      }, 3000);
    }
  }, [contracts]);

  const canShowContractsNotification = () => {
    if (didShowContractNotification) return false;
    const now = Date.now();
    const timeSinceLastNotification =
      now - lastShownNewContractsNotification.current;
    return timeSinceLastNotification > MIN_DELAY_BETWEEN_NOTIFICATIONS;
  };

  const canShowObligationsNotification = () => {
    const now = Date.now();
    const timeSinceLastNotification =
      now - lastShownNewObligationsNotification.current;
    return timeSinceLastNotification > MIN_DELAY_BETWEEN_NOTIFICATIONS;
  };

  return children;
};

export default NotificationsProvider;
