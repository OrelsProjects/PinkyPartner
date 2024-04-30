"use client";

import React, { useEffect } from "react";
import { getUserToken } from "../../lib/services/notification";
import { onMessage } from "firebase/messaging";
import { messaging } from "../../../firebase.config";

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const init = async () => {
    await getUserToken();
    onMessage(messaging, payload => {
      alert(JSON.stringify(payload, null, 2));
    });
  };

  useEffect(() => {
    init();
  }, []);

  return children;
};

export default NotificationsProvider;
