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
import { canUseNotifications, isMobilePhone } from "../utils/notificationUtils";
import { UserId } from "../../models/appUser";
import CantBeNudgedError from "../../models/errors/CantBeNudgedError";
import { useState } from "react";
import Contract from "../../models/contract";

export default function useNotifications() {
  const dispatch = useAppDispatch();
  const { status, newContracts, newObligations } = useAppSelector(
    state => state.notifications,
  );
  const {
    partnerData: { contractObligations: partnerContractObligations },
  } = useAppSelector(state => state.obligations);

  const [loadingNudge, setLoadingNudge] = useState<{ [key: string]: boolean }>(
    {},
  );
  const { user } = useAppSelector(state => state.auth);

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
    // Notification.requestPermission().then(permission => {

    //   if (permission === "granted") {
    //     if ("serviceWorker" in navigator && "PushManager" in window) {
    //       navigator.serviceWorker
    //         .register("/firebase-messaging-sw.js")
    //         .then(registration => {
    //           registration.showNotification(notification.title, {
    //             body: notification.body,
    //           });

    //           new Notification(notification.title, {
    //             body: notification.body,
    //           });
    //         });
    //     }
    //   }
    // });
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

  async function nudgePartner(to: UserId, contract: Contract, title: string) {
    if (loadingNudge[contract.contractId]) return;
    try {
      setLoadingNudge({
        [contract.contractId]: true,
      });
      const from = user?.displayName?.split(" ")?.[0] || "Partner";
      await axios.post(`/api/notifications`, {
        title,
        body: `${from} reminds you to complete ${contract.title}.`,
        userId: to,
        type: "nudge",
      });
    } catch (error: any) {
      if (error.response?.status === 429) {
        const {
          nextNudgeTimeHours,
          nextNudgeTimeMinutes,
          nextNudgeTimeSeconds,
        } = error.response.data;
        throw new CantBeNudgedError(
          nextNudgeTimeHours,
          nextNudgeTimeMinutes,
          nextNudgeTimeSeconds,
        );
      }
      Logger.error("Failed to nudge partner", { error });
    } finally {
      setLoadingNudge({
        [contract.contractId]: false,
      });
    }
  }

  async function requestNotificationsPermission(
    initToken?: boolean,
  ): Promise<boolean> {
    if (!canUseNotifications()) {
      return false;
    }
    if (isPermissionGranted()) {
      return true;
    } else {
      initMessaging();
      const permissionResponse = await Notification.requestPermission();
      if (permissionResponse === "granted" && initToken) {
        await initNotifications();
      }
      return permissionResponse === "granted";
    }
  }

  /**
   * @returns push token or error message
   */
  async function initNotifications(): Promise<void> {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then(registration => {
            console.log(
              "ServiceWorker registration successful with scope: ",
              registration.scope,
            );
          })
          .catch(error => {
            console.log("ServiceWorker registration failed: ", error);
          });
      });
    }
    let pushToken = "";
    try {
      initMessaging();
      pushToken = (await getUserToken()) || "no-token";
      if (isMobilePhone()) {
        await axios.patch("/api/user", { pushTokenMobile: pushToken });
      } else {
        await axios.patch("/api/user", { pushToken });
      }
    } catch (e: any) {
      Logger.error("Failed to get token", {
        data: {
          error: e,
          token: pushToken,
        },
      });
    }
  }

  return {
    newContracts,
    loadingNudge,
    nudgePartner,
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
