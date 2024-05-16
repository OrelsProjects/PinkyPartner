"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import { ContractWithExtras } from "../../models/contract";
import { setViewedAt } from "../features/obligations/obligationsSlice";
import axios from "axios";
import { setContracts } from "../features/contracts/contractsSlice";
import {
  NotificationData,
  setShownContractNotification,
  setStatus,
} from "../features/notifications/notificationsSlice";
import NotificationComponent from "../../components/ui/notificationComponent";
import { toast } from "react-toastify";
import UserContractObligation, {
  UserContractObligationData,
} from "../../models/userContractObligation";
import { usePathname } from "next/navigation";

const MIN_DELAY_BETWEEN_NOTIFICATIONS = 1000 * 60; // 1 minute

export default function useNotifications() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { didShowContractNotification, status } = useAppSelector(
    state => state.notifications,
  );
  const { user } = useAppSelector(state => state.auth);
  const {
    partnerData: { contractObligations: partnerContractObligations },
  } = useAppSelector(state => state.obligations);
  const { contracts } = useAppSelector(state => state.contracts);

  const lastShownNewContractsNotification = React.useRef<number>(0);
  const lastShownNewObligationsNotification = React.useRef<number>(0);

  const [newContracts, setNewContracts] = React.useState<ContractWithExtras[]>(
    [],
  );
  const [newObligations, setNewObligations] = React.useState<
    UserContractObligation[]
  >([]);

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
  }, [pathname, newContracts, newObligations]);

  useEffect(() => {
    if (partnerContractObligations.length > 0) {
      const newObligations =
        partnerContractObligations.filter(obligation => !obligation.viewedAt) ||
        [];
      setNewObligations(newObligations);

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
          ),
      );
      setNewContracts(newContracts);
      if (newContracts.length > 0 && canShowContractsNotification()) {
        lastShownNewContractsNotification.current = Date.now();
        const contractees = newContracts.map(contract =>
          contract.contractees.find(
            contractee => contractee.userId !== user?.userId,
          ),
        );
        showNotification({
          title: "New contract!",
          body: `"${contractees.length > 1 ? "Serveral partners" : contractees[0]?.displayName}" sent you a new contract!`,
        });
        dispatch(setShownContractNotification(true));
      }
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

  const markObligationsAsViewed = async () => {
    try {
      if (newObligations.length === 0) return;
      if (status === "loading") return;
      dispatch(setStatus("loading"));
      await axios.post(`/api/obligations/viewed`, {
        obligations: newObligations,
      });
      setNewObligations([]);

      const now = new Date();
      const updatedObligations = partnerContractObligations.map(obligation =>
        !obligation.viewedAt ? { ...obligation, viewedAt: now } : obligation,
      );

      for (const obligation of updatedObligations) {
        dispatch(
          setViewedAt({
            userContractObligationId: obligation.userContractObligationId,
            viewedAt: now,
          }),
        );
      }
      dispatch(setStatus("succeeded"));
    } catch (error) {
      dispatch(setStatus("failed"));
    }
  };

  const markContractsAsViewed = async () => {
    try {
      if (newContracts.length === 0) return;
      if (status === "loading") return;
      dispatch(setStatus("loading"));
      await axios.post(`/api/contracts/viewed`);
      const updatedContracts = newContracts.map(contract =>
        !contract.viewedAt
          ? { ...contract, viewedAt: new Date().toISOString() }
          : contract,
      );
      setNewContracts([]);
      dispatch(setContracts(updatedContracts));
      dispatch(setStatus("succeeded"));
    } catch (error) {
      dispatch(setStatus("failed"));
    }
  };

  const showNotification = async (notification: NotificationData) => {
    const notificationComponent = () => NotificationComponent({ notification });
    toast(notificationComponent, {
      autoClose: 3000,
    });
  };

  // Using firebase messaging, send a push notification to thhe other user in the contract.
  // Before sending, it adds the obligation to the notifications slice.
  // Then, waits 1 minutes before sending the notification.
  // If a new obligation is added, the timeout is reset.

  return {
    newContracts,
    newObligations,
    markObligationsAsViewed,
    markContractsAsViewed,
    showNotification,
  };
}
