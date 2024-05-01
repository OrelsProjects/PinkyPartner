"use client";

import React, { useEffect } from "react";
import { messaging } from "../../../firebase.config";
import { getToken } from "../../lib/services/notification";
import { onMessage } from "firebase/messaging";
import axios from "axios";

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const init = async () => {
    const token = await getToken();
    await axios.patch("/api/user", { token });
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
