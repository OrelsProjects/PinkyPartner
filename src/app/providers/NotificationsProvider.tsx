"use client";

import React, { useEffect } from "react";
import { messaging } from "../../../firebase.config";
import { getToken } from "../../lib/services/notification";
import { Messaging, onMessage } from "firebase/messaging";
import axios from "axios";

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const init = async (messaging: Messaging) => {
    const token = await getToken();
    await axios.patch("/api/user", { token });

    onMessage(messaging, payload => {
      alert("Message received. Title: " + payload.notification?.title);
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
