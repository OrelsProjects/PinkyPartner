"use client";

import { useAppDispatch, useAppSelector } from "./redux";
import { setViewedAt } from "../features/obligations/obligationsSlice";
import axios from "axios";
import { updatedManyContracts } from "../features/contracts/contractsSlice";
import {
  NotificationData,
  setNewContracts,
  setNewObligations,
  setStatus,
} from "../features/notifications/notificationsSlice";
import NotificationComponent from "../../components/ui/notificationComponent";
import { toast } from "react-toastify";

export default function useNotifications() {
  const dispatch = useAppDispatch();
  const { status, newContracts, newObligations } = useAppSelector(
    state => state.notifications,
  );
  const {
    partnerData: { contractObligations: partnerContractObligations },
  } = useAppSelector(state => state.obligations);

  const markObligationsAsViewed = async () => {
    try {
      if (newObligations.length === 0) return;
      if (status === "loading") return;
      dispatch(setStatus("loading"));
      await axios.post(`/api/obligations/viewed`, {
        obligations: newObligations,
      });
      dispatch(setNewObligations([]));

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

      await axios.post(`/api/contracts/viewed`, {
        contractIds: newContracts.map(contract => contract.contractId),
      });
      const updatedContracts = newContracts.map(contract =>
        !contract.viewedAt
          ? { ...contract, viewedAt: new Date().toISOString() }
          : contract,
      );
      dispatch(setNewContracts([]));
      dispatch(updatedManyContracts(updatedContracts));
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

  const getPermission = async () => {
    if (!("serviceWorker" in navigator)) {
      alert("Service worker not supported");
      return;
    }
    if (Notification.permission === "granted") {
      debugger;
      alert("Permission already granted");
      return;
    }
    const permission = await Notification.requestPermission();
    alert(permission);
  };

  return {
    newContracts,
    newObligations,
    getPermission,
    markObligationsAsViewed,
    markContractsAsViewed,
    showNotification,
  };
}
