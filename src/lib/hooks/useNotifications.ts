"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import Contract from "../../models/contract";
import ObligationCompleted from "../../models/obligationCompleted";
import { setPartnerData } from "../features/obligations/obligationsSlice";
import axios from "axios";
import { setContracts } from "../features/contracts/contractsSlice";
import { NotificationData } from "../features/notifications/notificationsSlice";
import NotificationComponent from "../../components/ui/notificationComponent";
import { toast } from "react-toastify";

const MIN_DELAY_BETWEEN_NOTIFICATIONS = 1000 * 60; // 1 minute

export default function useNotifications() {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector(state => state.auth);
  const { partnerData } = useAppSelector(state => state.obligations);
  const { contracts } = useAppSelector(state => state.contracts);

  const lastShownNewContractsNotification = React.useRef<number>(0);
  const lastShownNewObligationsNotification = React.useRef<number>(0);

  const [newContracts, setNewContracts] = React.useState<Contract[]>([]);
  const [newObligations, setNewObligations] = React.useState<
    ObligationCompleted[]
  >([]);

  useEffect(() => {
    if (partnerData.obligationsCompleted?.length > 0) {
      const newObligations = partnerData.obligationsCompleted.filter(
        obligation => !obligation.viewedAt,
      );
      setNewObligations(newObligations);

      if (newObligations.length > 0 && canShowObligationsNotification()) {
        lastShownNewObligationsNotification.current = Date.now();
        const distinctPartnersObligations = newObligations.reduce(
          (acc, obligation) => {
            if (
              !acc.some(o => o.appUser?.userId === obligation.appUser?.userId)
            ) {
              acc.push(obligation);
            }
            return acc;
          },
          [] as ObligationCompleted[],
        );
        // distinctPartnersObligations.forEach(obligation => {
        //   showNotification({
        //     title: `${obligation.appUser?.displayName || "Your partner"} is progressing!`,
        //     body: `${newObligations.length > 1 ? newObligations.length + " promises" : newObligations[0]?.obligation.title} completed!`,
        //   });
        // });
      }
    }
  }, [partnerData.obligationsCompleted]);

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
        // showNotification({
        //   title: "New contract!",
        //   body: `"${contractees.length > 1 ? "Serveral partners" : contractees[0]?.displayName}" sent you a new contract!`,
        // });
      }
    }
  }, [contracts]);

  const canShowContractsNotification = () => {
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
      await axios.post(`/api/obligations/viewed`, {
        obligations: newObligations,
      });
      const updatedObligations = partnerData.obligationsCompleted.map(
        obligation =>
          !obligation.viewedAt
            ? { ...obligation, viewedAt: new Date().toISOString() }
            : obligation,
      );

      setNewObligations([]);
      dispatch(
        setPartnerData({
          ...partnerData,
          obligationsCompleted: updatedObligations,
        }),
      );
    } catch (error) {}
  };

  const markContractsAsViewed = async () => {
    try {
      if (newContracts.length === 0) return;
      //   await axios.post(`/api/contracts/viewed`);
      const updatedContracts = newContracts.map(contract =>
        !contract.viewedAt
          ? { ...contract, viewedAt: new Date().toISOString() }
          : contract,
      );
      setNewContracts([]);
      dispatch(setContracts(updatedContracts));
    } catch (error) {}
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
