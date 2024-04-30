"use client";

import React, { useEffect } from "react";
import { initPushNotifications } from "../../lib/services/notification";

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const init = async () => {
    await initPushNotifications();
  };

  useEffect(() => {
    init();
  }, []);

  return children;
};

export default NotificationsProvider;
