"use client";

import React, { useEffect } from "react";
import { messaging } from "../../../firebase.config";
import { getToken } from "../../lib/services/notification";
import { Messaging, onMessage } from "firebase/messaging";
import axios from "axios";
import useNotifications from "../../lib/hooks/useNotifications";

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { showNotification } = useNotifications();
  const init = async (messaging: Messaging) => {
    const token = await getToken();
    await axios.patch("/api/user", { token });

    onMessage(messaging, payload => {
      showNotification({
        title: payload.notification?.title ?? "",
        body: payload.notification?.body ?? "",
        image: payload.notification?.image ?? "",
      });
    });
  };

  useEffect(() => {
    if (messaging) {
      init(messaging);
    }
  }, [messaging]);

  return children;
};

export default NotificationsProvider;
