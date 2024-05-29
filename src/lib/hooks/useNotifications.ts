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
import { getUserToken, initMessaging } from "../../../firebase.config";
import { Logger } from "../../logger";
import { error } from "console";
import { canUseNotifications } from "../utils/notificationUtils";

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

  const didRequestPermission = () => {
    return localStorage.getItem("notificationPermissionRequested") === "true";
  };

  const setPermissionRequested = () => {
    localStorage.setItem("notificationPermissionRequested", "true");
  };

  const isPermissionGranted = () => {
    return Notification?.permission === "granted";
  };

  async function requestNotificationsPermission(): Promise<boolean> {
    if (!canUseNotifications()) {
      return false;
    }
    if (isPermissionGranted()) {
      return true;
    } else {
      initMessaging();
      const permissionResponse = await Notification.requestPermission();
      return permissionResponse === "granted";
    }
  }

  /**
   * @returns push token or error message
   */
  async function initNotifications(): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      Logger.error("Service worker not supported");
    }
    let token = "";
    try {
      initMessaging();
      token = (await getUserToken()) || "no-token";
      await axios.patch("/api/user", { token });
    } catch (e: any) {
      Logger.error("Failed to get token", {
        data: {
          error: e,
          token,
        },
      });
    }
  }

  return {
    newContracts,
    newObligations,
    showNotification,
    initNotifications,
    isPermissionGranted,
    didRequestPermission,
    markContractsAsViewed,
    setPermissionRequested,
    markObligationsAsViewed,
    requestNotificationsPermission,
  };
}
