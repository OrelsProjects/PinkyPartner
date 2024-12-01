"use client";

import React, { useEffect } from "react";
import { messaging } from "@/../firebase.config";
import { Messaging, onMessage } from "firebase/messaging";
import useNotifications from "@/lib/hooks/useNotifications";
import RequestPermissionDialog from "@/components/requestPermissionDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { canUseNotifications } from "@/lib/utils/notificationUtils";
import { NotificationType, PermissionType } from "@/lib/models/notification";

/**
 * NotificationsProvider Component
 *
 * Purpose:
 * - Initializes the user's notification token for Firebase Cloud Messaging.
 * - Manages dialogs for requesting notification permissions.
 * - Handles incoming notifications and displays them using a custom notification utility.
 * - Manages dialogs when the user denies notification permissions.
 */

const NotificationsProvider = () => {
  const {
    initNotifications: initUserToken, // Initialize user token for notifications
    showNotification, // Function to display notifications
    isPermissionGranted, // Check if notification permissions are granted
    didRequestPermission, // Check if permission was requested before
    setPermissionRequested, // Mark that permission has been requested
    requestNotificationsPermission, // Request permission for notifications
  } = useNotifications();

  // State to control visibility of permission request dialogs
  const [showRequestPermissionDialog, setShowRequestPermissionDialog] =
    React.useState(false);
  const [showPermissionNotGrantedDialog, setShowPermissionNotGrantedDialog] =
    React.useState(false);

  /**
   * Register the service worker for push notifications.
   * This is required to receive push notifications in the browser (Also in the mobile app).
   */
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      console.log("Registering service worker");
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(function (registration) {
          registration.update(); // Check for updates immediately after registering
        });
    }
  }, []);

  /**
   * Initializes the messaging service and sets up an onMessage listener
   * to handle incoming push notifications.
   *
   * @param messaging - Firebase Messaging instance
   */
  const init = async (messaging: Messaging) => {
    await initUserToken(); // Initialize the notification token

    // Listen for incoming messages and display them as notifications
    onMessage(messaging, payload => {
      showNotification({
        title: payload.data?.title ?? "",
        body: payload.data?.body ?? "",
        image: payload.data?.image ?? "",
        type: (payload.data?.type || "response") as NotificationType,
      });
    });
  };

  /**
   * Determine if the request permission dialog should be shown
   * based on the user's notification settings and permission status.
   */
  useEffect(() => {
    const shouldShowRequestPermissionDialog =
      canUseNotifications() &&
      !didRequestPermission() &&
      !isPermissionGranted();

    setShowRequestPermissionDialog(shouldShowRequestPermissionDialog);
  }, []);

  /**
   * Initialize Firebase Messaging when the messaging instance
   * is available.
   */
  useEffect(() => {
    if (messaging) {
      init(messaging);
    }
  }, [messaging]);

  /**
   * Handles the closing of the permission request dialog and updates
   * the notification permission status based on user interaction.
   *
   * @param permission - The type of permission response from the user
   */
  const onCloseRequestPermissionDialog = async (
    permission?: PermissionType,
  ) => {
    if (permission) {
      const granted = await requestNotificationsPermission();
      setPermissionRequested();
      setShowRequestPermissionDialog(false);
      if (granted) {
        const toastId = toast.loading("Saving your settings...");
        await initUserToken(); // Initialize the token if permission is granted
        toast.dismiss(toastId);
        toast("You're all set! 🎉");
      } else {
        setShowPermissionNotGrantedDialog(true);
      }
    } else {
      setPermissionRequested();
      setShowRequestPermissionDialog(false);
      setShowPermissionNotGrantedDialog(true);
    }
  };

  return (
    <>
      {/* Dialog for requesting notification permission */}
      <RequestPermissionDialog
        open={showRequestPermissionDialog}
        onClose={onCloseRequestPermissionDialog}
        onEnablePermission={onCloseRequestPermissionDialog}
        permission="notifications"
      />

      {/* Dialog shown when notification permission is not granted */}
      <Dialog
        open={showPermissionNotGrantedDialog}
        onOpenChange={value => {
          if (!value) {
            setShowPermissionNotGrantedDialog(false);
          }
        }}
      >
        <DialogContent>
          <DialogTitle>We respect your choice.</DialogTitle>
          <DialogDescription>
            You can enable notifications at any time in the settings :)
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowPermissionNotGrantedDialog(false)}>
              Thanks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationsProvider;
