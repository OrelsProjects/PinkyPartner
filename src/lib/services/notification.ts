"use client";
import { getToken, onMessage } from "firebase/messaging";
import { onBackgroundMessage } from "firebase/messaging/sw";
import { messaging } from "../../../firebase.config";
import { on } from "events";

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
    return false;
  }
  if (isPermissionGranted()) {
    return true;
  } else {
    const permissionResponse = await Notification.requestPermission();
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
export async function getUserToken(): Promise<string> {
  if (!("serviceWorker" in navigator)) {
    return "";
  }
  if (isNotificationSupported()) {
    const permissionGranted = await requestPermission();
    if (!permissionGranted) {
      return ""; // TODO: Throw
    }
  } else {
    return ""; // TODO: Throw
  }

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });

  return token;
  // debugger;
  // navigator.serviceWorker.register("/service-worker.js").then(registration => {
  //   registration.pushManager.getSubscription().then(subscription => {
  //     if (!subscription) {
  //       registration.pushManager.subscribe({
  //         userVisibleOnly: true,
  //         applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  //       });
  //     }
  //   });
  // });
}
