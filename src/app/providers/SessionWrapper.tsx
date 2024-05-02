"use client";
import { SessionProvider } from "next-auth/react";

import React, { useEffect } from "react";
import { initEventTracker } from "../../eventTracker";
import { initLogger } from "../../logger";

const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initLogger();
    initEventTracker();
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
};

export default SessionWrapper;
