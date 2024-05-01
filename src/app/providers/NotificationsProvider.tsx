"use client";

import React, { useEffect } from "react";
import { messaging } from "../../../firebase.config";
import { getUserToken } from "../../lib/services/notification";
import { onMessage } from "firebase/messaging";

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const init = async () => {
    const token = await getUserToken();
  };

  onMessage(messaging, payload => {
    alert("Message received. Title: " + payload.notification?.title);
  });

  useEffect(() => {
    init();
  }, []);

  return children;
};

export default NotificationsProvider;
