"use client";
import axios from "axios";
import { messaging, getUserToken } from "../../../firebase.config";
import { Logger } from "../../logger";

function isNotificationSupported() {
  return "Notification" in window;
}

function isPermissionGranted() {
  return Notification.permission === "granted";
}

export async function sendPushNotification(
  title: string,
  body: string,
  image: string,
  token: string,
) {
  if (!isNotificationSupported()) {
    return;
  }

  if (!isPermissionGranted()) {
    return;
  }

  const message = {
    notification: {
      title,
      body,
      image,
    },
    token,
  };
}

export async function requestPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    // alert("Notifications not supported");
    return false;
  }
  if (isPermissionGranted()) {
    // alert("Permission already granted");
    return true;
  } else {
    // alert("Requesting permission");
    const permissionResponse = await Notification.requestPermission();
    // alert(permissionResponse);
    return permissionResponse === "granted";
  }
}

export function createNotification(title: string, body: string, image: string) {
  if (!isNotificationSupported()) {
    return;
  }
  if (isPermissionGranted()) {
    new Notification(title, { body, icon: image });
  }
}

/**
 * This function registers the service worker and initializes push notifications
 * @returns
 */
export async function getToken(): Promise<string | undefined> {
  if (!("serviceWorker" in navigator)) {
    return "service-worker-not-supported";
  }
  if (isNotificationSupported()) {
    const permissionGranted = await requestPermission();
    if (!permissionGranted) {
      return "permission-denied";
    }
  } else {
    Logger.error("Notifications not supported");
    return "notifications-not-supported";
  }

  try {
    const token = await getUserToken();
    await axios.patch("/api/user", { token });
    return token;
  } catch (e: any) {
    Logger.error("Failed to get token", e);
    return "failed-to-get-token" + e.message;
  }
}
